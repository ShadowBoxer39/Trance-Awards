// pages/awards.tsx
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";

// ✅ one source of truth for data & types
import { CATEGORIES } from "@/data/awards-data";
// If you actually need the types, use:
// import type { AwardCategory, AwardNominee } from "@/data/awards-data";


/** ───────────────── BRAND ───────────────── */
const BRAND = {
  logo: "/images/logo.png",
  title: "פרסי השנה 2025",
};

/** ─────────────── SMART-FIT ARTWORK ─────────────── */
function Artwork({ src, alt }: { src?: string; alt: string }) {
  const [isPortrait, setIsPortrait] = React.useState(false);
  return (
    <div className="relative w-full overflow-hidden rounded-t-xl bg-black/60 aspect-square">
      {src ? (
        <img
          src={src}
          alt={alt}
          className={
            "absolute inset-0 h-full w-full object-center " +
            (isPortrait ? "object-contain" : "object-cover")
          }
          onLoad={(e) => {
            const img = e.currentTarget;
            setIsPortrait(img.naturalHeight >= img.naturalWidth);
          }}
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center text-white/50 text-[10px]">
          ללא תמונה
        </div>
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/60 to-transparent" />
    </div>
  );
}

/** ─────────────── GLOBAL AUDIO for 'best-track' ─────────────── */
class GlobalAudio {
  private static _inst: GlobalAudio;
  private current?: HTMLAudioElement | null;
  private listeners = new Set<() => void>();
  static get inst() {
    if (!this._inst) this._inst = new GlobalAudio();
    return this._inst;
  }
  play(src: string) {
    if (this.current) {
      this.current.pause();
      this.current.currentTime = 0;
    }
    const a = new Audio(src);
    void a.play();
    this.current = a;
    a.addEventListener("ended", () => this.notify());
    this.notify();
  }
  stop() {
    if (!this.current) return;
    this.current.pause();
    this.current.currentTime = 0;
    this.current = null;
    this.notify();
  }
  isPlaying(src?: string) {
    return !!this.current && (!src || this.current.src.endsWith(src));
  }
  onChange(cb: () => void) {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }
  private notify() {
    this.listeners.forEach((cb) => cb());
  }
}

/** ─────────────── PAGE ─────────────── */
export default function Awards() {
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
  }, []);

  // re-render when global audio state changes
  const [, force] = useState(0);
  useEffect(() => {
    const unsub = GlobalAudio.inst.onChange(() => force((n) => n + 1));
    return () => unsub();
  }, []);

  const canSubmit = useMemo(
    () => CATEGORIES.every((c) => !!selections[c.id]),
    [selections]
  );

  const choose = (categoryId: string, nomineeId: string) =>
    setSelections((prev) => ({ ...prev, [categoryId]: nomineeId }));

const submitVote = async () => {
  setIsSubmitting(true); // 👈 ADD: Start loading

  try {
    const r = await fetch("/api/submit-vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selections }),
    });

    if (r.ok) {
      try {
        sessionStorage.setItem("lastSelections", JSON.stringify(selections));
      } catch {}
      router.push("/thanks");
      return;
    }

    const j = await r.json().catch(() => ({}));

    if (r.status === 403 || j?.error === "invalid_region") {
      alert("ההצבעה פתוחה לתושבי ישראל בלבד 🇮🇱");
    } else if (r.status === 409 || j?.error === "duplicate_vote") {
      alert("כבר הצבעת מהמכשיר הזה עבור פרסי השנה.");
    } else if (r.status === 400 || j?.error === "bad_request") {
      alert("נראה שחסר מידע להצבעה. נסו שוב.");
    } else {
      alert("שגיאה בשליחת ההצבעה. נסו שוב בעוד רגע.");
    }
  } catch {
    alert("שגיאה בשליחת ההצבעה. נסו שוב בעוד רגע.");
  } finally {
    setIsSubmitting(false); // 👈 ADD: Stop loading (always runs)
  }
};
  return (
    <main className="neon-backdrop min-h-screen text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-white/10 bg-black/40 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src={BRAND.logo}
              alt="יוצאים לטראק"
              width={36}
              height={36}
              className="rounded-full border border-white/15"
            />
            <span className="text-xs sm:text-sm opacity-80">חזרה לדף הראשי</span>
          </Link>
          <div className="ms-auto text-xs sm:text-sm opacity-80">{BRAND.title}</div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 space-y-10">
        {CATEGORIES.map((cat) => (
          <section key={cat.id}>
            <div className="flex items-end justify-between gap-3 mb-3">
              <div>
                <h2 className="gradient-title text-xl sm:text-2xl font-[700] leading-tight">
                  {cat.title}
                </h2>
                {cat.description && (
                  <p className="text-white/70 text-xs sm:text-sm mt-1">{cat.description}</p>
                )}
              </div>
              <div className="text-xs sm:text-sm text-white/60">בחירה אחת</div>
            </div>

            {/* 3 per row on the smallest screens, then 4/6/8 */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
              {cat.nominees.map((n) => {
                const selected = selections[cat.id] === n.id;
                const isTrack = cat.id === "best-track";
                const canPlay = isTrack && !!n.audioPreview;
                const playing = canPlay && GlobalAudio.inst.isPlaying(n.audioPreview!);

                return (
                  <article
                    key={n.id}
                    className={
                      "group relative overflow-hidden rounded-xl glass transition cursor-pointer " +
                      (selected ? "ring-2 ring-[var(--brand-pink)]" : "hover:border-white/25")
                    }
                    onClick={() => choose(cat.id, n.id)}
                  >
                    <Artwork src={n.artwork} alt={n.name} />

                    {/* small track controls (if used) */}
                    {isTrack && canPlay && (
                      <div className="absolute top-1 end-1 z-10">
                        {!playing ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              GlobalAudio.inst.play(n.audioPreview!);
                            }}
                            className="px-2 py-1 text-[11px] rounded-full bg-black/70 border border-white/10 hover:bg-black/90"
                          >
                            ▶︎
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              GlobalAudio.inst.stop();
                            }}
                            className="px-2 py-1 text-[11px] rounded-full bg-black/70 border border-white/10 hover:bg-black/90"
                          >
                            ⏹
                          </button>
                        )}
                      </div>
                    )}

                    {/* Footer: name full width on mobile; button below (prevents text clipping) */}
                    <div className="p-3 flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between xl:gap-3">
 {/* Title area */}
<div className="min-w-0 xl:flex-1">
  <div
  dir="ltr"
  title={n.name}
className="nominee-title clamp-2 clamp-desktop-3 no-hyphen
             font-bold text-[13px] leading-snug text-white
             text-center xl:text-start"
>
  {n.name}
</div>
</div>

{/* Select button */}
<button
  onClick={(e) => { e.stopPropagation(); choose(cat.id, n.id); }}
  className={
    "xl:shrink-0 w-full xl:w-auto px-2.5 py-1.5 rounded-lg border text-[12px] xl:text-xs transition " +
    (selected ? "btn-primary border-transparent" : "btn-ghost")
  }
  aria-pressed={selected}
>
  {selected ? "נבחר" : "בחר"}
</button>
</div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}

        {/* Submit */}
        <div className="glass rounded-2xl p-3 sm:p-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="text-white/80 text-xs sm:text-sm">
              ודאו שבחרתם בכל הקטגוריות. תמיד אפשר לשנות לפני שליחה.
            </div>
            <button
  onClick={submitVote}
  disabled={!canSubmit || isSubmitting}
  className={
    "rounded-2xl px-5 py-2.5 text-sm font-semibold " +
    (canSubmit ? "btn-primary" : "btn-ghost cursor-not-allowed")
  }
>
  {isSubmitting ? "שולח..." : "שליחת ההצבעה"}
</button>
          </div>
        </div>

        <footer className="text-center text-[11px] sm:text-xs text-white/60 py-8">
          © {new Date().getFullYear()} יוצאים לטראק — פרסי השנה.
        </footer>
      </div>
    </main>
  );
}

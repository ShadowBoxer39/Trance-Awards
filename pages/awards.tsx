// pages/awards.tsx
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";

/** ───────────────── BRAND ───────────────── */
const BRAND = {
  logo: "/images/logo.png",
  title: "פרסי השנה 2025",
};

/** ───────────────── TYPES ───────────────── */
export type Nominee = {
  id: string;
  name: string;
  artwork?: string;
  audioPreview?: string; // used only by 'best-track'
};
export type Category = {
  id: string;
  title: string;
  description?: string;
  nominees: Nominee[];
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
    return () => this.listeners.delete(cb);
  }
  private notify() {
    this.listeners.forEach((cb) => cb());
  }
}

/** ─────────────── DATA ─────────────── */
const CATEGORIES: Category[] = [
  {
    id: "best-artist",
    title: "אמן השנה",
    description: "אמן ישראלי שהוציא מוזיקה השנה והכי נתן בראש, כולל ברחבות בארץ",
    nominees: [
      { id: "libra", name: "Libra" },
      { id: "gorovich", name: "Gorovich", artwork: "/images/Gorovich.webp" },
      { id: "freedom-fighters", name: "Freedom Fighters", artwork: "/images/Freedom Fighters.png" },
      { id: "mystic", name: "Mystic", artwork: "/images/Mystic.jpg" },
      { id: "bliss", name: "Bliss", artwork: "/images/bliss.jpg" },
      { id: "cosmic-flow", name: "Cosmic Flow", artwork: "/images/cosmic flow.webp" },
    ],
  },
  {
    id: "best-female-artist",
    title: "אמנית השנה",
    description: "אמנית ישראלית שהוציאה מוזיקה השנה והכי נתנה בראש, כולל ברחבות בארץ",
    nominees: [
      { id: "artmis", name: "Artmis", artwork: "/images/artmis.jpg" },
      { id: "amigdala", name: "Amigdala", artwork: "/images/Amigdala.jpg" },
      { id: "chuka", name: "Chuka", artwork: "/images/chuka.jpg" },
    ],
  },
  {
    id: "best-group",
    title: "הרכב השנה",
    description: "הרכב ישראלי שהוציא מוזיקה השנה והכי נתן בראש, כולל ברחבות בארץ",
    nominees: [
      { id: "bigitam-detune", name: "Bigitam & Detune", artwork: "/images/bigitam & detune.png" },
      { id: "uncharted-territory", name: "Uncharted Territory", artwork: "/images/Uncharted Territory.webp" },
      { id: "humanoids", name: "Humanoids", artwork: "/images/Humanoids.jpg" },
      { id: "outsiders", name: "Outsiders", artwork: "/images/Outsiders.webp" },
      { id: "rising-dust", name: "Rising Dust", artwork: "/images/rising dust.jpg" },
    ],
  },
  {
    id: "best-album",
    title: "אלבום השנה",
    description: "אלבום מלא הכי טוב שיצא השנה",
    nominees: [
      { id: "libra-subjective", name: "Libra - Subjective", artwork: "/images/libra subjective album.jpg" },
      { id: "gorovich-creative", name: "Gorovich - Creative Acts", artwork: "/images/gorovich creative acts album.jpg" },
      { id: "bliss-me-vs-me", name: "Bliss - Me vs Me", artwork: "/images/bliss me vs me album.jpg" },
      { id: "cosmic-flow-infinity", name: "Cosmic Flow - Infinity", artwork: "/images/cosmic flow infinity album.jpg" },
      { id: "2minds-acid", name: "2Minds - Acid Therapy", artwork: "/images/2minds acid therapy album.jpg" },
    ],
  },
  {
    id: "best-track",
    title: "טראק השנה",
    description: "הטראק הכי טוב שיצא השנה",
    nominees: [
      { id: "libra-subjective-track", name: "Libra - Subjective", artwork: "/images/libra subjective track.jpg" },
      { id: "mystic-reborn", name: "Mystic - Reborn", artwork: "/images/mystic - reborn.jpg" },
      { id: "2minds-nova", name: "2Minds - Nova", artwork: "/images/2minds nova track.jpg" },
      { id: "uncharted-brain-event", name: "Uncharted Territory - Brain Event", artwork: "/images/Uncharted Territory - brain event track.webp" },
      { id: "bigitam-dubel", name: "Bigitam & Detune - Dubel K", artwork: "/images/bigitam & detune dubel k track.jpg" },
      { id: "artmis-momentum", name: "Artmis - Momentum", artwork: "/images/artmis momentum track.jpg" },
      { id: "nevo-some1-guide", name: "Nevo & Some1 - Guide", artwork: "/images/nevo & some1 guide track.jpg" },
    ],
  },
  {
    id: "breakthrough",
    title: "פריצת השנה",
    description: "אמן שהתפוצץ השנה עם מוזיקה חדשה וסטים מפוצצים",
    nominees: [
      { id: "bigitam", name: "Bigitam", artwork: "/images/bigitam & detune.png" },
      { id: "mystic", name: "Mystic", artwork: "/images/Mystic.jpg" },
      { id: "artmis", name: "Artmis", artwork: "/images/artmis.jpg" },
      { id: "amigdala", name: "Amigdala", artwork: "/images/Amigdala.jpg" },
    ],
  },
];

/** ─────────────── PAGE ─────────────── */
export default function Awards() {
  const [selections, setSelections] = useState<Record<string, string>>({});
  const router = useRouter();

  useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
  }, []);

  const [, force] = useState(0);
  useEffect(() => {
    const unsub = GlobalAudio.inst.onChange(() => force((n) => n + 1));
    return () => {
      unsub();
    };
  }, []);

  const canSubmit = useMemo(
    () => CATEGORIES.every((c) => !!selections[c.id]),
    [selections]
  );

  const choose = (categoryId: string, nomineeId: string) =>
    setSelections((prev) => ({ ...prev, [categoryId]: nomineeId }));

  const submitVote = async () => {
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
      if (r.status === 409 || j?.error === "duplicate_vote") {
        alert("כבר הצבעת מהמכשיר הזה עבור פרסי השנה.");
      } else if (r.status === 400) {
        alert("נראה שחסר מידע להצבעה. נסו שוב.");
      } else {
        alert("שגיאה בשליחת ההצבעה. נסו שוב בעוד רגע.");
      }
    } catch {
      alert("שגיאה בשליחת ההצבעה. נסו שוב בעוד רגע.");
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
                    onClick={() => choose(cat.id, n.id)}
                    className={
                      "group relative overflow-hidden rounded-xl glass transition cursor-pointer " +
                      (selected ? "ring-2 ring-[var(--brand-pink)]" : "hover:border-white/25")
                    }
                  >
                    <Artwork src={n.artwork} alt={n.name} />

                    {/* tiny track controls (if used) */}
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

                    {/* Footer: name full-width on mobile; side-by-side from sm up */}
                    <div className="p-3 sm:p-3.5 grid gap-2 sm:grid-cols-[1fr_auto] items-center">
                      <div
                        className="font-bold text-[13px] sm:text-base leading-snug text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.7)] text-center px-1 line-clamp-2"
                        style={{ minHeight: "2.8em" }}
                        title={n.name}
                      >
                        {n.name}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          choose(cat.id, n.id);
                        }}
                        className={
                          "justify-self-center sm:justify-self-end px-2.5 py-1.5 rounded-lg border text-[12px] sm:text-xs transition shrink-0 " +
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
              disabled={!canSubmit}
              className={
                "rounded-2xl px-5 py-2.5 text-sm font-semibold " +
                (canSubmit ? "btn-primary" : "btn-ghost cursor-not-allowed")
              }
            >
              שליחת ההצבעה
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

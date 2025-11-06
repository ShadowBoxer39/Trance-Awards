// Tell TypeScript about window.hcaptcha
declare global {
  interface Window {
    hcaptcha: {
      execute: (opts: { async: boolean }) => Promise<{ response: string }>;
      render: (el: HTMLElement, opts: { sitekey: string; size: string }) => number;
    };
  }
}

// pages/awards.tsx
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePlayer } from "../components/PlayerProvider";
import { useRouter } from "next/router";
import Script from "next/script";
import { CATEGORIES } from "@/data/awards-data";

/** ───────────────── BRAND ───────────────── */
const BRAND = {
  logo: "/images/logo.png",
  title: "נבחרי השנה 2025",
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
  const captchaRef = React.useRef<HTMLDivElement | null>(null);
  const widgetId = React.useRef<number | null>(null);
  const router = useRouter();
  const player = usePlayer();

  useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
  }, []);

  // re-render when global audio state changes
  const [, force] = useState(0);
  useEffect(() => {
    const unsub = GlobalAudio.inst.onChange(() => force((n) => n + 1));
    return () => unsub();
  }, []);

  // Initialize hCaptcha widget (invisible)
  useEffect(() => {
    const sitekey = process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY as string;
    
    const interval = setInterval(() => {
      if (typeof window !== "undefined" && window.hcaptcha && captchaRef.current && widgetId.current === null) {
        try {
          widgetId.current = window.hcaptcha.render(captchaRef.current, {
            sitekey,
            size: "invisible",
          });
          clearInterval(interval);
        } catch (err) {
          console.error("hCaptcha render error:", err);
        }
      }
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const canSubmit = useMemo(
    () => CATEGORIES.every((c) => !!selections[c.id]),
    [selections]
  );

  const choose = (categoryId: string, nomineeId: string) =>
    setSelections((prev) => ({ ...prev, [categoryId]: nomineeId }));

  const submitVote = async () => {
    setIsSubmitting(true);

    try {
      // Step 1: Execute hCaptcha challenge
      let captchaToken = "";
      try {
        if (widgetId.current === null || !window.hcaptcha) {
          throw new Error("Captcha not ready");
        }
        const result = await window.hcaptcha.execute({ async: true });
        captchaToken = result.response;
      } catch (captchaError) {
        console.error("Captcha error:", captchaError);
        alert("שגיאה באימות. אנא רעננו את הדף ונסו שוב.");
        setIsSubmitting(false);
        return;
      }

      // Step 2: Submit vote with captcha token
      const r = await fetch("/api/submit-vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selections, captchaToken }),
      });

      if (r.ok) {
        try {
          sessionStorage.setItem("lastSelections", JSON.stringify(selections));
        } catch {}
        router.push("/thanks");
        return;
      }

      const j = await r.json().catch(() => ({}));

    if (r.status === 403) {
  alert("שגיאה בהצבעה. נסו שוב.");
      } else if (r.status === 409 || j?.error === "duplicate_vote") {
        alert("כבר הצבעת מהמכשיר הזה עבור נבחרי השנה.");
      } else if (r.status === 400) {
        if (j?.error === "captcha_failed") {
          alert("אימות נכשל. אנא נסו שוב.");
        } else {
          alert("נראה שחסר מידע להצבעה. נסו שוב.");
        }
      } else {
        alert("שגיאה בשליחת ההצבעה. נסו שוב בעוד רגע.");
      }
    } catch {
      alert("שגיאה בשליחת ההצבעה. נסו שוב בעוד רגע.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Load hCaptcha */}
      <Script src="https://js.hcaptcha.com/1/api.js" strategy="afterInteractive" />
      
      <main className="neon-backdrop min-h-screen text-white">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b border-white/10 bg-black/40 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
            <Link href="/vote" className="flex items-center gap-3">
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

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
                {cat.nominees.map((n) => {
                  const selected = selections[cat.id] === n.id;
                  const isTrack = cat.id === "best-track";

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

                      {/* Track play button */}
                      {isTrack && n.soundcloudUrl && (
  <>
    {/* Big center play button */}
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
  <button
    onClick={(e) => {
      e.stopPropagation();
      player.playUrl(n.soundcloudUrl!);
    }}
    className="pointer-events-auto w-10 h-10 sm:w-12 sm:h-12 rounded-full
  bg-gradient-to-br from-cyan-400/60 via-green-400/60 to-lime-500/60
  flex items-center justify-center shadow-md transition-transform
  animate-pulse-subtle
  opacity-90 md:opacity-0 md:group-hover:opacity-100
  hover:scale-105 backdrop-blur-sm"
    title="השמע טראק"
  >
    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white/90 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z"/>
    </svg>
  </button>
</div>

{/* Small badge at top */}

  </>
)}

                      {/* Nominee info */}
                      <div className="p-3 space-y-2">
                        <div
                          dir="ltr"
                          title={n.name}
                          className="font-bold text-[13px] sm:text-sm leading-tight text-white text-center line-clamp-3 min-h-[3.9em]"
                        >
                          {n.name}
                        </div>

                        <button
                          onClick={(e) => { e.stopPropagation(); choose(cat.id, n.id); }}
                          className={
                            "w-full px-3 py-2 rounded-lg text-xs transition " +
                            (selected ? "btn-primary border-0" : "btn-ghost border")
                          }
                          aria-pressed={selected}
                        >
                          {selected ? "נבחר ✓" : "בחר"}
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
            © {new Date().getFullYear()} יוצאים לטראק — נבחרי השנה.
          </footer>
        </div>

        {/* Hidden hCaptcha container */}
        <div ref={captchaRef} className="fixed -bottom-[2000px]" />
      </main>
    </>
  );
}

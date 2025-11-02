import React, { useEffect, useMemo, useRef, useState } from "react";

// --- QUICK START -----------------------------------------------------------
// 1) Drop this file into a React/Next.js project (e.g., as app/page.tsx or src/App.tsx)
// 2) Ensure Tailwind CSS is configured. (https://tailwindcss.com/docs/guides/nextjs)
// 3) Replace SAMPLE_DATA with your real nominees (logos, artwork, audio clips).
// 4) Wire the submitVote() function to your backend (see notes below).
// 5) Deploy to your domain (Vercel/Netlify/your server) and you're live.
// ---------------------------------------------------------------------------

// --- BRANDING --------------------------------------------------------------
const BRAND = {
  siteTitle: "פרסי הטרנס הישראלי 2025 – יוצאים לטראק",
  logoUrl:
    "https://upload.wikimedia.org/wikipedia/commons/3/3f/Logo_placeholder.png", // TODO: replace with your podcast logo URL
  primary: "#FF3E80",
  secondary: "#00E5FF",
  dark: "#0B0B0F",
};

// --- DATA SHAPE ------------------------------------------------------------
export type Nominee = {
  id: string;
  name: string; // Hebrew name is fine
  logo?: string; // small square/transparent
  artwork?: string; // banner/cover image
  audioPreview?: string; // short mp3/m4a/ogg URL
  link?: string; // optional external link (Spotify, YouTube, Instagram)
};

export type Category = {
  id: string;
  title: string; // Hebrew, RTL-friendly
  description?: string;
  nominees: Nominee[];
  maxChoices?: number; // default 1 (radio). set >1 for multi-select
};

// --- SAMPLE DATA (REPLACE) -------------------------------------------------
const SAMPLE_DATA: Category[] = [
  {
    id: "best-artist",
    title: "אמן השנה",
    description: "בחרו את אמן הטרנס הישראלי של השנה",
    nominees: [
      {
        id: "artist-1",
        name: "אמן א",
        logo: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Logo_placeholder.png",
        artwork:
          "https://images.unsplash.com/photo-1542751110-97427bbecf20?q=80&w=1200&auto=format&fit=crop",
        audioPreview:
          "https://upload.wikimedia.org/wikipedia/commons/4/45/ASL_applause.wav",
        link: "https://example.com/artistA",
      },
      {
        id: "artist-2",
        name: "אמן ב",
        logo: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Logo_placeholder.png",
        artwork:
          "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1200&auto=format&fit=crop",
        audioPreview:
          "https://upload.wikimedia.org/wikipedia/commons/1/19/Short_Funk_Guitar_Riff.ogg",
        link: "https://example.com/artistB",
      },
      {
        id: "artist-3",
        name: "אמן ג",
        logo: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Logo_placeholder.png",
        artwork:
          "https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=1200&auto=format&fit=crop",
        audioPreview:
          "https://upload.wikimedia.org/wikipedia/commons/b/bf/Door_Bell-Chime.ogg",
      },
    ],
  },
  {
    id: "best-track",
    title: "טראק השנה",
    description: "איזה טראק פירק את הרחבות ב-2025?",
    maxChoices: 1,
    nominees: [
      {
        id: "track-1",
        name: "טראק א",
        artwork:
          "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop",
        audioPreview:
          "https://upload.wikimedia.org/wikipedia/commons/0/0f/Thunder.ogg",
        link: "https://example.com/trackA",
      },
      {
        id: "track-2",
        name: "טראק ב",
        artwork:
          "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop",
        audioPreview:
          "https://upload.wikimedia.org/wikipedia/commons/8/8e/Short_sample_of_The_Culture_-_Eclipse.ogg",
      },
      {
        id: "track-3",
        name: "טראק ג",
        artwork:
          "https://images.unsplash.com/photo-1516570161787-2fd917215a3d?q=80&w=1200&auto=format&fit=crop",
        audioPreview:
          "https://upload.wikimedia.org/wikipedia/commons/e/e2/Beep-09.ogg",
      },
    ],
  },
];

// --- UTILITIES -------------------------------------------------------------
function classNames(...arr: Array<string | false | null | undefined>) {
  return arr.filter(Boolean).join(" ");
}

function heb(n: number): string {
  return n.toLocaleString("he-IL");
}

// Single global audio controller so only one preview plays at a time
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
    const audio = new Audio(src);
    audio.play();
    this.current = audio;
    audio.addEventListener("ended", () => this.notify());
    this.notify();
  }

  stop() {
    if (this.current) {
      this.current.pause();
      this.current.currentTime = 0;
      this.current = null;
      this.notify();
    }
  }

  isPlaying(src?: string) {
    return !!this.current && (!src || this.current.src === src);
  }

onChange(cb: () => void) {
  this.listeners.add(cb);
  return () => { this.listeners.delete(cb); };   // <- returns void
}
  }

  private notify() {
    this.listeners.forEach((cb) => cb());
  }
}

// --- MAIN COMPONENT --------------------------------------------------------
export default function TranceAwardsVoting() {
  const [categories, setCategories] = useState<Category[]>(SAMPLE_DATA);
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dir, setDir] = useState<"rtl" | "ltr">("rtl");

  // update <html dir="rtl"> for proper Hebrew flow
  useEffect(() => {
    document.documentElement.setAttribute("dir", dir);
  }, [dir]);

  // ensure only one audio preview at a time
const [, force] = useState(0);
useEffect(() => {
  const unsubscribe = GlobalAudio.inst.onChange(() => {
    force((n) => n + 1);
  });
  return () => {
    unsubscribe();
  };
}, []);

  function toggleChoice(category: Category, nomineeId: string) {
    setSelections((prev) => {
      const max = category.maxChoices ?? 1;
      const existing = prev[category.id] ?? [];
      const has = existing.includes(nomineeId);
      let next: string[];
      if (max === 1) {
        next = has ? [] : [nomineeId];
      } else {
        if (has) next = existing.filter((x) => x !== nomineeId);
        else next = [...existing, nomineeId].slice(0, max);
      }
      return { ...prev, [category.id]: next };
    });
  }

  const canSubmit = useMemo(() => {
    return categories.every((c) => (selections[c.id]?.length ?? 0) >= 1);
  }, [categories, selections]);

  async function submitVote() {
    setSubmitting(true);
    setError(null);
    try {
      // TODO: Replace with your backend endpoint
      // Example payload structure
      const payload = {
        ballotVersion: 1,
        tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
        userAgent: navigator.userAgent,
        selections,
      };

      // Attempt submit
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Submit failed: ${res.status}`);

      setSubmitted(true);
      // optional: persist a local receipt to block repeat votes locally
      localStorage.setItem("trance-awards-2025-voted", new Date().toISOString());
    } catch (e: any) {
      setError(e?.message ?? "שגיאה בשליחה");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[--bg] text-white" style={{
      // dynamic theme variables
      // You can also move this to globals.css
      // for simplicity we inline here
      // brand gradient background
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      "--bg": `radial-gradient(80rem 60rem at 20% 0%, ${BRAND.secondary}10, transparent), radial-gradient(80rem 60rem at 80% 20%, ${BRAND.primary}10, ${BRAND.dark})`,
    }}>
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur bg-black/40 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <img src={BRAND.logoUrl} alt="logo" className="w-10 h-10 rounded-full border border-white/20" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              {BRAND.siteTitle}
            </h1>
            <p className="text-white/70 text-sm">הצביעו למועמדים האהובים עליכם – לוגואים, ארט, ותצוגת סאונד קצרה לפני הבחירה</p>
          </div>
          <div className="ms-auto flex items-center gap-2">
            <button
              onClick={() => setDir(dir === "rtl" ? "ltr" : "rtl")}
              className="px-3 py-1.5 text-sm rounded-xl border border-white/10 hover:bg-white/10"
              aria-label="Toggle direction"
            >
              {dir === "rtl" ? "RTL" : "LTR"}
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid gap-8">
          {categories.map((cat) => (
            <section key={cat.id} className="">
              <div className="flex items-end justify-between flex-wrap gap-3 mb-4">
                <div>
                  <h2 className="text-2xl font-extrabold">{cat.title}</h2>
                  {cat.description && (
                    <p className="text-white/70">{cat.description}</p>
                  )}
                </div>
                <div className="text-sm text-white/60">
                  {cat.maxChoices && cat.maxChoices > 1 ? (
                    <span>בחרו עד {heb(cat.maxChoices)} מועמדים</span>
                  ) : (
                    <span>בחירה אחת</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {cat.nominees.map((n) => {
                  const selected = selections[cat.id]?.includes(n.id);
                  const isPlaying = GlobalAudio.inst.isPlaying();
                  return (
                    <article
                      key={n.id}
                      className={classNames(
                        "group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur transition",
                        selected ? "ring-2 ring-[--brand]" : "hover:border-white/20"
                      )}
                      style={{
                        // @ts-ignore
                        "--brand": BRAND.primary,
                      }}
                    >
                      {/* Artwork */}
                      <div className="relative aspect-[16/10] bg-black/40">
                        {n.artwork ? (
                          <img
                            src={n.artwork}
                            alt={n.name}
                            className="absolute inset-0 h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-white/40">
                            ללא ארט
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                        {/* Logo + Name */}
                        <div className="absolute bottom-2 start-2 end-2 flex items-center gap-3">
                          {n.logo && (
                            <img
                              src={n.logo}
                              alt="logo"
                              className="w-10 h-10 rounded-xl border border-white/20 bg-black/30 backdrop-blur"
                              loading="lazy"
                            />
                          )}
                          <div className="min-w-0">
                            <div className="font-bold tracking-tight line-clamp-1">
                              {n.name}
                            </div>
                            {n.link && (
                              <a
                                className="text-xs text-white/70 hover:text-white underline underline-offset-4"
                                href={n.link}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                              >
                                פרטים נוספים ↗
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Audio Controls */}
                        {n.audioPreview && (
                          <div className="absolute top-2 end-2 flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                GlobalAudio.inst.play(n.audioPreview!);
                              }}
                              className="px-3 py-1.5 text-xs rounded-full bg-black/60 border border-white/10 hover:bg-black/80"
                            >
                              ▶︎ האזנה
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                GlobalAudio.inst.stop();
                              }}
                              className="px-3 py-1.5 text-xs rounded-full bg-black/60 border border-white/10 hover:bg-black/80"
                            >
                              ⏹ עצור
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Footer / Select */}
                      <div className="p-4 flex items-center justify-between gap-3">
                        <span className="text-sm text-white/80">בחרו {cat.maxChoices && cat.maxChoices > 1 ? "מועמדים" : "מועמד"}</span>
                        <button
                          onClick={() => toggleChoice(cat, n.id)}
                          className={classNames(
                            "px-4 py-2 rounded-xl border text-sm transition",
                            selected
                              ? "bg-[--brand] border-transparent text-black font-semibold"
                              : "bg-transparent border-white/15 hover:border-white/30"
                          )}
                          style={{
                            // @ts-ignore
                            "--brand": BRAND.primary,
                          }}
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
        </div>

        {/* Submit */}
        <div className="mt-10 p-4 rounded-2xl border border-white/10 bg-white/5">
          {error && (
            <div className="mb-3 text-red-300 text-sm">שגיאה: {error}</div>
          )}
          {submitted ? (
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="text-green-300">תודה! ההצבעה נקלטה ✅</div>
              <a
                href="#"
                className="text-sm underline underline-offset-4 text-white/80"
                onClick={(e) => {
                  e.preventDefault();
                  setSubmitted(false);
                }}
              >
                שלחו הצבעה נוספת (לבדיקות בלבד)
              </a>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="text-white/70 text-sm">
                ודאו שבחרתם בכל הקטגוריות. לפני שליחה תוכלו עדיין לשנות.
              </div>
              <button
                onClick={submitVote}
                disabled={!canSubmit || submitting}
                className={classNames(
                  "px-6 py-3 rounded-2xl text-black font-semibold",
                  canSubmit && !submitting
                    ? "bg-[--brand]"
                    : "bg-white/30 cursor-not-allowed"
                )}
                style={{
                  // @ts-ignore
                  "--brand": BRAND.secondary,
                }}
              >
                {submitting ? "שולח…" : "שליחת ההצבעה"}
              </button>
            </div>
          )}
        </div>

        {/* Footer small print */}
        <footer className="mt-14 mb-10 text-center text-xs text-white/50">
          © {new Date().getFullYear()} יוצאים לטראק — פרסי הטרנס הישראלי. כל הזכויות שמורות. |
          <span className="mx-1">•</span>
          <a href="#" className="underline underline-offset-4">מדיניות פרטיות</a>
        </footer>
      </main>

      {/* Inline style for nicer scrollbars on dark */}
      <style jsx global>{`
        ::-webkit-scrollbar { height: 10px; width: 10px; }
        ::-webkit-scrollbar-thumb { background: #2b2b33; border-radius: 999px; }
        ::selection { background: ${BRAND.primary}55; }
      `}</style>
    </div>
  );
}

// --- BACKEND NOTES ---------------------------------------------------------
// Minimal API (Next.js /pages/api/vote.ts):
//   import type { NextApiRequest, NextApiResponse } from 'next';
//   import Database from 'better-sqlite3';
//   const db = new Database('votes.db');
//   db.exec(`CREATE TABLE IF NOT EXISTS votes(id INTEGER PRIMARY KEY, ts TEXT, ip TEXT, agent TEXT, payload TEXT);`);
//   export default function handler(req: NextApiRequest, res: NextApiResponse) {
//     if (req.method !== 'POST') return res.status(405).end();
//     const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || '';
//     const { selections, ballotVersion, userAgent } = req.body || {};
//     if (!selections) return res.status(400).json({ ok: false });
//     const stmt = db.prepare('INSERT INTO votes(ts, ip, agent, payload) VALUES(?,?,?,?)');
//     stmt.run(new Date().toISOString(), ip, userAgent || '', JSON.stringify({ ballotVersion, selections }));
//     res.json({ ok: true });
//   }
//
// Anti-abuse ideas (implement incrementally):
//  - CAPTCHA (Turnstile/ReCAPTCHA) before submit
//  - One vote per IP per 24h per category (enforce in DB)
//  - Email or phone verification for finals only
//  - Signed ballot tokens per user session
//  - Audit export + dedupe script
//
// Hosting: Vercel/Netlify + Supabase/Firebase for storage also works great.
// ---------------------------------------------------------------------------

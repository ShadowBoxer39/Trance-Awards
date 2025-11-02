// @ts-nocheck
import React, { useEffect, useMemo, useState } from "react";

// --- BRANDING --------------------------------------------------------------
const BRAND = {
  siteTitle: "פרסי הטרנס הישראלי 2025 – יוצאים לטראק",
  logoUrl:
    "https://upload.wikimedia.org/wikipedia/commons/3/3f/Logo_placeholder.png",
  primary: "#FF3E80",
  secondary: "#00E5FF",
  dark: "#0B0B0F",
};

// --- DATA SHAPE ------------------------------------------------------------
export type Nominee = {
  id: string;
  name: string;
  logo?: string;
  artwork?: string;
  audioPreview?: string;
  link?: string;
};

export type Category = {
  id: string;
  title: string;
  description?: string;
  nominees: Nominee[];
  maxChoices?: number;
};

// --- SAMPLE DATA (REPLACE LATER) ------------------------------------------
const SAMPLE_DATA: Category[] = [
  {
    id: "best-artist",
    title: "אמן השנה",
    description: "בחרו את אמן הטראנס הישראלי של השנה",
    nominees: [
      {
        id: "artist-1",
        name: "Libra",
        artwork:
          "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.facebook.com%2FComfort13%2Fposts%2Flibra%25D7%2599%25D7%2595%25D7%25A0%25D7%2599-%25D7%2593%25D7%2592%25D7%259F-%25D7%2594%25D7%25A2%25D7%2599%25D7%259C%25D7%2595%25D7%2599-%25D7%259C%25D7%25A9%25D7%25A0%25D7%25AA-2017-18-%25D7%2595%25D7%2591%25D7%25A2%25D7%2599%25D7%25A7%25D7%25A8-%25D7%2599%25D7%25A7%25D7%2599%25D7%25A8%25D7%2599%25D7%25A0%25D7%2595-%25D7%259E%25D7%2592%25D7%2599%25D7%25A2-%25D7%2591%25D7%2599%25D7%2595%25D7%259D-%25D7%2597%25D7%259E%25D7%2599%25D7%25A9%25D7%2599-%25D7%25A2%25D7%259D-%25D7%259E%25D7%2595%25D7%2596%25D7%2599%25D7%25A7%25D7%2594-%25D7%2597%25D7%2593%25D7%25A9%25D7%2594-%2F10157213320818998%2F&psig=AOvVaw3vnqhan70LKH0fHfEhaZwX&ust=1762163562163000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCPjvp4GZ05ADFQAAAAAdAAAAABAE",
        audioPreview:
          "https://upload.wikimedia.org/wikipedia/commons/4/45/ASL_applause.wav",
      },
      {
        id: "artist-2",
        name: "Gorovich",
        artwork:
          "https://geo-media.beatport.com/image_size/590x404/c29146e8-2d24-42a7-9604-fef1a4f84398.jpg",
        audioPreview:
          "https://upload.wikimedia.org/wikipedia/commons/1/19/Short_Funk_Guitar_Riff.ogg",
      },
    ],
  },
  {
    id: "best-track",
    title: "טראק השנה",
    description: "איזה טראק פירק את הרחבות ב-2025?",
    nominees: [
      {
        id: "track-1",
        name: "טראק א",
        artwork:
          "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop",
        audioPreview:
          "https://upload.wikimedia.org/wikipedia/commons/0/0f/Thunder.ogg",
      },
      {
        id: "track-2",
        name: "טראק ב",
        artwork:
          "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop",
        audioPreview:
          "https://upload.wikimedia.org/wikipedia/commons/8/8e/Short_sample_of_The_Culture_-_Eclipse.ogg",
      },
    ],
  },
];

// --- UTILITIES -------------------------------------------------------------
function classNames(...arr) {
  return arr.filter(Boolean).join(" ");
}

function heb(n: number): string {
  return n.toLocaleString("he-IL");
}

// --- AUDIO CONTROLLER ------------------------------------------------------
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
    return () => {
      this.listeners.delete(cb);
    };
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
        next = has
          ? existing.filter((x) => x !== nomineeId)
          : [...existing, nomineeId].slice(0, max);
      }
      return { ...prev, [category.id]: next };
    });
  }

  const canSubmit = useMemo(
    () => categories.every((c) => (selections[c.id]?.length ?? 0) >= 1),
    [categories, selections]
  );

  async function submitVote() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ballotVersion: 1,
          selections,
          tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
          userAgent: navigator.userAgent,
        }),
      });
      if (!res.ok) throw new Error(`Submit failed: ${res.status}`);
      setSubmitted(true);
    } catch (e: any) {
      setError(e?.message ?? "שגיאה בשליחה");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="min-h-screen text-white"
      style={{
        background: `radial-gradient(80rem 60rem at 20% 0%, ${BRAND.secondary}10, transparent),
                     radial-gradient(80rem 60rem at 80% 20%, ${BRAND.primary}10, ${BRAND.dark})`,
      }}
    >
      <header className="sticky top-0 z-10 backdrop-blur bg-black/40 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <img
            src={BRAND.logoUrl}
            alt="logo"
            className="w-10 h-10 rounded-full border border-white/20"
          />
          <h1 className="text-xl sm:text-2xl font-bold">{BRAND.siteTitle}</h1>
          <button
            onClick={() => setDir(dir === "rtl" ? "ltr" : "rtl")}
            className="ms-auto px-3 py-1.5 text-sm border rounded-xl border-white/10 hover:bg-white/10"
          >
            {dir === "rtl" ? "RTL" : "LTR"}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 grid gap-8">
        {categories.map((cat) => (
          <section key={cat.id}>
            <h2 className="text-2xl font-extrabold mb-4">{cat.title}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cat.nominees.map((n) => {
                const selected = selections[cat.id]?.includes(n.id);
                return (
                  <article
                    key={n.id}
                    className={classNames(
                      "relative rounded-2xl border p-4 bg-white/5 transition",
                      selected ? "ring-2 ring-pink-400" : "hover:border-white/30"
                    )}
                  >
                    {n.artwork && (
                      <img
                        src={n.artwork}
                        alt={n.name}
                        className="rounded-xl mb-2 w-full h-40 object-cover"
                      />
                    )}
                    <div className="font-bold mb-1">{n.name}</div>
                    <div className="flex gap-2">
                      {n.audioPreview && (
                        <>
                          <button
                            onClick={() =>
                              GlobalAudio.inst.play(n.audioPreview!)
                            }
                            className="px-3 py-1 bg-black/40 rounded-lg border border-white/20 hover:bg-black/60"
                          >
                            ▶ האזנה
                          </button>
                          <button
                            onClick={() => GlobalAudio.inst.stop()}
                            className="px-3 py-1 bg-black/40 rounded-lg border border-white/20 hover:bg-black/60"
                          >
                            ⏹ עצור
                          </button>
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => toggleChoice(cat, n.id)}
                      className={classNames(
                        "mt-3 w-full rounded-xl py-2 border text-sm",
                        selected
                          ? "bg-pink-400 text-black font-semibold"
                          : "hover:border-white/30"
                      )}
                    >
                      {selected ? "נבחר" : "בחר"}
                    </button>
                  </article>
                );
              })}
            </div>
          </section>
        ))}

        <div className="mt-10 p-4 rounded-2xl border border-white/10 bg-white/5">
          {submitted ? (
            <div className="text-green-400 font-semibold">
              תודה! ההצבעה נקלטה ✅
            </div>
          ) : (
            <>
              {error && <div className="text-red-400 mb-2">שגיאה: {error}</div>}
              <button
                onClick={submitVote}
                disabled={!canSubmit || submitting}
                className={classNames(
                  "px-6 py-3 rounded-2xl font-semibold",
                  canSubmit && !submitting
                    ? "bg-[--brand]"
                    : "bg-white/30 cursor-not-allowed"
                )}
                style={{ "--brand": BRAND.secondary }}
              >
                {submitting ? "שולח…" : "שליחת ההצבעה"}
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

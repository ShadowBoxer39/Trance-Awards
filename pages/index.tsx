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

// --- SAMPLE DATA (CUSTOM) --------------------------------------------------
const SAMPLE_DATA: Category[] = [
  {
    id: "best-artist",
    title: "אמן השנה",
    description:
      "אמן ישראלי שהוציא מוזיקה השנה והכי נתן בראש, כולל ברחבות בארץ",
    maxChoices: 1,
    nominees: [
      { id: "libra", name: "Libra" },
      { id: "gorovich", name: "Gorovich" },
      { id: "freedom-fighters", name: "Freedom Fighters" },
      { id: "mystic", name: "Mystic" },
      { id: "bliss", name: "Bliss" },
      { id: "cosmic-flow", name: "Cosmic Flow" },
    ],
  },
  {
    id: "best-female-artist",
    title: "אמנית השנה",
    description:
      "אמנית ישראלית שהוציאה מוזיקה השנה והכי נתנה בראש, כולל ברחבות בארץ",
    maxChoices: 1,
    nominees: [
      { id: "artmis", name: "Artmis" },
      { id: "amigdala", name: "Amigdala" },
      { id: "chuka", name: "Chuka" },
    ],
  },
  {
    id: "best-group",
    title: "הרכב השנה",
    description:
      "הרכב ישראלי שהוציא מוזיקה השנה והכי נתן בראש, כולל ברחבות בארץ",
    maxChoices: 1,
    nominees: [
      { id: "bigitam-detune", name: "Bigitam & Detune" },
      { id: "uncharted-territory", name: "Uncharted Territory" },
      { id: "humanoids", name: "Humanoids" },
      { id: "outsiders", name: "Outsiders" },
      { id: "rising-dust", name: "Rising Dust" },
    ],
  },
  {
    id: "album-of-the-year",
    title: "אלבום השנה",
    description: "אלבום מלא הכי טוב שיצא השנה",
    maxChoices: 1,
    nominees: [
      { id: "libra-subjective", name: "Libra – Subjective" },
      { id: "gorovich-creative-acts", name: "Gorovich – Creative Acts" },
      { id: "bliss-me-vs-me", name: "Bliss – Me vs Me" },
      { id: "cosmic-flow-infinity", name: "Cosmic Flow – Infinity" },
      { id: "2minds-acid-therapy", name: "2Minds – Acid Therapy" },
    ],
  },
  {
    id: "track-of-the-year",
    title: "טראק השנה",
    description: "הטראק הכי טוב שיצא השנה",
    maxChoices: 1,
    nominees: [
      { id: "libra-subjective-track", name: "Libra – Subjective" },
      { id: "mystic-reborn", name: "Mystic – Reborn" },
      { id: "2minds-nova", name: "2Minds – Nova" },
      { id: "uncharted-territory-brain-event", name: "Uncharted Territory – Brain Event" },
      { id: "bigitam-detune-dubel-k", name: "Bigitam & Detune – Dubel K" },
      { id: "artmis-momentum", name: "Artmis – Momentum" },
      { id: "nevo-some1-guide", name: "Nevo & Some1 – Guide" },
    ],
  },
  {
    id: "breakthrough-of-the-year",
    title: "פריצת השנה",
    description:
      "אמן שהיה באיזור וכבר שמעתם עליו אבל פתאום הוא התפוצץ ופרץ עם מוזיקה חדשה וסטים מפוצצים",
    maxChoices: 1,
    nominees: [
      { id: "bigitam", name: "Bigitam" },
      { id: "mystic-break", name: "Mystic" },
      { id: "artmis-break", name: "Artmis" },
      { id: "amigdala-break", name: "Amigdala" },
      { id: "mr-wilson", name: "Mr. Wilson" },
      { id: "event-horizon", name: "Event Horizon" },
    ],
  },
  {
    id: "production-of-the-year",
    title: "הפקת השנה",
    description:
      "ההפקה שהכי נתנה בראש השנה, עשתה מסיבות מטורפות ודאגה לקהילה שלה",
    maxChoices: 1,
    nominees: [
      { id: "miri-bamidbar", name: "מירי במדבר" },
      { id: "proppelor", name: "פרופלור" },
      { id: "tractor-bateva", name: "טרקטור בטבע" },
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
        next = has
          ? existing.filter((x) => x !== nomineeId)
          : [...existing, nomineeId].slice(0, max);
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
        background: `radial-gradient(80rem 60rem at 20% 0%, ${BRAND.secondary}10, transparent), radial-gradient(80rem 60rem at 80% 20%, ${BRAND.primary}10, ${BRAND.dark})`,
      }}
    >
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur bg-black/40 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <img
            src={BRAND.logoUrl}
            alt="logo"
            className="w-10 h-10 rounded-full border border-white/20"
          />
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            {BRAND.siteTitle}
          </h1>
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
            <section key={cat.id}>
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
                        <span className="text-sm text-white/80">
                          בחרו {cat.maxChoices && cat.maxChoices > 1 ? "מועמדים" : "מועמד"}
                        </span>
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
          © {new Date().getFullYear()} יוצאים לטראק — פרסי הטרנס הישראלי. כל הזכויות שמורות.
          <span className="mx-1">•</span>
          <a href="#" className="underline underline-offset-4">
            מדיניות פרטיות
          </a>
        </footer>
      </main>
    </div>
  );
}

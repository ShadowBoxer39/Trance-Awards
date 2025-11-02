// pages/index.tsx
import React, { useEffect, useMemo, useState } from "react";

/** ───────────────────────── TYPES ───────────────────────── */
export type Nominee = {
  id: string;
  name: string;
  artwork?: string;
  audioPreview?: string; // used only for Best Track category if provided
};

export type Category = {
  id: string;
  title: string;
  description?: string;
  nominees: Nominee[];
};

/** ───────────────────────── SMART-FIT ARTWORK ─────────────────────────
 * Portrait/square => object-contain (no crop)
 * Landscape      => object-cover (fills)
 * Card box is consistent (aspect 4/3 on mobile, 16/9 on larger screens)
 */
function Artwork({ src, alt }: { src?: string; alt: string }) {
  const [isPortrait, setIsPortrait] = React.useState(false);

  return (
    <div className="relative w-full overflow-hidden rounded-t-xl bg-black/60 aspect-[4/3] sm:aspect-[16/9]">
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
        <div className="absolute inset-0 grid place-items-center text-white/50 text-sm">
          ללא תמונה
        </div>
      )}
    </div>
  );
}

/** ───────────────────────── GLOBAL AUDIO (only for track category) ───────────────────────── */
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
    a.play();
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

/** ───────────────────────── DATA ─────────────────────────
 * Artwork paths match your uploaded filenames exactly.
 * If you later add audio snippets, place them in /public/audio and
 * set audioPreview: "/audio/your-file.mp3" ONLY for best-track nominees.
 */
const CATEGORIES: Category[] = [
  {
    id: "best-artist",
    title: "אמן השנה",
    description: "אמן ישראלי שהוציא מוזיקה השנה והכי נתן בראש, כולל ברחבות בארץ",
    nominees: [
      // no explicit Libra artist image was in the screenshot -> leave empty if you don't have it
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
      {
        id: "libra-subjective-track",
        name: "Libra - Subjective",
        artwork: "/images/libra subjective track.jpg",
        // audioPreview: "/audio/libra-subjective.mp3", // add if you upload
      },
      {
        id: "mystic-reborn",
        name: "Mystic - Reborn",
        artwork: "/images/mystic - reborn.jpg",
        // audioPreview: "/audio/mystic-reborn.mp3",
      },
      {
        id: "2minds-nova",
        name: "2Minds - Nova",
        artwork: "/images/2minds nova track.jpg",
        // audioPreview: "/audio/2minds-nova.mp3",
      },
      {
        id: "uncharted-brain-event",
        name: "Uncharted Territory - Brain Event",
        artwork: "/images/Uncharted Territory - brain event track.webp",
        // audioPreview: "/audio/uncharted-brain-event.mp3",
      },
      {
        id: "bigitam-dubel",
        name: "Bigitam & Detune - Dubel K",
        artwork: "/images/bigitam & detune dubel k track.jpg",
        // audioPreview: "/audio/bigitam-dubel-k.mp3",
      },
      {
        id: "artmis-momentum",
        name: "Artmis - Momentum",
        artwork: "/images/artmis momentum track.jpg",
        // audioPreview: "/audio/artmis-momentum.mp3",
      },
      {
        id: "nevo-some1-guide",
        name: "Nevo & Some1 - Guide",
        artwork: "/images/nevo & some1 guide track.jpg",
        // audioPreview: "/audio/nevo-some1-guide.mp3",
      },
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

/** ───────────────────────── PAGE ───────────────────────── */
export default function TranceAwardsVoting() {
  const [selections, setSelections] = useState<Record<string, string>>({});

  // keep <html dir="rtl">
  useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
  }, []);

  // re-render when audio changes (only for track category) without TypeScript cleanup issues
  const [, force] = useState(0);
  useEffect(() => {
    const unsub = GlobalAudio.inst.onChange(() => force((n) => n + 1));
    return () => {
      unsub();
    };
  }, []);

  const canSubmit = useMemo(() => {
    return CATEGORIES.every((c) => !!selections[c.id]);
  }, [selections]);

  const toggleChoice = (categoryId: string, nomineeId: string) => {
    setSelections((prev) => ({ ...prev, [categoryId]: nomineeId }));
  };

  const submitVote = async () => {
    alert("הצבעה נשלחה (דמו). חיבור ל-API יתווסף בהמשך.");
  };

  return (
    <main className="min-h-screen bg-black text-white px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-10">
        פרסי הטרנס הישראלי 2025 🎧
      </h1>

      <div className="space-y-16 max-w-7xl mx-auto">
        {CATEGORIES.map((cat) => (
          <section key={cat.id}>
            <div className="flex items-end justify-between gap-3 mb-4">
              <div>
                <h2 className="text-2xl font-extrabold">{cat.title}</h2>
                {cat.description && (
                  <p className="text-white/70">{cat.description}</p>
                )}
              </div>
              <div className="text-sm text-white/60">
                בחירה אחת
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cat.nominees.map((n) => {
                const selected = selections[cat.id] === n.id;
                const isTrackCategory = cat.id === "best-track";
                const canPlay = isTrackCategory && !!n.audioPreview;
                const playing = canPlay && GlobalAudio.inst.isPlaying(n.audioPreview!);

                return (
                  <article
                    key={n.id}
                    className={`group relative overflow-hidden rounded-2xl border bg-white/5 backdrop-blur transition ${
                      selected ? "ring-2 ring-pink-500 border-transparent" : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    {/* Artwork */}
                    <Artwork src={n.artwork} alt={n.name} />

                    {/* Optional audio controls ONLY for Track of the Year */}
                    {isTrackCategory && canPlay && (
                      <div className="absolute top-2 end-2 z-10 flex items-center gap-2">
                        {!playing ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              GlobalAudio.inst.play(n.audioPreview!);
                            }}
                            className="px-3 py-1.5 text-xs rounded-full bg-black/70 border border-white/10 hover:bg-black/90"
                            aria-label={`Play preview: ${n.name}`}
                          >
                            ▶︎ האזנה
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              GlobalAudio.inst.stop();
                            }}
                            className="px-3 py-1.5 text-xs rounded-full bg-black/70 border border-white/10 hover:bg-black/90"
                            aria-label={`Stop preview: ${n.name}`}
                          >
                            ⏹ עצור
                          </button>
                        )}
                      </div>
                    )}

                    {/* Footer / Select */}
                    <div
                      className="p-4 flex items-center justify-between gap-3 cursor-pointer"
                      onClick={() => toggleChoice(cat.id, n.id)}
                    >
                      <div className="font-semibold truncate">{n.name}</div>
                      <button
                        className={`px-4 py-2 rounded-xl border text-sm transition ${
                          selected
                            ? "bg-pink-500 border-transparent text-black font-semibold"
                            : "bg-transparent border-white/15 hover:border-white/30"
                        }`}
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
        <div className="mt-10 p-4 rounded-2xl border border-white/10 bg-white/5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="text-white/70 text-sm">
              ודאו שבחרתם בכל הקטגוריות. לפני שליחה תוכלו עדיין לשנות.
            </div>
            <button
              onClick={submitVote}
              disabled={!canSubmit}
              className={`px-6 py-3 rounded-2xl text-black font-semibold ${
                canSubmit ? "bg-pink-400 hover:bg-pink-300" : "bg-white/30 cursor-not-allowed"
              }`}
            >
              שליחת ההצבעה
            </button>
          </div>
        </div>

        <footer className="mt-14 mb-10 text-center text-xs text-white/50">
          © {new Date().getFullYear()} יוצאים לטראק — פרסי הטרנס הישראלי. כל הזכויות שמורות.
        </footer>
      </div>
    </main>
  );
}

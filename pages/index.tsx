import React, { useState, useEffect, useMemo } from "react";

// --- TYPES --------------------------------------------------------------
export type Nominee = {
  id: string;
  name: string;
  artwork?: string;
};

export type Category = {
  id: string;
  title: string;
  description?: string;
  nominees: Nominee[];
};

// --- DATA ---------------------------------------------------------------
const CATEGORIES: Category[] = [
  {
    id: "best-artist",
    title: "אמן השנה",
    description: "אמן ישראלי שהוציא מוזיקה השנה והכי נתן בראש, כולל ברחבות בארץ",
    nominees: [
      { id: "libra", name: "Libra", artwork: "/images/libra.jpg" },
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
      { id: "nevo-some1", name: "Nevo & Some1 - Guide", artwork: "/images/nevo & some1 guide track.jpg" },
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
  {
    id: "best-production",
    title: "הפקת השנה",
    description: "ההפקה שהכי נתנה בראש השנה ועשתה מסיבות מטורפות ודאגה לקהילה שלה",
    nominees: [
      { id: "miri-bamidbar", name: "מירי במדבר", artwork: "/images/miri-bamidbar.jpg" },
      { id: "propeller", name: "פרופלור", artwork: "/images/propeller.jpg" },
      { id: "tractor", name: "טרקטור בטבע", artwork: "/images/tractor.jpg" },
    ],
  },
];

// --- COMPONENT -----------------------------------------------------------
export default function TranceAwardsVoting() {
  const [votes, setVotes] = useState<Record<string, string>>({});

  const handleVote = (categoryId: string, nomineeId: string) => {
    setVotes({ ...votes, [categoryId]: nomineeId });
  };

  return (
    <main dir="rtl" className="min-h-screen bg-black text-white p-4">
      <h1 className="text-3xl font-bold text-center mb-10">פרסי הטרנס הישראלי 2025 🎧</h1>
      <div className="space-y-16">
        {CATEGORIES.map((cat) => (
          <section key={cat.id}>
            <h2 className="text-2xl font-bold mb-2">{cat.title}</h2>
            <p className="text-gray-400 mb-6">{cat.description}</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cat.nominees.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleVote(cat.id, n.id)}
                  className={`cursor-pointer border-2 rounded-xl overflow-hidden transition ${
                    votes[cat.id] === n.id ? "border-pink-500" : "border-white/20 hover:border-pink-400"
                  }`}
                >
                  {n.artwork && (
                    <img
                      src={n.artwork}
                      alt={n.name}
                      className="w-full h-48 object-cover"
                      loading="lazy"
                    />
                  )}
                  <div className="p-4 text-center font-semibold">{n.name}</div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <footer className="mt-16 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} יוצאים לטראק — פרסי הטרנס הישראלי
      </footer>
    </main>
  );
}

// /data/awards-data.ts
export type Nominee = {
  id: string;              // unique slug
  name: string;            // display name
  artwork?: string;        // /images/my-image.jpg (under /public)
  audioPreview?: string;   // optional (best-track only)
};

export type Category = {
  id: string;              // unique slug (e.g., "best-artist")
  title: string;           // Hebrew title
  description?: string;    // optional sub text
  nominees: Nominee[];
};

/** ---- SINGLE SOURCE OF TRUTH ---- */
export const CATEGORIES: Category[] = [
  {
    id: "best-artist",
    title: "אמן השנה",
    description: "אמן ישראלי שהוציא מוזיקה השנה והכי נתן בראש, כולל ברחבות בארץ",
    nominees: [
      { id: "libra", name: "Libra", artwork: "/images/libra.jpg" },
      { id: "gorovich", name: "Gorovich", artwork: "/images/Gorovich.webp" },
      { id: "freedom-fighters", name: "Freedom Fighters", artwork: "/images/Freedom Fighters.png" },
      { id: "mystic", name: "Mystic", artwork: "/images/mystic.jpg" },
      { id: "dekel", name: "Dekel", artwork: "/images/dekel.jpg" },
      { id: "shtuby", name: "Shtuby", artwork: "/images/shtuby.jpg" },
      { id: "astrix", name: "Astrix", artwork: "/images/astrix.jpeg" },
      { id: "newborn", name: "New Born", artwork: "/images/newborn.jpg" },
      { id: "shidapu", name: "Shidapu", artwork: "/images/shidapu.jpg" },
      { id: "captain-hook", name: "Captain Hook", artwork: "/images/captain.jpg" },
      { id: "hujaboy", name: "Hujaboy", artwork: "/images/hujaboy.jpg" },
      { id: "skizologic", name: "Skizologic", artwork: "/images/skizologic.jpg" },
      { id: "outoforbit", name: "Out Of Orbit", artwork: "/images/outoforbit.jpg" },
    ],
  },
  {
    id: "best-female-artist",
    title: "אמנית השנה",
    description: "אמנית ישראלית שהוציאה מוזיקה השנה ונתנה בראש, כולל ברחבות בארץ",
    nominees: [
      { id: "artmis", name: "Artmis", artwork: "/images/artmis.jpg" },
      { id: "amigdala", name: "Amigdala", artwork: "/images/Amigdala.jpg" },
      { id: "chuka", name: "Chuka", artwork: "/images/chuka.jpg" },
      { id: "atara", name: "Atara", artwork: "/images/atara.jpg" },
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
      { id: "astral-projection", name: "Astral Projection", artwork: "/images/astral.jpg" },

    
    ],
  },
  {
    id: "best-album",
    title: "אלבום השנה",
    description: "אלבום שיצא השנה והעיף לכם את המוח",
    nominees: [
      { id: "libra-subjective", name: "Libra - Subjective", artwork: "/images/libra subjective album.jpg" },
      { id: "gorovich-creative", name: "Gorovich - Creative Acts", artwork: "/images/gorovich creative acts album.jpg" },
      { id: "bliss-me-vs-me", name: "Bliss - Me vs Me", artwork: "/images/bliss me vs me album.jpg" },
      { id: "cosmic-flow-infinity", name: "Cosmic Flow - Infinity", artwork: "/images/cosmic flow infinity album.jpg" },
      { id: "2minds-acid", name: "2Minds - Acid Therapy", artwork: "/images/2minds acid therapy album.jpg" },
      { id: "detune-echoes", name: "Detune - Echoes", artwork: "/images/echoes.jpg" },
      { id: "astral-mankind", name: "Astral Projection - for All Mankind", artwork: "/images/astralforall.jpg" },
      { id: "some1-message", name: "Some1 - Message From The Deep", artwork: "/images/some1message.jpg" },
      { id: "persona-interplay", name: "Persona - Interplay", artwork: "/images/personainter.jpg" },
    ],
  },
  {
    id: "best-track",
    title: "טראק השנה",
    description: "הטראק שהכי עשה לכם את השנה",
    nominees: [
      { id: "libra-subjective-track", name: "Libra - Subjective", artwork: "/images/libra subjective album.jpg" },
      { id: "mystic-reborn", name: "Mystic - Reborn", artwork: "/images/mystic - reborn.jpg" },
      { id: "2minds-nova", name: "2Minds - Nova", artwork: "/images/2minds nova track.jpg" },
      { id: "uncharted-brain-event", name: "Uncharted Territory - Brain Event", artwork: "/images/Uncharted Territory - brain event track.webp" },
      { id: "bigitam-dubel", name: "Bigitam & Detune - Dubel K", artwork: "/images/bigitam & detune dubel k track.jpg" },
      { id: "artmis-momentum", name: "Artmis - Momentum", artwork: "/images/artmis momentum track.jpg" },
      { id: "nevo-some1-guide", name: "Nevo & Some1 - Guide", artwork: "/images/nevo & some1 guide track.jpg" },
      { id: "jupiter", name: "Mystic & Detune - Jupiter", artwork: "/images/jupiter.jpg" },
      { id: "mindscam", name: "Amigdala - Mindscam", artwork: "/images/mindscam.jpg" },
      { id: "lemonade", name: "Out of Orbit & Sandman - Moon Lemonade Pt.2", artwork: "/images/lemonade.jpg" },
      { id: "barry", name: "Chaos604 - Barry's Trip", artwork: "/images/barry.jpg" },
      
      
    ],
  },
  {
    id: "breakthrough",
    title: "פריצת השנה",
    description: "אמן שהתפוצץ השנה עם מוזיקה חדשה וסטים מפוצצים",
    nominees: [
      { id: "bigitam", name: "Bigitam", artwork: "/images/bigitam.png" },
      { id: "mystic", name: "Mystic", artwork: "/images/Mystic.jpg" },
      { id: "artmis", name: "Artmis", artwork: "/images/artmis.jpg" },
      { id: "amigdala", name: "Amigdala", artwork: "/images/Amigdala.jpg" },
      { id: "nevo", name: "Nevo", artwork: "/images/nevo.jpg" },
      { id: "event", name: "Event Horizon", artwork: "/images/event.jpg" },
      { id: "chaos604", name: "Chaos604", artwork: "/images/chaos.jpg" },
      { id: "industria", name: "Industria", artwork: "/images/industria.jpg" },
      { id: "mrwilson", name: "Mr. Wilson", artwork: "/images/mrwilson.jpg" },
      
    ],
  },
];

/** Helpers */
export const CATEGORIES_BY_ID = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));
export function getNominee(catId: string, nomineeId: string) {
  const cat = CATEGORIES_BY_ID[catId];
  return cat?.nominees.find(n => n.id === nomineeId);
}

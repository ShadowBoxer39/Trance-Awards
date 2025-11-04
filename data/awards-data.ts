// /data/awards-data.ts

/** TYPES */
// /data/awards-data.ts


export const CATEGORIES = [
  // ... your categories & nominees objects ...


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
      { id: "shidapu", name: "Shidapu", artwork: "/images/shidapu.jpeg" },
      { id: "captain-hook", name: "Captain Hook", artwork: "/images/captain.jpg" },
      { id: "hujaboy", name: "Hujaboy", artwork: "/images/hujaboy.jpeg" },
      { id: "skizologic", name: "Skizologic", artwork: "/images/skizologic.jpeg" },
      { id: "outoforbit", name: "Out Of Orbit", artwork: "/images/outoforbit.jpg" },
      { id: "modus", name: "Modus", artwork: "/images/modus.jpg" },
      { id: "skull", name: "Laughing Skull", artwork: "/images/.jpg" },
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
      { id: "astrogano", name: "Astrogano", artwork: "/images/.jpg" },
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
      { id: "astral-projection", name: "Astral Projection", artwork: "/images/astral.jpeg" },
    ],
  },
  {
    id: "best-album",
    title: "אלבום השנה",
    description: "אלבום שיצא השנה והעיף לכם את המוח",
    nominees: [
      { id: "libra-subjective", name: "Libra - Subjective", artwork: "/images/libra subjective album.jpg" },
      { id: "gorovich-creative", name: "Gorovich - Creative Acts", artwork: "/images/gorovich creative acts album.jpg" },
      { id: "bliss-me-vs-me", name: "Bliss - Me vs Me", artwork: "/images/blissalbum.jpg" },
      { id: "cosmic-flow-infinity", name: "Cosmic Flow - Infinity", artwork: "/images/cosmic flow infinity album.jpg" },
      { id: "2minds-acid", name: "2Minds - Acid Therapy", artwork: "/images/2minds acid therapy album.jpg" },
      { id: "detune-echoes", name: "Detune - Echoes", artwork: "/images/echoes.jpg" },
      { id: "astral-mankind", name: "Astral Projection - for All Mankind", artwork: "/images/astralforall.jpg" },
      { id: "some1-message", name: "Some1 - Message From The Deep", artwork: "/images/some1message.jpg" },
      { id: "persona-interplay", name: "Persona - Interplay", artwork: "/images/perosnainter.jpg" },
    ],
  },
  {
    id: "best-track",
    title: "טראק השנה",
    description: "הטראק שהכי עשה לכם את השנה",
    nominees: [
      { id: "libra-subjective-track", name: "Libra - Subjective", artwork: "/images/libra subjective album.jpg", audioPreview: "/audio/Libra - Subjective.mp3" },
      { id: "mystic-reborn", name: "Mystic - Reborn", artwork: "/images/mystic - reborn.jpg", audioPreview: "/audio/mystic-reborn-30.mp3" },
      { id: "2minds-nova", name: "2Minds - Nova", artwork: "/images/2minds nova track.jpg", audioPreview: "/audio/2minds-nova-30.mp3" },
      { id: "uncharted-brain-event", name: "Uncharted Territory - Brain Event", artwork: "/images/Uncharted Territory - brain event track.webp", audioPreview: "/audio/uncharted-brain-event-30.mp3" },
      { id: "bigitam-dubel", name: "Bigitam & Detune - Dubel K", artwork: "/images/bigitam & detune dubel k track.jpg", audioPreview: "/audio/dubel-k-30.mp3" },
      { id: "artmis-momentum", name: "Artmis - Momentum", artwork: "/images/artmis momentum track.jpg", audioPreview: "/audio/artmis-momentum-30.mp3" },
      { id: "nevo-some1-guide", name: "Nevo & Some1 - Guide", artwork: "/images/nevo & some1 guide track.jpg", audioPreview: "/audio/guide-30.mp3" },
      { id: "jupiter", name: "Mystic & Detune - Jupiter", artwork: "/images/jupiter.jpeg", audioPreview: "/audio/jupiter-30.mp3" },
      { id: "mindscam", name: "Amigdala - Mindscam", artwork: "/images/mindscam.jpg", audioPreview: "/audio/mindscam-30.mp3" },
      { id: "lemonade", name: "Out of Orbit & Sandman - Moon Lemonade Pt.2", artwork: "/images/moonlemonade.jpeg", audioPreview: "/audio/moon-lemonade-30.mp3" },
      { id: "barry", name: "Chaos604 - Barry's Trip", artwork: "/images/barrytrip.jpg", audioPreview: "/audio/barrys-trip-30.mp3" },
    ],
  },
  {
    id: "breakthrough",
    title: "פריצת השנה",
    description: "אמן שהתפוצץ השנה עם מוזיקה חדשה וסטים מפוצצים",
    nominees: [
      { id: "bigitam", name: "Bigitam", artwork: "/images/bigitam.jpg" },
      { id: "mystic", name: "Mystic", artwork: "/images/mystic.jpg" },
      { id: "artmis", name: "Artmis", artwork: "/images/artmis.jpg" },
      { id: "amigdala", name: "Amigdala", artwork: "/images/Amigdala.jpg" },
      { id: "nevo", name: "Nevo", artwork: "/images/nevo.jpg" },
      { id: "event", name: "Event Horizon", artwork: "/images/event.jpg" },
      { id: "chaos604", name: "Chaos604", artwork: "/images/chaos.jpg" },
      { id: "industria", name: "Industria", artwork: "/images/industria.jpg" },
      { id: "mrwilson", name: "Mr. Wilson", artwork: "/images/mrwilson.jpg" },
      { id: "gordon", name: "Eran Gordon", artwork: "/images/.jpg" },
      { id: "migdalor", name: "Migdalor", artwork: "/images/migdalor.jpg" },
    ],
  },
];

/** HELPERS */
/** HELPERS (type-safe via inference) */
export const CATEGORIES_BY_ID = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c] as const)
) as Record<string, (typeof CATEGORIES)[number]>;

export function getNominee(catId: string, nomineeId: string) {
  const cat = CATEGORIES_BY_ID[catId];
  return cat?.nominees.find((n) => n.id === nomineeId);
}

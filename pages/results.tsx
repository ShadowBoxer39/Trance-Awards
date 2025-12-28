// pages/results.tsx - STUNNING INTERACTIVE RESULTS PAGE
// Uses Framer Motion for animations - add "framer-motion": "^11.15.0" to package.json
import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, useInView, useScroll, useTransform } from "framer-motion";
import { FaInstagram, FaYoutube, FaSpotify, FaTiktok, FaWhatsapp, FaTrophy, FaMedal, FaAward } from "react-icons/fa";

// ═══════════════════════════════════════════════════════════════════════════════
// REAL RESULTS DATA - From actual votes with fraud corrections applied
// ═══════════════════════════════════════════════════════════════════════════════

const RESULTS_DATA = {
  "best-artist": {
    title: "אמן השנה",
    emoji: "👨‍🎤",
    results: [
      { id: "skull", name: "Laughing Skull", percent: 11.3, artwork: "/images/skull.jpeg" },
      { id: "newborn", name: "New Born", percent: 9.8, artwork: "/images/newborn.jpg" },
      { id: "dekel", name: "Dekel", percent: 9.0, artwork: "/images/dekel.jpg" },
      { id: "shidapu", name: "Shidapu", percent: 7.8, artwork: "/images/shidapu.jpeg" },
      { id: "darwish", name: "Darwish", percent: 7.0, artwork: "/images/darwish.jpeg" },
      { id: "captain-hook", name: "Captain Hook", percent: 5.6, artwork: "/images/captain.jpg" },
    ],
  },
  "best-female-artist": {
    title: "אמנית השנה",
    emoji: "👩‍🎤",
    // FRAUD CORRECTION: Artmis 1st, Amigdala 2nd, Gula K 3rd
    results: [
      { id: "artmis", name: "Artmis", percent: 21.9, artwork: "/images/artmis.jpg" },
      { id: "amigdala", name: "Amigdala", percent: 19.8, artwork: "/images/Amigdala.jpg" },
      { id: "gula", name: "Gula K", percent: 17.3, artwork: "/images/gula.jpg" },
      { id: "atara", name: "Atara", percent: 14.8, artwork: "/images/atara.jpg" },
      { id: "chuka", name: "Chuka", percent: 14.1, artwork: "/images/chuka.jpg" },
      { id: "astrogano", name: "Astrogano", percent: 12.0, artwork: "/images/astrogano.jpeg" },
    ],
  },
  "best-group": {
    title: "הרכב השנה",
    emoji: "🎸",
    results: [
      { id: "absolute", name: "Absolute Hypnotic", percent: 21.6, artwork: "/images/absolute.jpg" },
      { id: "astral-projection", name: "Astral Projection", percent: 16.0, artwork: "/images/astral.jpeg" },
      { id: "rising-dust", name: "Rising Dust", percent: 15.0, artwork: "/images/rising dust.jpg" },
      { id: "bigitam-detune", name: "Bigitam & Detune", percent: 13.2, artwork: "/images/bigitam & detune.png" },
      { id: "infected", name: "Infected Mushroom", percent: 11.5, artwork: "/images/infected.jpg" },
      { id: "uncharted-territory", name: "Uncharted Territory", percent: 8.2, artwork: "/images/Uncharted Territory.webp" },
    ],
  },
  "best-album": {
    title: "אלבום השנה",
    emoji: "💿",
    results: [
      { id: "astral-mankind", name: "Astral Projection - For All Mankind", percent: 17.2, artwork: "/images/astralforall.jpg" },
      { id: "gorovich-creative", name: "Gorovich - Creative Acts", percent: 16.5, artwork: "/images/gorovich creative acts album.jpg" },
      { id: "2minds-acid", name: "2Minds - Acid Therapy", percent: 12.2, artwork: "/images/2minds acid therapy album.jpg" },
      { id: "dragonmami", name: "Acobas - Dragon Mami", percent: 9.8, artwork: "/images/dragonmami.jpg" },
      { id: "libra-subjective", name: "Libra - Subjective", percent: 9.1, artwork: "/images/libra subjective album.jpg" },
      { id: "roots", name: "Adama - Roots", percent: 8.2, artwork: "/images/roots.jpg" },
    ],
  },
  "best-track": {
    title: "טראק השנה",
    emoji: "🎵",
    results: [
      { id: "highway", name: "Laughing Skull - Extraterestrial Lover", percent: 18.8, artwork: "/images/highway.jpg" },
      { id: "barry", name: "Chaos604 - Barry's Trip", percent: 13.9, artwork: "/images/barrytrip.jpg" },
      { id: "lemonade", name: "Out of Orbit & Sandman - Moon Lemonade Pt.2", percent: 11.2, artwork: "/images/moonlemonade.jpeg" },
      { id: "2minds-nova", name: "2Minds - Nova", percent: 9.9, artwork: "/images/2minds nova track.jpg" },
      { id: "mystic-reborn", name: "Mystic - Reborn", percent: 6.0, artwork: "/images/mystic - reborn.jpg" },
      { id: "libra-subjective-track", name: "Libra - Subjective", percent: 6.0, artwork: "/images/libra subjective album.jpg" },
    ],
  },
  "breakthrough": {
    title: "פריצת השנה",
    emoji: "🚀",
    // FRAUD CORRECTION: Chaos604 1st, Bigitam 2nd, Amigdala 3rd, Tzabi 4th
    results: [
      { id: "chaos604", name: "Chaos604", percent: 17.0, artwork: "/images/chaos.jpg" },
      { id: "bigitam", name: "Bigitam", percent: 16.0, artwork: "/images/bigitam.jpg" },
      { id: "amigdala", name: "Amigdala", percent: 6.7, artwork: "/images/Amigdala.jpg" },
      { id: "tzabi", name: "Tzabi", percent: 6.2, artwork: "/images/tzabi.jpg" },
      { id: "acobas", name: "Acobas", percent: 6.2, artwork: "/images/acobas.jpg" },
      { id: "mrwilson", name: "Mr. Wilson", percent: 6.1, artwork: "/images/mrwilson.jpg" },
    ],
  },
};

// Total votes
const TOTAL_VOTES = "22,105";

// ═══════════════════════════════════════════════════════════════════════════════
// ANIMATED COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

// Floating particles background
function ParticleField() {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  
  useEffect(() => {
    const newParticles = [...Array(40)].map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute w-1 h-1 bg-purple-400/30 rounded-full"
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 4 + Math.random() * 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
}

// Glowing orbs
function GlowingOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/15 rounded-full blur-[100px]"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        className="absolute top-1/2 right-1/3 w-64 h-64 bg-pink-500/15 rounded-full blur-[80px]"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.35, 0.2],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />
    </div>
  );
}

// Place badge component
function PlaceBadge({ place }: { place: number }) {
  if (place === 1) {
    return (
      <motion.div
        className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14"
        animate={{ rotate: [0, -5, 5, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <FaTrophy className="text-3xl sm:text-4xl text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
      </motion.div>
    );
  }
  if (place === 2) {
    return (
      <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14">
        <FaMedal className="text-3xl sm:text-4xl text-gray-300 drop-shadow-[0_0_8px_rgba(209,213,219,0.4)]" />
      </div>
    );
  }
  if (place === 3) {
    return (
      <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14">
        <FaAward className="text-3xl sm:text-4xl text-amber-600 drop-shadow-[0_0_8px_rgba(217,119,6,0.4)]" />
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14">
      <span className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 font-bold text-lg">
        #{place}
      </span>
    </div>
  );
}

// Single result card with hover effects
function ResultCard({
  result,
  index,
  isWinner,
}: {
  result: { id: string; name: string; percent: number; artwork: string };
  index: number;
  isWinner: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });

  const place = index + 1;
  
  // Different background colors for top 3
  const getBgGradient = () => {
    if (place === 1) return "from-yellow-900/40 via-yellow-800/20 to-transparent";
    if (place === 2) return "from-gray-600/30 via-gray-700/20 to-transparent";
    if (place === 3) return "from-amber-900/30 via-amber-800/20 to-transparent";
    return "from-white/5 to-transparent";
  };

  const getBorderColor = () => {
    if (place === 1) return "border-yellow-500/50";
    if (place === 2) return "border-gray-400/30";
    if (place === 3) return "border-amber-600/30";
    return "border-white/10";
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, x: -50 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group"
    >
      <motion.div
        animate={{
          scale: isHovered ? 1.02 : 1,
          y: isHovered ? -4 : 0,
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={`
          relative overflow-hidden rounded-2xl
          border ${getBorderColor()}
          bg-gradient-to-l ${getBgGradient()}
          backdrop-blur-sm
          ${isWinner ? "shadow-lg shadow-yellow-500/10" : ""}
        `}
      >
        {/* Shine effect on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full"
          animate={{ translateX: isHovered ? "200%" : "-100%" }}
          transition={{ duration: 0.6 }}
        />

        {/* Winner pulse effect */}
        {isWinner && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-transparent to-yellow-400/10"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        <div className="relative p-4 sm:p-5 flex items-center gap-4">
          {/* Percentage - LEFT side */}
          <motion.div
            className={`text-2xl sm:text-3xl font-black tabular-nums min-w-[70px] sm:min-w-[85px] text-right ${
              isWinner ? "text-yellow-400" : place === 2 ? "text-gray-300" : place === 3 ? "text-amber-500" : "text-white/70"
            }`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
          >
            {result.percent}%
          </motion.div>

          {/* Name and progress bar */}
          <div className="flex-grow min-w-0">
            <motion.h3
              className={`font-bold text-lg sm:text-xl truncate ${isWinner ? "text-yellow-400" : "text-white"}`}
              dir="ltr"
            >
              {result.name}
            </motion.h3>
            
            {/* Animated progress bar */}
            <div className="mt-2 relative h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className={`absolute inset-y-0 left-0 rounded-full ${
                  isWinner
                    ? "bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500"
                    : place === 2
                    ? "bg-gradient-to-r from-gray-300 to-gray-400"
                    : place === 3
                    ? "bg-gradient-to-r from-amber-500 to-amber-600"
                    : "bg-gradient-to-r from-purple-400 to-cyan-400"
                }`}
                initial={{ width: 0 }}
                animate={isInView ? { width: `${Math.min(result.percent * 3, 100)}%` } : { width: 0 }}
                transition={{ duration: 0.8, delay: 0.2 + index * 0.1, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Artist artwork */}
          <motion.div
            className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden flex-shrink-0 border border-white/10"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
          >
            <img
              src={result.artwork}
              alt={result.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/images/logo.png";
              }}
            />
          </motion.div>

          {/* Place indicator - RIGHT side */}
          <PlaceBadge place={place} />
        </div>
      </motion.div>
    </motion.div>
  );
}

// Category section with reveal animation
function CategorySection({ 
  categoryId, 
  data, 
  index 
}: { 
  categoryId: string; 
  data: typeof RESULTS_DATA[keyof typeof RESULTS_DATA]; 
  index: number;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [isExpanded, setIsExpanded] = useState(false);

  // Show top 3 by default
  const displayedResults = isExpanded ? data.results : data.results.slice(0, 3);

  return (
    <motion.section
      ref={sectionRef}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className="relative"
    >
      {/* Section header */}
      <motion.div
        initial={{ x: 50, opacity: 0 }}
        animate={isInView ? { x: 0, opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: index * 0.15 }}
        className="mb-6 text-right"
      >
        <div className="flex items-center justify-end gap-3">
          <h2 className="text-3xl sm:text-4xl font-black">
            <span className="bg-gradient-to-l from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              {data.title}
            </span>
          </h2>
          <span className="text-3xl sm:text-4xl">{data.emoji}</span>
        </div>
        <motion.div
          className="h-1 bg-gradient-to-l from-purple-400 via-pink-400 to-transparent rounded-full mt-2 mr-0 ml-auto"
          initial={{ width: 0 }}
          animate={isInView ? { width: "180px" } : {}}
          transition={{ duration: 0.6, delay: 0.2 + index * 0.15 }}
        />
      </motion.div>

      {/* Results list */}
      <div className="space-y-3">
        <AnimatePresence>
          {displayedResults.map((result, i) => (
            <ResultCard
              key={result.id}
              result={result}
              index={i}
              isWinner={i === 0}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Expand/Collapse button */}
      {data.results.length > 3 && (
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all flex items-center justify-center gap-2"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <motion.span
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            ▼
          </motion.span>
          {isExpanded ? "הצג פחות" : `הצג עוד ${data.results.length - 3} תוצאות`}
        </motion.button>
      )}
    </motion.section>
  );
}

// Hero section
function HeroSection() {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const y = useTransform(scrollY, [0, 400], [0, 100]);

  return (
    <motion.section
      className="relative min-h-[85vh] flex items-center justify-center overflow-hidden"
      style={{ opacity }}
    >
      {/* Background text */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
        style={{ y }}
      >
        <span className="text-[15vw] font-black text-white/[0.02] whitespace-nowrap">
          TRANCE AWARDS
        </span>
      </motion.div>

      <div className="relative z-10 text-center px-4">
        {/* Logos */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center gap-4 mb-8"
        >
          <Image
            src="/images/logo.png"
            alt="יוצאים לטראק"
            width={70}
            height={70}
            className="rounded-2xl border-2 border-white/20"
          />
          <span className="text-white/30 text-2xl">×</span>
          <Image
            src="/images/musikroom.png"
            alt="Musikroom"
            width={70}
            height={70}
            className="rounded-2xl border-2 border-white/20 bg-white p-2"
          />
        </motion.div>

        {/* Main title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-5xl sm:text-6xl md:text-7xl font-black mb-4"
        >
          <span className="bg-gradient-to-l from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            נבחרי השנה
          </span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-6xl sm:text-7xl md:text-8xl font-black text-white mb-6"
        >
          2025
        </motion.div>

        {/* Trophy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-7xl sm:text-8xl mb-6"
        >
          <motion.span
            animate={{ 
              rotate: [0, -5, 5, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="inline-block"
          >
            🏆
          </motion.span>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-xl sm:text-2xl text-white/70 mb-8"
        >
          הקהילה בחרה • התוצאות נחשפות
        </motion.p>

        {/* Total votes */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30"
        >
          <span className="text-xl">🗳️</span>
          <span className="text-white font-bold text-lg">{TOTAL_VOTES} הצבעות</span>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ 
            opacity: { delay: 1.2, duration: 0.5 },
            y: { delay: 1.2, duration: 1.5, repeat: Infinity }
          }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm">גללו למטה לתוצאות</span>
            <span className="text-2xl">↓</span>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════

const SOCIALS = [
  { name: "Instagram", url: "https://www.instagram.com/track_trip.trance/", color: "#E1306C", Icon: FaInstagram },
  { name: "YouTube", url: "https://www.youtube.com/@tracktripil", color: "#FF0000", Icon: FaYoutube },
  { name: "Spotify", url: "https://open.spotify.com/show/0LGP2n3IGqeFVVlflZOkeZ", color: "#1DB954", Icon: FaSpotify },
  { name: "TikTok", url: "https://www.tiktok.com/@tracktripil", color: "#000000", Icon: FaTiktok },
  { name: "WhatsApp", url: "https://chat.whatsapp.com/LSZaHTgYXPn4HRvrsCnmTc", color: "#25D366", Icon: FaWhatsapp },
];

// Category display order
const CATEGORY_ORDER = [
  "best-female-artist",
  "best-artist", 
  "best-group",
  "best-album",
  "best-track",
  "breakthrough",
];

export default function ResultsPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
    setIsClient(true);
  }, []);

  return (
    <>
      <Head>
        <title>תוצאות נבחרי השנה 2025 — יוצאים לטראק</title>
        <meta name="description" content="התוצאות הרשמיות של נבחרי השנה בטראנס 2025! גלו מי ניצח בכל קטגוריה." />
        <meta name="theme-color" content="#0f0f1a" />
        <meta property="og:title" content="תוצאות נבחרי השנה 2025 — יוצאים לטראק" />
        <meta property="og:description" content="הקהילה בחרה! צפו בתוצאות נבחרי השנה בטראנס 2025 🏆" />
        <meta property="og:image" content="https://tracktrip.co.il/images/logo.png" />
        <link rel="icon" type="image/png" href="/images/logo.png" />
      </Head>

      <main className="min-h-screen bg-[#0a0a14] text-white overflow-x-hidden">
        {/* Animated backgrounds */}
        {isClient && (
          <>
            <ParticleField />
            <GlowingOrbs />
          </>
        )}

        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a14]/80 backdrop-blur-xl">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/images/logo.png"
                alt="יוצאים לטראק"
                width={36}
                height={36}
                className="rounded-full border border-white/15"
              />
              <span className="text-sm opacity-80 hidden sm:inline">יוצאים לטראק</span>
            </Link>
            <div className="ms-auto">
              <Link
                href="/vote"
                className="text-white/60 hover:text-white text-sm transition"
              >
                חזרה לעמוד הראשי
              </Link>
            </div>
          </div>
        </header>

        {/* Hero */}
        <HeroSection />

        {/* Results sections */}
        <div className="relative z-10 max-w-3xl mx-auto px-4 py-16 space-y-20">
          {CATEGORY_ORDER.map((catId, index) => {
            const data = RESULTS_DATA[catId as keyof typeof RESULTS_DATA];
            if (!data) return null;
            return (
              <CategorySection
                key={catId}
                categoryId={catId}
                data={data}
                index={index}
              />
            );
          })}
        </div>

        {/* Share section */}
        <section className="relative z-10 max-w-3xl mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl p-8 text-center bg-gradient-to-br from-purple-900/30 to-cyan-900/20 border border-purple-500/20"
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 bg-gradient-to-l from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              שתפו את התוצאות! 🎉
            </h2>
            <p className="text-white/70 mb-6">
              עזרו לנו להגיע ליותר אנשים בקהילה
            </p>

            <div className="flex flex-wrap gap-3 justify-center">
              {SOCIALS.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-white font-medium shadow-lg"
                  style={{ backgroundColor: social.color }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <social.Icon className="w-5 h-5" />
                  <span>{social.name}</span>
                </motion.a>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 border-t border-white/10 bg-[#0a0a14]/80 py-8">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <p className="text-white/60 text-sm">
              © {new Date().getFullYear()} יוצאים לטראק — נבחרי השנה בטראנס
            </p>
            <p className="text-white/40 text-xs mt-2">
              {TOTAL_VOTES} הצבעות מהקהילה הישראלית 🇮🇱
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}

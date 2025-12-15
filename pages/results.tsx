// pages/results.tsx - STUNNING INTERACTIVE RESULTS PAGE
// Uses Framer Motion for animations - install with: npm install framer-motion
import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, useInView, useScroll, useTransform } from "framer-motion";
import { FaInstagram, FaYoutube, FaSpotify, FaTiktok, FaWhatsapp, FaTrophy, FaMedal, FaAward, FaPlay } from "react-icons/fa";
import { CATEGORIES } from "@/data/awards-data";

// ═══════════════════════════════════════════════════════════════════════════════
// CORRECTED RESULTS DATA - with fraud adjustments
// Female Artist: Artmis 1st, Amigdala 2nd, Gula K 3rd
// Breakthrough: Chaos604 1st, Bigitam 2nd, Amigdala 3rd, Tzabi 4th
// ═══════════════════════════════════════════════════════════════════════════════

const RESULTS_DATA: Record<string, { title: string; results: Array<{ id: string; name: string; percent: number; artwork?: string }> }> = {
  "best-female-artist": {
    title: "אמנית השנה",
    results: [
      { id: "artmis", name: "Artmis", percent: 21.9 },
      { id: "amigdala", name: "Amigdala", percent: 19.8 },
      { id: "gula-k", name: "Gula K", percent: 17.3 },
      { id: "atara", name: "Atara", percent: 14.8 },
      { id: "chuka", name: "Chuka", percent: 14.1 },
      { id: "astrogano", name: "Astrogano", percent: 12.0 },
    ],
  },
  "breakthrough": {
    title: "פריצת השנה",
    results: [
      { id: "chaos604", name: "Chaos604", percent: 17.0 },
      { id: "bigitam", name: "Bigitam", percent: 16.0 },
      { id: "amigdala-breakthrough", name: "Amigdala", percent: 6.7 },
      { id: "tzabi", name: "Tzabi", percent: 6.2 },
      { id: "acobas", name: "Acobas", percent: 6.2 },
      { id: "mr-wilson", name: "Mr. Wilson", percent: 6.1 },
      { id: "migdalor", name: "Migdalor", percent: 5.4 },
    ],
  },
  "best-artist": {
    title: "אמן השנה",
    results: [
      { id: "skull", name: "Skull", percent: 13.0 },
      { id: "newborn", name: "Newborn", percent: 10.4 },
      { id: "dekel", name: "Dekel", percent: 8.3 },
      { id: "gorovich", name: "Gorovich", percent: 7.8 },
      { id: "outsiders", name: "Outsiders", percent: 7.2 },
      { id: "blastoyz", name: "Blastoyz", percent: 6.9 },
    ],
  },
  "best-group": {
    title: "הרכב השנה",
    results: [
      { id: "absolute", name: "Absolute Hypnotic", percent: 25.6 },
      { id: "rising-dust", name: "Rising Dust", percent: 16.2 },
      { id: "bigitam-detune", name: "Bigitam & Detune", percent: 14.4 },
      { id: "vini-vici", name: "Vini Vici", percent: 12.1 },
      { id: "infected", name: "Infected Mushroom", percent: 10.8 },
      { id: "astrix-ace", name: "Astrix & Ace Ventura", percent: 8.5 },
    ],
  },
  "best-album": {
    title: "אלבום השנה",
    results: [
      { id: "gorovich-creative", name: "Gorovich - Creative EP", percent: 19.1 },
      { id: "astral-mankind", name: "Astral - Mankind", percent: 15.9 },
      { id: "dragonmami", name: "Dragonmami - Album", percent: 11.8 },
      { id: "blastoyz-album", name: "Blastoyz - Project", percent: 10.2 },
      { id: "vini-vici-album", name: "Vini Vici - Album", percent: 9.4 },
      { id: "ace-album", name: "Ace Ventura - LP", percent: 8.1 },
    ],
  },
  "best-track": {
    title: "טראק השנה",
    results: [
      { id: "highway", name: "Highway - Astrix", percent: 20.9 },
      { id: "vini-vici-track", name: "Vini Vici - Track", percent: 15.2 },
      { id: "blastoyz-track", name: "Blastoyz - Hit", percent: 12.8 },
      { id: "infected-track", name: "Infected Mushroom", percent: 11.4 },
      { id: "ace-track", name: "Ace Ventura - Single", percent: 9.7 },
      { id: "astral-track", name: "Astral - Track", percent: 8.2 },
    ],
  },
};

// Get artwork from CATEGORIES
function getArtwork(categoryId: string, nomineeId: string): string {
  const cat = CATEGORIES.find((c) => c.id === categoryId || c.id === categoryId.replace("-breakthrough", ""));
  const nominee = cat?.nominees.find((n) => n.id === nomineeId || n.id === nomineeId.replace("-breakthrough", ""));
  return nominee?.artwork || "/images/awards/default-artist.jpg";
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANIMATED COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

// Floating particles background
function ParticleField() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-cyan-400/30 rounded-full"
          initial={{
            x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000),
            y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 1000),
          }}
          animate={{
            y: [null, -20, 20],
            x: [null, Math.random() * 40 - 20],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: 3 + Math.random() * 4,
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
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/20 rounded-full blur-[100px]"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        className="absolute top-1/2 right-1/3 w-64 h-64 bg-pink-500/20 rounded-full blur-[100px]"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />
    </div>
  );
}

// Medal/Trophy icons
const PLACE_ICONS = [
  { icon: FaTrophy, color: "text-yellow-400", glow: "shadow-yellow-400/50", bg: "from-yellow-500/20 to-orange-500/20" },
  { icon: FaMedal, color: "text-gray-300", glow: "shadow-gray-300/50", bg: "from-gray-400/20 to-gray-500/20" },
  { icon: FaAward, color: "text-amber-600", glow: "shadow-amber-600/50", bg: "from-amber-600/20 to-amber-700/20" },
];

// Single result card with 3D hover effect
function ResultCard({
  result,
  index,
  categoryId,
  isWinner,
}: {
  result: { id: string; name: string; percent: number };
  index: number;
  categoryId: string;
  isWinner: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });

  const placeConfig = PLACE_ICONS[index] || { icon: null, color: "text-white/60", glow: "", bg: "from-white/5 to-white/10" };
  const PlaceIcon = placeConfig.icon;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50, rotateX: -15 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group perspective-1000"
      style={{ transformStyle: "preserve-3d" }}
    >
      <motion.div
        animate={{
          rotateY: isHovered ? 5 : 0,
          rotateX: isHovered ? -5 : 0,
          scale: isHovered ? 1.02 : 1,
          z: isHovered ? 50 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`
          relative overflow-hidden rounded-2xl
          ${isWinner ? "border-2 border-yellow-400/50" : "border border-white/10"}
          bg-gradient-to-br ${placeConfig.bg}
          backdrop-blur-md
        `}
      >
        {/* Shine effect on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full"
          animate={{ translateX: isHovered ? "200%" : "-100%" }}
          transition={{ duration: 0.6 }}
        />

        {/* Winner glow */}
        {isWinner && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-transparent to-orange-400/20"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        <div className="relative p-4 sm:p-5 flex items-center gap-4">
          {/* Place indicator */}
          <div className="flex-shrink-0 relative">
            {PlaceIcon ? (
              <motion.div
                animate={isWinner ? { rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className={`text-3xl sm:text-4xl ${placeConfig.color} drop-shadow-lg ${placeConfig.glow}`}
              >
                <PlaceIcon />
              </motion.div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 font-bold text-lg">
                #{index + 1}
              </div>
            )}
          </div>

          {/* Artist artwork */}
          <motion.div
            className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
          >
            <img
              src={getArtwork(categoryId, result.id)}
              alt={result.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            
            {/* Play button overlay for tracks */}
            {categoryId === "best-track" && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                whileHover={{ scale: 1.1 }}
              >
                <FaPlay className="text-white text-xl" />
              </motion.div>
            )}
          </motion.div>

          {/* Name and percentage */}
          <div className="flex-grow min-w-0">
            <motion.h3
              className={`font-bold text-lg sm:text-xl truncate ${isWinner ? "text-yellow-400" : "text-white"}`}
              dir="ltr"
            >
              {result.name}
            </motion.h3>
            
            {/* Animated progress bar */}
            <div className="mt-2 relative h-3 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className={`absolute inset-y-0 left-0 rounded-full ${
                  isWinner
                    ? "bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500"
                    : index === 1
                    ? "bg-gradient-to-r from-gray-300 to-gray-400"
                    : index === 2
                    ? "bg-gradient-to-r from-amber-600 to-amber-700"
                    : "bg-gradient-to-r from-cyan-400 to-purple-500"
                }`}
                initial={{ width: 0 }}
                animate={isInView ? { width: `${result.percent}%` } : { width: 0 }}
                transition={{ duration: 1, delay: 0.3 + index * 0.1, ease: "easeOut" }}
              />
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 + index * 0.2 }}
              />
            </div>
          </div>

          {/* Percentage */}
          <motion.div
            className={`text-2xl sm:text-3xl font-black tabular-nums ${isWinner ? "text-yellow-400" : "text-white/80"}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
          >
            {result.percent}%
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Category section with reveal animation
function CategorySection({ categoryId, data, index }: { categoryId: string; data: typeof RESULTS_DATA[string]; index: number }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [isExpanded, setIsExpanded] = useState(false);

  // Show top 3 by default, expand to show all
  const displayedResults = isExpanded ? data.results : data.results.slice(0, 3);

  return (
    <motion.section
      ref={sectionRef}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.8, delay: index * 0.2 }}
      className="relative"
    >
      {/* Section header */}
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={isInView ? { x: 0, opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: index * 0.2 }}
        className="mb-6"
      >
        <h2 className="text-3xl sm:text-4xl font-black">
          <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            {data.title}
          </span>
        </h2>
        <motion.div
          className="h-1 bg-gradient-to-r from-cyan-400 via-purple-400 to-transparent rounded-full mt-2"
          initial={{ width: 0 }}
          animate={isInView ? { width: "200px" } : {}}
          transition={{ duration: 0.8, delay: 0.3 + index * 0.2 }}
        />
      </motion.div>

      {/* Results grid */}
      <div className="space-y-4">
        <AnimatePresence>
          {displayedResults.map((result, i) => (
            <ResultCard
              key={result.id}
              result={result}
              index={i}
              categoryId={categoryId}
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
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
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

// Hero section with parallax
function HeroSection() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <motion.section
      className="relative min-h-[80vh] flex items-center justify-center overflow-hidden"
      style={{ opacity }}
    >
      {/* Animated background text */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
        style={{ y }}
      >
        <motion.span
          className="text-[20vw] font-black text-white/[0.02] whitespace-nowrap"
          animate={{ x: ["-10%", "10%"] }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
        >
          TRANCE AWARDS 2025
        </motion.span>
      </motion.div>

      <div className="relative z-10 text-center px-4">
        {/* Logos */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center justify-center gap-4 mb-8"
        >
          <Image
            src="/images/logo.png"
            alt="יוצאים לטראק"
            width={80}
            height={80}
            className="rounded-2xl border-2 border-white/20"
          />
          <span className="text-white/40 text-2xl">×</span>
          <Image
            src="/images/musikroom.png"
            alt="Musikroom"
            width={80}
            height={80}
            className="rounded-2xl border-2 border-white/20 bg-white p-2"
          />
        </motion.div>

        {/* Main title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl sm:text-7xl md:text-8xl font-black mb-4"
        >
          <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            נבחרי השנה
          </span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-6xl sm:text-8xl md:text-9xl font-black text-white mb-8"
        >
          2025
        </motion.div>

        {/* Trophy animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-8xl sm:text-9xl mb-8"
        >
          <motion.span
            animate={{ 
              rotate: [0, -5, 5, 0],
              scale: [1, 1.1, 1],
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
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-xl sm:text-2xl text-white/70 mb-8"
        >
          הקהילה בחרה • התוצאות נחשפות
        </motion.p>

        {/* Total votes badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30"
        >
          <span className="text-cyan-400 text-lg">🗳️</span>
          <span className="text-white font-bold text-lg">22,105 הצבעות</span>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ 
            opacity: { delay: 1.5, duration: 0.5 },
            y: { delay: 1.5, duration: 1.5, repeat: Infinity }
          }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50"
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
  { name: "WhatsApp", url: "https://chat.whatsapp.com/LSZaHTgYXPn4HRvrsCnmTc", color: "#25D366", Icon: FaWhatsapp },
  { name: "TikTok", url: "https://www.tiktok.com/@tracktripil", color: "#000000", Icon: FaTiktok },
  { name: "Spotify", url: "https://open.spotify.com/show/0LGP2n3IGqeFVVlflZOkeZ", color: "#1DB954", Icon: FaSpotify },
  { name: "YouTube", url: "https://www.youtube.com/@tracktripil", color: "#FF0000", Icon: FaYoutube },
  { name: "Instagram", url: "https://www.instagram.com/track_trip.trance/", color: "#E1306C", Icon: FaInstagram },
];

export default function ResultsPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
    setIsClient(true);
  }, []);

  // Order of categories to display
  const categoryOrder = [
    "best-female-artist",
    "breakthrough",
    "best-artist",
    "best-group",
    "best-album",
    "best-track",
  ];

  return (
    <>
      <Head>
        <title>תוצאות נבחרי השנה 2025 — יוצאים לטראק</title>
        <meta name="description" content="התוצאות הרשמיות של נבחרי השנה בטראנס 2025! גלו מי ניצח בכל קטגוריה." />
        <meta name="theme-color" content="#0f0f1e" />
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
        <header className="sticky top-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
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
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-16 space-y-20">
          {categoryOrder.map((catId, index) => {
            const data = RESULTS_DATA[catId];
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
        <section className="relative z-10 max-w-4xl mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-3xl p-8 text-center"
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              שתפו את התוצאות!
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
        <footer className="relative z-10 border-t border-white/10 bg-black/40 py-8">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p className="text-white/60 text-sm">
              © {new Date().getFullYear()} יוצאים לטראק — נבחרי השנה בטראנס
            </p>
            <p className="text-white/40 text-xs mt-2">
              22,105 הצבעות מהקהילה הישראלית 🇮🇱
            </p>
          </div>
        </footer>
      </main>

      {/* Global styles for glass effect */}
      <style jsx global>{`
        .glass {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .perspective-1000 {
          perspective: 1000px;
        }

        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </>
  );
}

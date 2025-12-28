// pages/story/[category].tsx - Elegant Instagram Story optimized winner pages
import React, { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { motion } from "framer-motion";

// ═══════════════════════════════════════════════════════════════════════════════
// WINNERS DATA
// ═══════════════════════════════════════════════════════════════════════════════

const WINNERS: Record<string, {
  category: string;
  categoryEnglish: string;
  name: string;
  artwork: string;
  accentColor: string;
}> = {
  "best-female-artist": {
    category: "אמנית השנה",
    categoryEnglish: "FEMALE ARTIST OF THE YEAR",
    name: "Artmis",
    artwork: "/images/artmis.jpg",
    accentColor: "#D4AF37",
  },
  "best-artist": {
    category: "אמן השנה",
    categoryEnglish: "ARTIST OF THE YEAR",
    name: "Laughing Skull",
    artwork: "/images/skull.jpeg",
    accentColor: "#D4AF37",
  },
  "best-group": {
    category: "הרכב השנה",
    categoryEnglish: "GROUP OF THE YEAR",
    name: "Absolute Hypnotic",
    artwork: "/images/absolute.jpg",
    accentColor: "#D4AF37",
  },
  "best-album": {
    category: "אלבום השנה",
    categoryEnglish: "ALBUM OF THE YEAR",
    name: "Astral Projection",
    artwork: "/images/astralforall.jpg",
    accentColor: "#D4AF37",
  },
  "best-track": {
    category: "טראק השנה",
    categoryEnglish: "TRACK OF THE YEAR",
    name: "Laughing Skull",
    artwork: "/images/highway.jpg",
    accentColor: "#D4AF37",
  },
  "breakthrough": {
    category: "פריצת השנה",
    categoryEnglish: "BREAKTHROUGH OF THE YEAR",
    name: "Chaos604",
    artwork: "/images/chaos.jpg",
    accentColor: "#D4AF37",
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// ELEGANT STORY CARD - Optimized for 9:16 with LARGER elements
// ═══════════════════════════════════════════════════════════════════════════════

function StoryCard({ winner }: { winner: typeof WINNERS[string] }) {
  return (
    <div className="relative w-full h-full bg-[#0a0a0a] overflow-hidden">
      
      {/* Subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]" />
      
      {/* Gold glow behind artwork - more visible */}
      <div 
        className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full opacity-[0.08]"
        style={{ background: `radial-gradient(circle, ${winner.accentColor} 0%, transparent 70%)` }}
      />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-between py-10 px-6">
        
        {/* Top: Track Trip branding - prominent */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col items-center gap-2"
        >
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt="יוצאים לטראק"
              width={36}
              height={36}
              className="rounded-xl border border-white/20"
            />
            <div className="flex flex-col items-start">
              <span className="text-white/90 text-sm font-medium">יוצאים לטראק</span>
              <span className="text-white/40 text-[9px] tracking-wider">TRACK TRIP</span>
            </div>
          </div>
          <div className="flex items-center gap-2" dir="rtl">
            <span className="text-white/30 text-[8px]">בשיתוף</span>
            <Image
              src="/images/musikroom.png"
              alt="Musikroom"
              width={16}
              height={16}
              className="rounded"
            />
            <span className="text-white/30 text-[8px]">Musikroom</span>
          </div>
        </motion.div>

        {/* Middle: Main content - LARGER */}
        <div className="flex flex-col items-center text-center flex-1 justify-center">
          
          {/* Category - BIGGER */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-2"
          >
            <span 
              className="text-sm tracking-[0.4em] font-medium"
              style={{ color: winner.accentColor }}
            >
              2025
            </span>
          </motion.div>

          {/* Category Hebrew - BIGGER */}
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-2xl font-bold text-white/80 mb-1 tracking-wide"
          >
            {winner.category}
          </motion.h2>

          {/* Category English */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mb-6"
          >
            <span className="text-[10px] tracking-[0.2em] text-white/40 font-light">
              {winner.categoryEnglish}
            </span>
          </motion.div>

          {/* Winner artwork - BIGGER */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="relative mb-6"
          >
            {/* Gold ring glow */}
            <div 
              className="absolute inset-0 rounded-full scale-[1.04] opacity-40"
              style={{ 
                background: `linear-gradient(135deg, ${winner.accentColor}60 0%, transparent 50%, ${winner.accentColor}40 100%)`,
              }}
            />
            
            {/* Image - LARGER */}
            <div className="relative w-52 h-52 sm:w-60 sm:h-60 rounded-full overflow-hidden border-2 border-white/20">
              <img
                src={winner.artwork}
                alt={winner.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/images/logo.png";
                }}
              />
            </div>
          </motion.div>

          {/* Winner name - MUCH BIGGER */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="text-4xl sm:text-5xl font-bold tracking-wide mb-4"
            style={{ color: winner.accentColor }}
            dir="ltr"
          >
            {winner.name}
          </motion.h1>

          {/* Winner badge - simple solid design for clean rendering */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.85 }}
            className="mt-2"
          >
            <div 
              className="px-10 py-3 rounded-full"
              style={{ 
                backgroundColor: "#D4AF37",
              }}
            >
              <span 
                className="text-base tracking-[0.2em] font-bold uppercase"
                style={{ color: "#0a0a0a" }}
              >
                Winner
              </span>
            </div>
          </motion.div>
        </div>

        {/* Bottom: Track Trip branding */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="flex flex-col items-center gap-1"
        >
          <p className="text-white/50 text-xs tracking-wide">
            נבחרי השנה בטראנס
          </p>
          <p className="text-[9px] tracking-[0.15em] text-white/30 font-light">
            TRACKTRIP.CO.IL/RESULTS
          </p>
        </motion.div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function StoryPage() {
  const router = useRouter();
  const { category } = router.query;
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Hide scrollbars for clean screenshot
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const winner = category ? WINNERS[category as string] : null;

  if (!isClient) {
    return (
      <div className="w-screen h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white/20 text-xs tracking-[0.3em]">LOADING</div>
      </div>
    );
  }

  if (!winner) {
    return (
      <div className="w-screen h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        <div className="text-center p-8">
          <h1 className="text-lg font-light mb-6 tracking-wide text-white/60">Category Not Found</h1>
          <div className="space-y-2">
            {Object.keys(WINNERS).map((cat) => (
              <a 
                key={cat}
                href={`/story/${cat}`}
                className="block text-xs text-white/30 hover:text-white/60 transition tracking-wide"
              >
                {WINNERS[cat].name}
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{winner.name} | {winner.category} 2025</title>
        <meta name="description" content={`${winner.name} - ${winner.categoryEnglish} | Trance Awards 2025`} />
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link rel="icon" type="image/png" href="/images/logo.png" />
      </Head>

      {/* Full screen for easy screenshot */}
      <main className="w-screen h-screen bg-[#0a0a0a]">
        <StoryCard winner={winner} />
      </main>
    </>
  );
}

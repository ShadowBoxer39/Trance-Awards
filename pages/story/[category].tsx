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
// ELEGANT STORY CARD - Optimized for 9:16
// ═══════════════════════════════════════════════════════════════════════════════

function StoryCard({ winner }: { winner: typeof WINNERS[string] }) {
  return (
    <div className="relative w-full h-full bg-[#0a0a0a] overflow-hidden">
      
      {/* Subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]" />
      
      {/* Very subtle gold glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-[0.04]"
        style={{ background: `radial-gradient(circle, ${winner.accentColor} 0%, transparent 70%)` }}
      />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-between py-12 px-6">
        
        {/* Top: Track Trip branding - prominent */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt="יוצאים לטראק"
              width={40}
              height={40}
              className="rounded-xl border border-white/20"
            />
            <div className="flex flex-col items-start">
              <span className="text-white/90 text-sm font-medium">יוצאים לטראק</span>
              <span className="text-white/40 text-[10px] tracking-wide">TRACK TRIP</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-white/30 text-[9px]">בשיתוף</span>
            <Image
              src="/images/musikroom.png"
              alt="Musikroom"
              width={20}
              height={20}
              className="rounded"
            />
            <span className="text-white/30 text-[9px]">Musikroom</span>
          </div>
        </motion.div>

        {/* Middle: Main content */}
        <div className="flex flex-col items-center text-center flex-1 justify-center -mt-4">
          
          {/* Year */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-6"
          >
            <span 
              className="text-[11px] tracking-[0.5em] font-light"
              style={{ color: winner.accentColor }}
            >
              2025
            </span>
          </motion.div>

          {/* Category English */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-1"
          >
            <span className="text-[9px] tracking-[0.25em] text-white/35 font-light">
              {winner.categoryEnglish}
            </span>
          </motion.div>

          {/* Category Hebrew */}
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-base font-light text-white/50 mb-10 tracking-wide"
          >
            {winner.category}
          </motion.h2>

          {/* Winner artwork */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="relative mb-8"
          >
            {/* Subtle gold ring glow */}
            <div 
              className="absolute inset-0 rounded-full scale-[1.03] opacity-25"
              style={{ 
                background: `linear-gradient(135deg, ${winner.accentColor}50 0%, transparent 50%, ${winner.accentColor}30 100%)`,
              }}
            />
            
            {/* Image */}
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden border border-white/10">
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

          {/* Winner name */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-3xl sm:text-4xl font-light tracking-wide mb-5"
            style={{ color: winner.accentColor }}
            dir="ltr"
          >
            {winner.name}
          </motion.h1>

          {/* Elegant line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="w-12 h-px mb-5"
            style={{ backgroundColor: winner.accentColor, opacity: 0.3 }}
          />

          {/* Winner text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            <span className="text-[10px] tracking-[0.3em] text-white/40 font-light uppercase">
              Winner
            </span>
          </motion.div>
        </div>

        {/* Bottom: Track Trip branding */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="flex flex-col items-center gap-1"
        >
          <p className="text-white/50 text-[10px] tracking-wide">
            נבחרי השנה בטראנס 2025
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

      {/* Instagram Story aspect ratio container */}
      <main className="w-screen h-screen flex items-center justify-center bg-black">
        <div 
          className="relative bg-[#0a0a0a]"
          style={{
            // Perfect 9:16 aspect ratio for Instagram Stories
            width: "min(100vw, 56.25vh)",
            height: "min(100vh, 177.78vw)",
            maxWidth: "100vw",
            maxHeight: "100vh",
          }}
        >
          <StoryCard winner={winner} />
        </div>
      </main>
    </>
  );
}

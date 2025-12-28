// pages/story/[category].tsx - Elegant Instagram Story optimized winner pages
import React, { useEffect, useState, useRef } from "react";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import html2canvas from "html2canvas";

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

function StoryCard({ winner, cardRef }: { winner: typeof WINNERS[string]; cardRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div ref={cardRef as React.RefObject<HTMLDivElement>} className="relative w-full h-full bg-[#0a0a0a] overflow-hidden">
      
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
          <div className="flex items-center gap-2">
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

          {/* Winner badge - styled */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.85 }}
            className="px-6 py-2 rounded-full border"
            style={{ borderColor: `${winner.accentColor}50` }}
          >
            <span 
              className="text-sm tracking-[0.25em] font-medium uppercase"
              style={{ color: winner.accentColor }}
            >
              Winner
            </span>
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
  const [isDownloading, setIsDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsClient(true);
    // Hide scrollbars for clean screenshot
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleDownload = async () => {
    if (!cardRef.current || !winner) return;
    
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3, // High resolution for Instagram
        backgroundColor: "#0a0a0a",
        useCORS: true,
      });
      
      const link = document.createElement("a");
      link.download = `${winner.name.replace(/\s+/g, "-")}-${category}-winner-2025.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Download failed:", error);
    }
    setIsDownloading(false);
  };

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
      <main className="w-screen h-screen flex flex-col items-center justify-center bg-black gap-4">
        
        {/* Download button */}
        <motion.button
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          onClick={handleDownload}
          disabled={isDownloading}
          className="px-6 py-3 rounded-full text-sm font-medium tracking-wide transition-all flex items-center gap-2"
          style={{ 
            backgroundColor: isDownloading ? "#1a1a1a" : winner.accentColor,
            color: isDownloading ? "#666" : "#000"
          }}
        >
          {isDownloading ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>מוריד...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>הורד לאינסטגרם</span>
            </>
          )}
        </motion.button>

        {/* Story card */}
        <div 
          className="relative bg-[#0a0a0a] shadow-2xl"
          style={{
            // Perfect 9:16 aspect ratio for Instagram Stories
            width: "min(90vw, 50.625vh)", // slightly smaller to fit with button
            height: "min(85vh, 160vw)",
            maxWidth: "400px",
            maxHeight: "711px",
          }}
        >
          <StoryCard winner={winner} cardRef={cardRef} />
        </div>

        {/* Tip text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="text-white/30 text-xs text-center"
        >
          או צלם מסך ושתף ישירות לסטורי 📱
        </motion.p>
      </main>
    </>
  );
}

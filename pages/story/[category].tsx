
// pages/winner/[category].tsx - Beautiful shareable winner announcement pages
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
  categoryEmoji: string;
  name: string;
  artwork: string;
  gradient: string;
  accentColor: string;
}> = {
  "best-female-artist": {
    category: "אמנית השנה",
    categoryEmoji: "👩‍🎤",
    name: "Artmis",
    artwork: "/images/artmis.jpg",
    gradient: "from-pink-500 via-purple-500 to-indigo-500",
    accentColor: "#ec4899",
  },
  "best-artist": {
    category: "אמן השנה",
    categoryEmoji: "👨‍🎤",
    name: "Laughing Skull",
    artwork: "/images/skull.jpeg",
    gradient: "from-cyan-500 via-blue-500 to-purple-500",
    accentColor: "#06b6d4",
  },
  "best-group": {
    category: "הרכב השנה",
    categoryEmoji: "🎸",
    name: "Absolute Hypnotic",
    artwork: "/images/absolute.jpg",
    gradient: "from-orange-500 via-red-500 to-pink-500",
    accentColor: "#f97316",
  },
  "best-album": {
    category: "אלבום השנה",
    categoryEmoji: "💿",
    name: "Astral Projection",
    artwork: "/images/astralforall.jpg",
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    accentColor: "#10b981",
  },
  "best-track": {
    category: "טראק השנה",
    categoryEmoji: "🎵",
    name: "Laughing Skull",
    artwork: "/images/highway.jpg",
    gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
    accentColor: "#8b5cf6",
  },
  "breakthrough": {
    category: "פריצת השנה",
    categoryEmoji: "🚀",
    name: "Chaos604",
    artwork: "/images/chaos.jpg",
    gradient: "from-yellow-500 via-orange-500 to-red-500",
    accentColor: "#eab308",
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// ANIMATED BACKGROUND
// ═══════════════════════════════════════════════════════════════════════════════

function AnimatedBackground({ gradient }: { gradient: string }) {
  return (
    <div className="fixed inset-0 z-0">
      {/* Base dark background */}
      <div className="absolute inset-0 bg-[#0a0a12]" />
      
      {/* Animated gradient orbs */}
      <motion.div
        className={`absolute top-0 left-0 w-[150%] h-[150%] bg-gradient-to-br ${gradient} opacity-20 blur-[100px]`}
        animate={{
          rotate: [0, 360],
          scale: [1, 1.2, 1],
        }}
        transition={{
          rotate: { duration: 30, repeat: Infinity, ease: "linear" },
          scale: { duration: 8, repeat: Infinity, ease: "easeInOut" },
        }}
      />
      
      {/* Secondary orb */}
      <motion.div
        className="absolute bottom-0 right-0 w-[80%] h-[80%] bg-gradient-to-tl from-white/10 to-transparent rounded-full blur-[80px]"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Sparkle particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// WINNER CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

function WinnerCard({ winner }: { winner: typeof WINNERS[string] }) {
  return (
    <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">
      {/* Trophy animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0, rotate: -180 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
        className="text-7xl sm:text-8xl mb-6"
      >
        <motion.span
          animate={{ 
            rotate: [0, -10, 10, -10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut",
            repeatDelay: 1,
          }}
          className="inline-block filter drop-shadow-[0_0_30px_rgba(250,204,21,0.6)]"
        >
          🏆
        </motion.span>
      </motion.div>

      {/* Category title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="text-4xl">{winner.categoryEmoji}</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white/80">
            {winner.category}
          </h2>
        </div>
        <p className="text-white/50 text-sm">נבחרי השנה בטראנס 2025</p>
      </motion.div>

      {/* Winner artwork with glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.5, type: "spring" }}
        className="relative mb-8"
      >
        {/* Glow effect behind image */}
        <div 
          className={`absolute inset-0 bg-gradient-to-br ${winner.gradient} blur-[40px] opacity-60 scale-110 rounded-full`}
        />
        
        {/* Image container */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full overflow-hidden border-4 border-white/30 shadow-2xl">
          <img
            src={winner.artwork}
            alt={winner.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/images/logo.png";
            }}
          />
          
          {/* Shine overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent"
            animate={{
              opacity: [0, 0.5, 0],
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
              ease: "easeInOut",
            }}
          />
        </div>

        {/* Crown/badge above image */}
        <motion.div
          className="absolute -top-4 left-1/2 -translate-x-1/2 text-5xl"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          👑
        </motion.div>
      </motion.div>

      {/* Winner name */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="text-center mb-12"
      >
        <h1 
          className={`text-4xl sm:text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r ${winner.gradient} bg-clip-text text-transparent filter drop-shadow-lg`}
          dir="ltr"
        >
          {winner.name}
        </h1>
        
        {/* Winner badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 1, type: "spring", bounce: 0.6 }}
          className={`inline-flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r ${winner.gradient} text-white font-bold text-lg shadow-lg`}
        >
          <span>🎉</span>
          <span>המנצח!</span>
          <span>🎉</span>
        </motion.div>
      </motion.div>

      {/* Track Trip branding */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.9 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="flex items-center gap-3">
          <Image
            src="/images/logo.png"
            alt="יוצאים לטראק"
            width={50}
            height={50}
            className="rounded-xl border-2 border-white/20"
          />
          <span className="text-white/40 text-xl">×</span>
          <Image
            src="/images/musikroom.png"
            alt="Musikroom"
            width={50}
            height={50}
            className="rounded-xl border-2 border-white/20 bg-white p-1"
          />
        </div>
        
        <div className="text-center">
          <p className="text-white/60 text-sm font-medium">יוצאים לטראק × מיוזיק רום</p>
          <p className="text-white/40 text-xs mt-1">tracktrip.co.il/results</p>
        </div>
      </motion.div>

      {/* Confetti burst effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full"
            style={{
              left: "50%",
              top: "30%",
              backgroundColor: ["#FFD700", "#FF6B6B", "#4ECDC4", "#A855F7", "#F97316", "#EC4899"][i % 6],
            }}
            initial={{ 
              x: 0, 
              y: 0, 
              scale: 0,
              opacity: 1,
            }}
            animate={{
              x: (Math.random() - 0.5) * 400,
              y: (Math.random() - 0.5) * 400 + 200,
              scale: [0, 1, 0.5],
              opacity: [1, 1, 0],
              rotate: Math.random() * 720,
            }}
            transition={{
              duration: 2,
              delay: 1.2 + i * 0.03,
              ease: "easeOut",
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function WinnerPage() {
  const router = useRouter();
  const { category } = router.query;
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
    setIsClient(true);
  }, []);

  const winner = category ? WINNERS[category as string] : null;

  if (!isClient) {
    return (
      <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center">
        <div className="text-white/50">טוען...</div>
      </div>
    );
  }

  if (!winner) {
    return (
      <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">קטגוריה לא נמצאה</h1>
          <p className="text-white/60 mb-4">הקטגוריות הזמינות:</p>
          <ul className="space-y-2">
            {Object.keys(WINNERS).map((cat) => (
              <li key={cat}>
                <a 
                  href={`/winner/${cat}`}
                  className="text-purple-400 hover:text-purple-300 transition"
                >
                  {WINNERS[cat].category} - {WINNERS[cat].name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{winner.name} - {winner.category} | נבחרי השנה 2025</title>
        <meta name="description" content={`${winner.name} נבחר/ה ל${winner.category} בנבחרי השנה בטראנס 2025!`} />
        <meta name="theme-color" content={winner.accentColor} />
        <meta property="og:title" content={`🏆 ${winner.name} - ${winner.category}`} />
        <meta property="og:description" content={`${winner.name} נבחר/ה ל${winner.category} בנבחרי השנה בטראנס 2025 של יוצאים לטראק!`} />
        <meta property="og:image" content={`https://tracktrip.co.il${winner.artwork}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="icon" type="image/png" href="/images/logo.png" />
        
        {/* Prevent zoom on mobile for better screenshot */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </Head>

      <main className="min-h-screen overflow-hidden">
        <AnimatedBackground gradient={winner.gradient} />
        <WinnerCard winner={winner} />
      </main>
    </>
  );
}

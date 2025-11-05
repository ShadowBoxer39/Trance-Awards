// components/LiveVoteCounter.tsx
import React, { useEffect, useState } from "react";

export default function LiveVoteCounter() {
  const [count, setCount] = useState(100);
  const [isAnimating, setIsAnimating] = useState(false);

  // Fetch real count from API
  async function fetchCount() {
    try {
      const res = await fetch("/api/vote-count");
      const data = await res.json();
      if (data.ok && data.count > count) {
        setIsAnimating(true);
        setCount(data.count);
        setTimeout(() => setIsAnimating(false), 800);
      }
    } catch (err) {
      console.error("Failed to fetch vote count:", err);
    }
  }

  // Fetch on mount and every 10 seconds
  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 10000); // Every 10 seconds
    return () => clearInterval(interval);
  }, []);

  // Smooth counting animation
  const [displayCount, setDisplayCount] = useState(count);

  useEffect(() => {
    if (displayCount === count) return;

    const diff = count - displayCount;
    const increment = Math.ceil(Math.abs(diff) / 20);
    const timer = setTimeout(() => {
      if (displayCount < count) {
        setDisplayCount(Math.min(displayCount + increment, count));
      }
    }, 30);

    return () => clearTimeout(timer);
  }, [displayCount, count]);

  return (
    <div className="relative">
      {/* Glowing background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-xl animate-pulse-slow" />
      
      {/* Counter card */}
      <div className="relative glass rounded-2xl p-6 border-2 border-cyan-500/30 overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 animate-gradient" />
        
        <div className="relative z-10 text-center">
          {/* Label */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-sm sm:text-base text-white/70">הצביעו עד כה</span>
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          </div>

          {/* Counter */}
          <div className={`transition-all duration-500 ${isAnimating ? "scale-110" : "scale-100"}`}>
            <div className="text-4xl sm:text-5xl md:text-6xl font-black">
              <span className="bg-gradient-to-r from-cyan-400 via-green-400 to-purple-500 bg-clip-text text-transparent">
                {displayCount.toLocaleString("he-IL")}
              </span>
            </div>
          </div>

          {/* Subtitle */}
          <div className="text-xs sm:text-sm text-white/60 mt-2 flex items-center justify-center gap-1">
            <span>🔥</span>
            <span>הצטרפו עכשיו!</span>
          </div>
        </div>

        {/* Particle effects on new vote */}
        {isAnimating && (
          <>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-4 border-cyan-400/30 rounded-full animate-ping" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-4 border-purple-400/30 rounded-full animate-ping" style={{ animationDelay: "0.2s" }} />
          </>
        )}
      </div>
    </div>
  );
}

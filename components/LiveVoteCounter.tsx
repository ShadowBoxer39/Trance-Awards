// components/LiveVoteCounter.tsx
import React, { useEffect, useRef, useState } from "react";

// Voting deadline - December 10, 2025 at 23:59:59 Israel Time
const VOTING_DEADLINE = new Date("2025-12-10T23:59:59+02:00").getTime();

// Final vote count (manually set) - this is the number shown when voting is closed
const FINAL_VOTE_COUNT = 22105;

export default function LiveVoteCounter() {
  const [count, setCount] = useState<number | null>(null);
  const [displayCount, setDisplayCount] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const fetchTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  async function fetchCount() {
    try {
      const res = await fetch("/api/vote-count", { cache: "no-store" });
      const data = await res.json();
      if (data?.ok && typeof data.count === "number") {
        if (count === null) {
          setCount(data.count);
          setDisplayCount(data.count);
        } else if (data.count !== count) {
          setIsAnimating(true);
          setCount(data.count);
          setTimeout(() => setIsAnimating(false), 800);
        }
      }
    } catch (e) {
      console.error("vote-count fetch failed", e);
    }
  }

  // Check if voting has expired
  useEffect(() => {
    setIsClient(true);
    const checkExpired = () => {
      const expired = new Date().getTime() > VOTING_DEADLINE;
      setIsExpired(expired);
      
      // Set final count when expired - use hardcoded value, don't fetch from API
      if (expired) {
        setCount(FINAL_VOTE_COUNT);
        setDisplayCount(FINAL_VOTE_COUNT);
      }
    };
    checkExpired();
    
    // Check every minute if not expired
    const interval = setInterval(checkExpired, 60000);
    return () => clearInterval(interval);
  }, []);

  // First fetch + re-sync every 15s (only if voting is still open)
  useEffect(() => {
    if (!isExpired) {
      fetchCount();
      fetchTimer.current = setInterval(fetchCount, 15000);
    }
    return () => {
      if (fetchTimer.current) clearInterval(fetchTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpired]);

  // Smoothly animate `displayCount` toward `count` - but NOT when expired
  useEffect(() => {
    if (isExpired) return; // Don't animate when voting is closed
    if (count === null || displayCount === null) return;
    if (displayCount === count) return;

    const diff = count - displayCount;
    const step = Math.ceil(Math.abs(diff) / 20);
    const t = setTimeout(() => {
      const next = displayCount < count ? Math.min(displayCount + step, count) : count;
      setDisplayCount(next);
    }, 30);

    return () => clearTimeout(t);
  }, [displayCount, count, isExpired]);

  // When expired, always show the final count directly
  const shown = isExpired ? FINAL_VOTE_COUNT : (displayCount ?? count);
  const formatted = shown != null ? shown.toLocaleString("he-IL") : "…";

  // Don't render until client-side
  if (!isClient) {
    return (
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-xl animate-pulse-slow" />
        <div className="relative glass rounded-2xl p-6 border-2 border-cyan-500/30 overflow-hidden min-h-[180px] sm:min-h-[200px]" />
      </div>
    );
  }

  // Voting closed - show final count with different styling
  if (isExpired) {
    return (
      <div className="relative">
        {/* Glowing background effect - golden/celebration colors */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-purple-500/20 blur-xl animate-pulse-slow" />

        {/* Counter card */}
        <div className="relative glass rounded-2xl p-6 border-2 border-yellow-500/30 overflow-hidden min-h-[180px] sm:min-h-[200px]">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-purple-500/10 animate-gradient" />

          <div className="relative z-10 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-sm sm:text-base text-white/70">סה״כ הצבעות</span>
              <span className="text-lg">🎉</span>
            </div>

            <div className="relative">
              <div className="text-4xl sm:text-5xl md:text-6xl font-black tabular-nums">
                <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 bg-clip-text text-transparent">
                  {formatted}
                </span>
              </div>
            </div>

            <div className="text-xs sm:text-sm text-white/60 mt-3 flex items-center justify-center gap-1">
              <span>🙏</span>
              <span>תודה לכל המצביעים!</span>
            </div>

            {/* Final badge */}
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
              <span className="text-yellow-400 text-sm font-medium">✓ תוצאות סופיות</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Voting still open - show live counter
  return (
    <div className="relative">
      {/* Glowing background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-xl animate-pulse-slow" />

      {/* Counter card */}
      <div className="relative glass rounded-2xl p-6 border-2 border-cyan-500/30 overflow-hidden min-h-[180px] sm:min-h-[200px]">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 animate-gradient" />

        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-sm sm:text-base text-white/70">הצביעו עד כה</span>
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          </div>

          <div className="relative">
            <div className={`transition-all duration-500 ${isAnimating ? "scale-110" : "scale-100"} will-change-transform`}>
              <div className="text-4xl sm:text-5xl md:text-6xl font-black tabular-nums">
                <span className="bg-gradient-to-r from-cyan-400 via-green-400 to-purple-500 bg-clip-text text-transparent">
                  {formatted}
                </span>
              </div>
            </div>
          </div>

          <div className="text-xs sm:text-sm text-white/60 mt-2 flex items-center justify-center gap-1">
            <span>🔥</span>
            <span>הצצטרפו עכשיו!</span>
          </div>
        </div>

        {isAnimating && shown != null && (
          <div className="pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-4 border-cyan-400/30 rounded-full animate-ping" />
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-4 border-purple-400/30 rounded-full animate-ping"
              style={{ animationDelay: "0.2s" }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

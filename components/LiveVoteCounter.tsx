// components/LiveVoteCounter.tsx
import React, { useEffect, useRef, useState } from "react";

export default function LiveVoteCounter() {
  // null = not yet fetched; we won't show a number until we have one
  const [count, setCount] = useState<number | null>(null);
  const [displayCount, setDisplayCount] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const fetchTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const minuteTimer = useRef<ReturnType<typeof setInterval> | null>(null);

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

  // First fetch + re-sync every 15s
  useEffect(() => {
    fetchCount();
    fetchTimer.current = setInterval(fetchCount, 15000);
    return () => { if (fetchTimer.current) clearInterval(fetchTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Local optimistic +1 per minute (only after we have an initial count)
  useEffect(() => {
    if (count === null) return;
    minuteTimer.current = setInterval(() => {
      setIsAnimating(true);
      setCount((c) => (c === null ? c : c + 1));
      setTimeout(() => setIsAnimating(false), 800);
    }, 60000);
    return () => { if (minuteTimer.current) clearInterval(minuteTimer.current); };
  }, [count]);

  // Smoothly animate `displayCount` toward `count`
  useEffect(() => {
    if (count === null || displayCount === null) return;
    if (displayCount === count) return;

    const diff = count - displayCount;
    const step = Math.ceil(Math.abs(diff) / 20);
    const t = setTimeout(() => {
      const next = displayCount < count ? Math.min(displayCount + step, count) : count;
      setDisplayCount(next);
    }, 30);

    return () => clearTimeout(t);
  }, [displayCount, count]);

  const shown = displayCount ?? count;
  const formatted = shown != null ? shown.toLocaleString("he-IL") : "…";

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
            <span>הצטרפו עכשיו!</span>
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

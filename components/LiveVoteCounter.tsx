import React, { useEffect, useRef, useState } from "react";

export default function LiveVoteCounter() {
  // 1) Source of truth in the UI
  const [count, setCount] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem("liveVoteCount");
      if (saved) return Number(saved) || 100;
    }
    return 100; // temporary fallback; replaced on first fetch
  });
  const [displayCount, setDisplayCount] = useState<number>(count);
  const [isAnimating, setIsAnimating] = useState(false);

  // Guards for timers so we can clear them
  const fetchTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const minuteTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Smooth animation to a new number
  function animateTo(next: number) {
    if (next === count) return;
    setIsAnimating(true);
    setCount(next);
    // persist so refresh doesn't flash back
    try {
      window.localStorage.setItem("liveVoteCount", String(next));
    } catch {}
    setTimeout(() => setIsAnimating(false), 800);
  }

  async function fetchCount() {
    try {
      const res = await fetch("/api/vote-count", { cache: "no-store" });
      const data = await res.json();
      if (data?.ok && typeof data.count === "number") {
        // Snap to server value if we drifted
        if (data.count !== count) animateTo(data.count);
      }
    } catch (e) {
      // silent retry next interval
      console.error("vote-count fetch failed", e);
    }
  }

  // Initial fetch + periodic re-sync
  useEffect(() => {
    fetchCount(); // first sync
    // re-sync every 15s to stay accurate
    fetchTimer.current = setInterval(fetchCount, 15000);
    return () => {
      if (fetchTimer.current) clearInterval(fetchTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Local optimistic tick: +1 every 60s
  useEffect(() => {
    minuteTimer.current = setInterval(() => {
      animateTo(count + 1);
    }, 60000);
    return () => {
      if (minuteTimer.current) clearInterval(minuteTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  // Incremental render animation toward `count`
  useEffect(() => {
    if (displayCount === count) return;
    const diff = count - displayCount;
    const step = Math.ceil(Math.abs(diff) / 20);
    const t = setTimeout(() => {
      setDisplayCount((prev) =>
        prev < count ? Math.min(prev + step, count) : count
      );
    }, 30);
    return () => clearTimeout(t);
  }, [displayCount, count]);

  return (
    <div className="relative">
      {/* Glowing background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-xl animate-pulse-slow" />

      {/* Counter card */}
      <div className="relative glass rounded-2xl p-6 border-2 border-cyan-500/30 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 animate-gradient" />

        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-sm sm:text-base text-white/70">הצביעו עד כה</span>
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          </div>

          <div className={`transition-all duration-500 ${isAnimating ? "scale-110" : "scale-100"}`}>
            <div className="text-4xl sm:text-5xl md:text-6xl font-black">
              <span className="bg-gradient-to-r from-cyan-400 via-green-400 to-purple-500 bg-clip-text text-transparent">
                {displayCount.toLocaleString("he-IL")}
              </span>
            </div>
          </div>

          <div className="text-xs sm:text-sm text-white/60 mt-2 flex items-center justify-center gap-1">
            <span>🔥</span>
            <span>הצטרפו עכשיו!</span>
          </div>
        </div>

        {isAnimating && (
          <>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-4 border-cyan-400/30 rounded-full animate-ping" />
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-4 border-purple-400/30 rounded-full animate-ping"
              style={{ animationDelay: "0.2s" }}
            />
          </>
        )}
      </div>
    </div>
  );
}

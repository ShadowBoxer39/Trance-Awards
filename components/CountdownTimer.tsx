// components/CountdownTimer.tsx
import React, { useEffect, useState } from "react";

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    // Set deadline to December 1st, 2025 at 23:59:59
    const deadline = new Date("2025-12-01T23:59:59").getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = deadline - now;

      if (distance < 0) {
        setIsExpired(true);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    // Update immediately
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  if (isExpired) {
    return (
      <div className="glass rounded-2xl p-6 border-2 border-red-500/30">
        <div className="text-center">
          <div className="text-4xl mb-2">⏰</div>
          <div className="text-xl font-bold text-red-400">ההצבעה הסתיימה!</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Glowing background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-orange-500/20 blur-xl animate-pulse-slow" />

      {/* Timer card */}
      <div className="relative glass rounded-2xl p-4 sm:p-6 border-2 border-pink-500/30 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-orange-500/10 to-red-500/10 animate-gradient" />

        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-xs sm:text-sm text-white/70">⏰ זמן נותר להצבעה</span>
            </div>
            <div className="text-sm sm:text-base font-bold text-pink-400">
              יום אחרון: 1 בדצמבר
            </div>
          </div>

          {/* Countdown Display */}
          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            {/* Days */}
            <div className="flex flex-col items-center">
              <div className="bg-white/5 rounded-xl sm:rounded-2xl p-2 sm:p-4 w-full border border-white/10">
                <div className="text-2xl sm:text-4xl md:text-5xl font-black tabular-nums">
                  <span className="bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
                    {String(timeLeft.days).padStart(2, "0")}
                  </span>
                </div>
              </div>
              <div className="text-xs sm:text-sm text-white/60 mt-1 sm:mt-2">ימים</div>
            </div>

            {/* Hours */}
            <div className="flex flex-col items-center">
              <div className="bg-white/5 rounded-xl sm:rounded-2xl p-2 sm:p-4 w-full border border-white/10">
                <div className="text-2xl sm:text-4xl md:text-5xl font-black tabular-nums">
                  <span className="bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
                    {String(timeLeft.hours).padStart(2, "0")}
                  </span>
                </div>
              </div>
              <div className="text-xs sm:text-sm text-white/60 mt-1 sm:mt-2">שעות</div>
            </div>

            {/* Minutes */}
            <div className="flex flex-col items-center">
              <div className="bg-white/5 rounded-xl sm:rounded-2xl p-2 sm:p-4 w-full border border-white/10">
                <div className="text-2xl sm:text-4xl md:text-5xl font-black tabular-nums">
                  <span className="bg-gradient-to-r from-yellow-400 to-green-400 bg-clip-text text-transparent">
                    {String(timeLeft.minutes).padStart(2, "0")}
                  </span>
                </div>
              </div>
              <div className="text-xs sm:text-sm text-white/60 mt-1 sm:mt-2">דקות</div>
            </div>

            {/* Seconds */}
            <div className="flex flex-col items-center">
              <div className="bg-white/5 rounded-xl sm:rounded-2xl p-2 sm:p-4 w-full border border-white/10">
                <div className="text-2xl sm:text-4xl md:text-5xl font-black tabular-nums">
                  <span className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                    {String(timeLeft.seconds).padStart(2, "0")}
                  </span>
                </div>
              </div>
              <div className="text-xs sm:text-sm text-white/60 mt-1 sm:mt-2">שניות</div>
            </div>
          </div>

          {/* Footer message */}
          <div className="text-center mt-4">
            <div className="text-xs sm:text-sm text-white/60 flex items-center justify-center gap-1">
              <span>⚡</span>
              <span>אל תפספסו!</span>
            </div>
          </div>
        </div>

        {/* Animated pulse effect */}
        {timeLeft.days === 0 && (
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border-4 border-red-400/20 rounded-2xl animate-ping" />
          </div>
        )}
      </div>
    </div>
  );
}

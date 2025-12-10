// components/CountdownTimer.tsx
import React, { useEffect, useState } from "react";

// Voting deadline - December 10, 2025 at 23:59:59 Israel Time
const VOTING_DEADLINE = new Date("2025-12-10T23:59:59+02:00").getTime();

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isExpired, setIsExpired] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = VOTING_DEADLINE - now;

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

  // Don't render anything until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-orange-500/20 blur-xl animate-pulse-slow" />
        <div className="relative glass rounded-2xl p-4 sm:p-6 border-2 border-pink-500/30 overflow-hidden min-h-[180px]" />
      </div>
    );
  }

  // Voting has ended - show closed message
  if (isExpired) {
    return (
      <div className="relative">
        {/* Glowing background effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 blur-xl animate-pulse-slow" />

        {/* Closed message card */}
        <div className="relative glass rounded-2xl p-6 sm:p-8 border-2 border-purple-500/30 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-cyan-500/10 to-pink-500/10 animate-gradient" />

          <div className="relative z-10 text-center">
            {/* Trophy/celebration icon */}
            <div className="text-5xl sm:text-6xl mb-4 animate-bounce">🏆</div>
            
            {/* Main message */}
            <h3 className="text-2xl sm:text-3xl font-bold mb-2">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                ההצבעה הסתיימה!
              </span>
            </h3>
            
            <p className="text-white/80 text-base sm:text-lg mb-4">
              תודה לכל מי שהשתתף 🙏
            </p>

            {/* Results teaser */}
            <div className="glass rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-center gap-2 text-sm sm:text-base">
                <span className="text-yellow-400">⭐</span>
                <span className="text-white/90 font-medium">התוצאות יפורסמו בקרוב!</span>
                <span className="text-yellow-400">⭐</span>
              </div>
              <p className="text-white/60 text-xs sm:text-sm mt-2">
                עקבו אחרינו ברשתות לעדכונים
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Voting is still open - show countdown
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
              יום אחרון: 10 בדצמבר
            </div>
          </div>

          {/* Countdown Display - LEFT TO RIGHT */}
          <div className="grid grid-cols-4 gap-2 sm:gap-4" dir="ltr">
            {/* Days - LEFTMOST */}
            <div className="flex flex-col items-center">
              <div className="bg-white/5 rounded-xl sm:rounded-2xl p-2 sm:p-4 w-full border border-white/10">
                <div className="text-2xl sm:text-4xl md:text-5xl font-black tabular-nums text-center">
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
                <div className="text-2xl sm:text-4xl md:text-5xl font-black tabular-nums text-center">
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
                <div className="text-2xl sm:text-4xl md:text-5xl font-black tabular-nums text-center">
                  <span className="bg-gradient-to-r from-yellow-400 to-green-400 bg-clip-text text-transparent">
                    {String(timeLeft.minutes).padStart(2, "0")}
                  </span>
                </div>
              </div>
              <div className="text-xs sm:text-sm text-white/60 mt-1 sm:mt-2">דקות</div>
            </div>

            {/* Seconds - RIGHTMOST */}
            <div className="flex flex-col items-center">
              <div className="bg-white/5 rounded-xl sm:rounded-2xl p-2 sm:p-4 w-full border border-white/10">
                <div className="text-2xl sm:text-4xl md:text-5xl font-black tabular-nums text-center">
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

        {/* Animated pulse effect when less than 1 day remaining */}
        {timeLeft.days === 0 && (
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border-4 border-red-400/20 rounded-2xl animate-ping" />
          </div>
        )}
      </div>
    </div>
  );
}

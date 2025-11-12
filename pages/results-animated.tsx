// pages/results-animated.tsx - CINEMATIC REVEAL WITH ANIMATIONS
import React from "react";
import Image from "next/image";
import { CATEGORIES } from "@/data/awards-data";

const RESULTS = {
  "best-album": { winner: "gorovich-creative", votes: 241, percent: 19.1 },
  "best-artist": { winner: "skull", votes: 164, percent: 13.0 },
  "best-female-artist": { winner: "amigdala", votes: 268, percent: 21.2 },
  "best-group": { winner: "absolute", votes: 324, percent: 25.6 },
  "best-track": { winner: "highway", votes: 265, percent: 20.9 },
  "breakthrough": { winner: "chaos604", votes: 256, percent: 20.2 },
};

export default function ResultsAnimated() {
  const [currentCategory, setCurrentCategory] = React.useState(0);
  const [isRevealing, setIsRevealing] = React.useState(false);
  const [showWinner, setShowWinner] = React.useState(false);
  
  const categories = Object.keys(RESULTS);
  const currentCatId = categories[currentCategory];
  const currentResult = currentCatId ? RESULTS[currentCatId] : null;

  React.useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
  }, []);

  const revealNext = () => {
    if (currentCategory < categories.length) {
      setIsRevealing(true);
      setShowWinner(false);
      
      // Show winner after suspense
      setTimeout(() => {
        setShowWinner(true);
      }, 2000);
    }
  };

  const goToNext = () => {
    if (currentCategory < categories.length - 1) {
      setCurrentCategory(prev => prev + 1);
      setIsRevealing(false);
      setShowWinner(false);
    }
  };

  const getNomineeData = (catId: string, nomineeId: string) => {
    const cat = CATEGORIES.find(c => c.id === catId);
    const nominee = cat?.nominees.find(n => n.id === nomineeId);
    return {
      name: nominee?.name || nomineeId,
      artwork: nominee?.artwork || "/images/default.jpg",
    };
  };

  const getCategoryTitle = (catId: string) => {
    const cat = CATEGORIES.find(c => c.id === catId);
    return cat?.title || catId;
  };

  if (!currentResult) {
    return (
      <main className="min-h-screen neon-backdrop text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-6 animate-bounce">🎉</div>
          <h1 className="text-5xl font-[900] gradient-title mb-4">
            כל הזוכים נחשפו!
          </h1>
          <p className="text-xl text-white/70 mb-8">תודה שהיית חלק מזה</p>
          <a href="/results" className="btn-primary rounded-2xl px-8 py-4 text-lg font-bold inline-block">
            צפה בכל התוצאות
          </a>
        </div>
      </main>
    );
  }

  const winnerData = getNomineeData(currentCatId, currentResult.winner);

  return (
    <main className="min-h-screen neon-backdrop text-white relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        
        {/* Progress */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2">
          <div className="flex gap-2">
            {categories.map((_, idx) => (
              <div
                key={idx}
                className={`w-3 h-3 rounded-full transition-all ${
                  idx < currentCategory 
                    ? 'bg-green-400' 
                    : idx === currentCategory 
                    ? 'bg-cyan-400 animate-pulse' 
                    : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Category Title */}
        <div className="mb-12 text-center">
          <div className="text-sm text-white/60 mb-2">קטגוריה {currentCategory + 1} מתוך {categories.length}</div>
          <h2 className={`text-4xl sm:text-6xl font-[900] gradient-title transition-all duration-1000 ${
            isRevealing ? 'scale-110' : 'scale-100'
          }`}>
            {getCategoryTitle(currentCatId)}
          </h2>
          <div className="text-white/70 mt-2">{currentResult.votes} הצבעות</div>
        </div>

        {/* Reveal Area */}
        <div className="max-w-2xl w-full">
          {!isRevealing && (
            <button
              onClick={revealNext}
              className="w-full btn-primary rounded-3xl px-12 py-6 text-2xl font-[900] animate-pulse"
            >
              חשוף את הזוכה! 🏆
            </button>
          )}

          {isRevealing && !showWinner && (
            <div className="glass rounded-3xl p-12 text-center">
              <div className="text-8xl animate-spin mb-6">🎭</div>
              <div className="text-2xl font-bold text-white/70 animate-pulse">
                מחשב את התוצאות...
              </div>
            </div>
          )}

          {showWinner && (
            <div className="glass rounded-3xl p-8 animate-[fadeIn_1s_ease-in]">
              {/* Trophy */}
              <div className="text-center mb-6">
                <div className="text-8xl animate-bounce inline-block">🏆</div>
              </div>

              {/* Winner Image */}
              <div className="relative mb-6 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-10" />
                <img
                  src={winnerData.artwork}
                  alt={winnerData.name}
                  className="w-full aspect-square object-cover animate-[zoomIn_1s_ease-out]"
                />
              </div>

              {/* Winner Name */}
              <div className="text-center mb-6">
                <div className="text-sm text-cyan-400 mb-2">🥇 הזוכה הוא...</div>
                <h1 className="text-4xl sm:text-5xl font-[900] leading-tight mb-3 animate-[slideUp_0.8s_ease-out]">
                  {winnerData.name}
                </h1>
                <div className="text-6xl font-[900] gradient-title animate-[pulse_2s_ease-in-out_infinite]">
                  {currentResult.percent}%
                </div>
              </div>

              {/* Confetti effect */}
              <div className="flex justify-center gap-3 text-4xl mb-6">
                <span className="animate-bounce" style={{animationDelay: '0s'}}>🎉</span>
                <span className="animate-bounce" style={{animationDelay: '0.1s'}}>🎊</span>
                <span className="animate-bounce" style={{animationDelay: '0.2s'}}>✨</span>
                <span className="animate-bounce" style={{animationDelay: '0.3s'}}>🎉</span>
              </div>

              {/* Next Button */}
              {currentCategory < categories.length - 1 ? (
                <button
                  onClick={goToNext}
                  className="w-full btn-primary rounded-2xl px-8 py-4 text-xl font-bold"
                >
                  הבא ←
                </button>
              ) : (
                <a
                  href="/results"
                  className="block w-full btn-primary rounded-2xl px-8 py-4 text-xl font-bold text-center"
                >
                  צפה בכל התוצאות 🎊
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoomIn {
          from { transform: scale(1.2); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </main>
  );
}

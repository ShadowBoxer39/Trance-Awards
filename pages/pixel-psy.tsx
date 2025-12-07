import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Navigation from '../components/Navigation';
import { FaArrowRight, FaShareAlt, FaHeartBroken, FaHeart } from 'react-icons/fa';
import Link from 'next/link';

// --- Configuration ---
const MAX_ATTEMPTS = 5;
// Blur amount in pixels. 
// Level 0 (Start) = 30px (Very blurry but colors visible)
// Level 4 (Last chance) = 5px (Almost clear)
// Win = 0px (HD)
const BLUR_LEVELS = [30, 20, 12, 6, 2]; 

export default function PixelPsy() {
  const [challenge, setChallenge] = useState<any>(null);
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [history, setHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
    fetchGame();
  }, []);

  const fetchGame = async () => {
    try {
      const res = await fetch('/api/pixel-game');
      const data = await res.json();
      if (data.ok) setChallenge(data.challenge);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGuess = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (gameStatus !== 'playing' || !guess.trim()) return;

    const userGuess = guess.trim().toLowerCase();
    const cleanSolution = challenge.solution.trim().toLowerCase();

    if (userGuess === cleanSolution) {
      setGameStatus('won');
    } else {
      setHistory([...history, guess]); 
      setGuess('');
      setShake(true);
      setTimeout(() => setShake(false), 500);

      const nextAttempt = attempts + 1;
      setAttempts(nextAttempt);
      
      if (nextAttempt >= MAX_ATTEMPTS) {
        setGameStatus('lost');
      }
    }
  };

  const handleShare = async () => {
    const day = challenge?.day_index || '#1';
    let boxes = '';
    
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
        if (i < history.length) boxes += '🟥'; 
        else if (gameStatus === 'won' && i === history.length) boxes += '🟩'; 
        else boxes += '⬛';
    }

    const text = `Pixel Psy ${day}\n${boxes}\n${gameStatus === 'won' ? 'זיהיתי!' : 'לא הצלחתי...'}\nhttps://tracktrip.co.il/pixel-psy`;

    if (navigator.share) {
        try { await navigator.share({ text }); } catch(e){}
    } else {
        navigator.clipboard.writeText(text);
        alert('התוצאה הועתקה ללוח!');
    }
  };

  // Determine current visual state
  const currentBlur = (gameStatus !== 'playing') ? 0 : BLUR_LEVELS[Math.min(attempts, BLUR_LEVELS.length - 1)];

  if (loading) return (
    <div className="min-h-screen bg-[#050814] flex items-center justify-center text-white">
      <div className="animate-pulse text-2xl font-bold tracking-widest text-green-500">LOADING SYSTEM...</div>
    </div>
  );

  if (!challenge) return (
      <div className="min-h-screen bg-[#050814] text-white flex items-center justify-center">
          <Navigation />
          <div className="text-xl text-gray-400">אין משחק פעיל היום, נסה מחר!</div>
      </div>
  );

  return (
    <div className="min-h-screen bg-[#050814] text-white font-sans selection:bg-green-500/30 overflow-x-hidden">
      <Head>
          <title>Pixel Psy | יוצאים לטראק</title>
          <meta name="theme-color" content="#050814" />
      </Head>
      
      <Navigation />

      <main className="max-w-lg mx-auto px-4 pt-28 pb-12"> {/* Increased pt-24 -> pt-28 */}
        
        {/* Header - Fixed clipping by adding padding to the text element */}
        <div className="flex justify-between items-center mb-8 relative">
             <Link href="/" className="text-gray-500 hover:text-green-400 transition absolute right-0 top-2">
                <FaArrowRight />
             </Link>
             <div className="w-full text-center">
                 <h1 className="text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-teal-500 transform -rotate-2 pb-2 pr-2">
                    PIXEL PSY
                 </h1>
                 <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em]">Daily Challenge {challenge?.day_index}</p>
             </div>
        </div>

        {/* Lives Counter */}
        <div className="flex justify-center gap-2 mb-6">
            {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
                <span key={i} className={`text-xl transition-all duration-300 ${i < (MAX_ATTEMPTS - attempts) ? 'text-red-500 scale-100' : 'text-gray-800 scale-75'}`}>
                    {i < (MAX_ATTEMPTS - attempts) ? <FaHeart /> : <FaHeartBroken />}
                </span>
            ))}
        </div>

        {/* --- IMAGE FRAME (No Canvas, just CSS Blur) --- */}
        <div className={`relative aspect-square w-full bg-black rounded-xl overflow-hidden border-4 shadow-[0_0_40px_rgba(16,185,129,0.15)] transition-all duration-300 ${
            shake ? 'border-red-500 translate-x-1' : 
            gameStatus === 'won' ? 'border-green-500 shadow-[0_0_50px_rgba(16,185,129,0.5)]' : 'border-gray-800'
        }`}>
            {/* The Image - HD Source with CSS Filter */}
            <img 
              src={challenge.image_url} 
              alt="Hidden Artist"
              className="w-full h-full object-cover transition-all duration-700 ease-out"
              style={{ 
                  filter: `blur(${currentBlur}px)`,
                  // Slight scale to hide blurred edges bleeding white
                  transform: 'scale(1.05)' 
              }} 
            />

            {/* Scanline Overlay (Visual Polish) */}
            <div className="absolute inset-0 z-10 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
            
            {/* Game Over Overlay */}
            {gameStatus !== 'playing' && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-end pb-8 bg-gradient-to-t from-black via-black/80 to-transparent animate-in fade-in duration-700">
                    <div className="text-center p-4">
                        <div className="inline-block px-4 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs text-gray-300 mb-3">
                            {gameStatus === 'won' ? 'אלוף!' : 'לא נורא...'}
                        </div>
                        <h2 className="text-4xl font-black text-white mb-1 drop-shadow-lg tracking-tight">
                            {challenge.solution}
                        </h2>
                    </div>
                </div>
            )}
        </div>

        {/* Input / Control Area */}
        <div className="mt-8">
            {gameStatus === 'playing' ? (
                <>
                    <form onSubmit={handleGuess} className="relative z-20">
                        <input 
                            type="text"
                            value={guess}
                            onChange={(e) => setGuess(e.target.value)}
                            className="w-full bg-[#0a0f20] border-2 border-[#1f2937] text-white px-5 py-4 rounded-xl focus:outline-none focus:border-green-500 focus:shadow-[0_0_20px_rgba(34,197,94,0.2)] transition-all text-center text-lg placeholder-gray-600 font-bold"
                            placeholder="מי בתמונה?"
                            autoComplete="off"
                            autoFocus
                        />
                        <button 
                            type="submit"
                            className="mt-4 w-full bg-green-600 hover:bg-green-500 text-black font-black py-4 rounded-xl transition-all active:scale-95 shadow-lg shadow-green-900/30"
                        >
                            נחש
                        </button>
                    </form>
                    
                    {/* Wrong Guesses Log */}
                    {history.length > 0 && (
                         <div className="mt-6 flex flex-wrap justify-center gap-2">
                            {history.map((h, i) => (
                                <span key={i} className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded text-xs line-through">
                                    {h}
                                </span>
                            ))}
                         </div>
                    )}
                </>
            ) : (
                /* Results / Share Area */
                <div className="space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-500">
                    <button 
                        onClick={handleShare}
                        className="w-full flex items-center justify-center gap-2 bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors shadow-xl"
                    >
                        <FaShareAlt />
                        שתף תוצאה
                    </button>
                    
                    <div className="text-center text-gray-500 text-xs mt-4">
                        אתגר חדש יעלה מחר ב-00:00
                    </div>
                </div>
            )}
        </div>
      </main>
    </div>
  );
}

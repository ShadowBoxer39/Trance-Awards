import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Navigation from '../components/Navigation';
import { FaArrowRight, FaShareAlt, FaHeartBroken, FaHeart } from 'react-icons/fa';
import Link from 'next/link';

// --- Configuration ---
const MAX_ATTEMPTS = 5;
// The "Pixel Factor" determines block size. 
// 0.02 = very blocky (2% resolution). 1 = Full HD.
const PIXEL_LEVELS = [0.015, 0.04, 0.08, 0.15, 1]; 

// --- Pixel Canvas Component ---
// This takes an image URL and a pixel factor, and renders a retro pixelated version
const PixelCanvas = ({ src, factor }: { src: string, factor: number }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const imgRef = useRef<HTMLImageElement | null>(null);
  
    useEffect(() => {
      const img = new Image();
      img.crossOrigin = "Anonymous"; // Allow external images
      img.src = src;
      img.onload = () => {
        imgRef.current = img;
        setImageLoaded(true);
        draw();
      };
    }, [src]);
  
    useEffect(() => {
      if (imageLoaded) draw();
    }, [factor, imageLoaded]);
  
    const draw = () => {
      const canvas = canvasRef.current;
      const img = imgRef.current;
      if (!canvas || !img) return;
  
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
  
      // Set canvas to image dimensions
      canvas.width = img.width;
      canvas.height = img.height;
  
      // 1. Calculate the tiny resolution
      const w = canvas.width * factor;
      const h = canvas.height * factor;
  
      // 2. Turn off smoothing to get crisp pixels
      ctx.imageSmoothingEnabled = false;
  
      // 3. Draw tiny image (downscale)
      ctx.drawImage(img, 0, 0, w, h);
  
      // 4. Draw it back huge (upscale) - this creates the blocks
      ctx.drawImage(canvas, 0, 0, w, h, 0, 0, canvas.width, canvas.height);
    };
  
    return <canvas ref={canvasRef} className="w-full h-full object-cover" />;
};

export default function PixelPsy() {
  const [challenge, setChallenge] = useState<any>(null);
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [history, setHistory] = useState<string[]>([]); // User's wrong guesses
  const [loading, setLoading] = useState(true);
  const [shake, setShake] = useState(false); // For wrong guess animation

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
      // Jump to max resolution
      setAttempts(PIXEL_LEVELS.length - 1); 
    } else {
      // Wrong guess
      setHistory([...history, guess]); // Add original case guess to history
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

  // --- Share Logic ---
  const handleShare = async () => {
    const day = challenge?.day_index || '#1';
    let boxes = '';
    
    // Generate squares: 🟩 = correct turn, 🟥 = wrong turn, ⬜ = unused
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
        if (i < history.length) boxes += '🟥'; // Wrong
        else if (gameStatus === 'won' && i === history.length) boxes += '🟩'; // Won on this turn
        else boxes += '⬛'; // Unused
    }

    const text = `Pixel Psy ${day}\n${boxes}\n${gameStatus === 'won' ? 'זיהיתי!' : 'לא הצלחתי...'}\nhttps://tracktrip.co.il/pixel-psy`;

    if (navigator.share) {
        try { await navigator.share({ text }); } catch(e){}
    } else {
        navigator.clipboard.writeText(text);
        alert('התוצאה הועתקה ללוח!');
    }
  };

  // Determine current pixel factor
  // If game over (win/loss), show full res (index 4). Else show current level.
  const currentFactor = (gameStatus !== 'playing') 
    ? 1 
    : PIXEL_LEVELS[Math.min(attempts, PIXEL_LEVELS.length - 1)];

  if (loading) return (
    <div className="min-h-screen bg-[#050814] flex items-center justify-center text-white">
      <div className="animate-pulse text-2xl font-bold tracking-widest text-green-500">LOADING SYSTEM...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050814] text-white font-sans selection:bg-green-500/30 overflow-x-hidden">
      <Head>
          <title>Pixel Psy | יוצאים לטראק</title>
          <meta name="theme-color" content="#050814" />
      </Head>
      
      <Navigation />

      <main className="max-w-lg mx-auto px-4 pt-24 pb-12">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
             <Link href="/" className="text-gray-500 hover:text-green-400 transition">
                <FaArrowRight />
             </Link>
             <div className="text-center">
                 <h1 className="text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 transform -rotate-2">
                    PIXEL PSY
                 </h1>
                 <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mt-1">Daily Challenge {challenge?.day_index}</p>
             </div>
             <div className="w-4" /> {/* Spacer */}
        </div>

        {/* Lives Counter */}
        <div className="flex justify-center gap-2 mb-6">
            {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
                <span key={i} className={`text-xl transition-all duration-300 ${i < (MAX_ATTEMPTS - attempts) ? 'text-red-500 scale-100' : 'text-gray-800 scale-75'}`}>
                    {i < (MAX_ATTEMPTS - attempts) ? <FaHeart /> : <FaHeartBroken />}
                </span>
            ))}
        </div>

        {/* --- CRT MONITOR FRAME --- */}
        <div className={`relative aspect-square w-full bg-black rounded-xl overflow-hidden border-4 shadow-[0_0_40px_rgba(16,185,129,0.15)] transition-colors duration-300 ${
            shake ? 'border-red-500 translate-x-1' : 
            gameStatus === 'won' ? 'border-green-500 shadow-[0_0_50px_rgba(16,185,129,0.5)]' : 'border-gray-800'
        }`}>
            {/* Scanline Overlay */}
            <div className="absolute inset-0 z-10 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
            <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-b from-transparent via-white/5 to-transparent h-full w-full bg-[length:100%_4px] opacity-20"></div>
            
            {/* The Dynamic Pixel Canvas */}
            <PixelCanvas src={challenge?.image_url || ''} factor={currentFactor} />

            {/* Game Over Overlay */}
            {gameStatus !== 'playing' && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-end pb-6 bg-gradient-to-t from-black via-black/80 to-transparent animate-in fade-in duration-700">
                    <div className="text-center">
                        <div className="inline-block px-4 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs text-gray-300 mb-2">
                            {gameStatus === 'won' ? 'אלוף!' : 'לא נורא...'}
                        </div>
                        <h2 className="text-3xl font-black text-white mb-1 drop-shadow-lg">
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
                        className="w-full flex items-center justify-center gap-2 bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors"
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

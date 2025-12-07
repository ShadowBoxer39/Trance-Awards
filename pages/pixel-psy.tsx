import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Navigation from '../components/Navigation';
import { createClient } from '@supabase/supabase-js';
import { FaEye, FaQuestionCircle, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

// Configurations
const MAX_ATTEMPTS = 5;
const BLUR_LEVELS = [20, 15, 10, 5, 0]; // Blur px: Starts high, goes to 0

export default function PixelPsy() {
  // Game State
  const [challenge, setChallenge] = useState<any>(null);
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Autocomplete State
  const [allArtists, setAllArtists] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
    fetchGameData();
  }, []);

  const fetchGameData = async () => {
    try {
      // 1. Fetch Challenge
      const res = await fetch('/api/pixel-game');
      const data = await res.json();
      if (data.ok) setChallenge(data.challenge);

      // 2. Fetch Artists List for Autocomplete
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      // Get artists from both tables
      const { data: artists } = await supabase.from('artists').select('stage_name');
      const { data: legends } = await supabase.from('legends').select('stage_name');
      
      const list = [
        ...(artists?.map(a => a.stage_name) || []),
        ...(legends?.map(l => l.stage_name) || [])
      ].filter(Boolean).sort();
      
      // Remove duplicates
      setAllArtists([...new Set(list)]);
      
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGuess = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isGameOver || !guess.trim()) return;

    const currentGuess = guess.trim();
    const correct = challenge.solution;
    
    // Add to history
    const newHistory = [...history, currentGuess];
    setHistory(newHistory);
    
    // Check Win
    if (currentGuess.toLowerCase() === correct.toLowerCase()) {
      setIsWon(true);
      setIsGameOver(true);
      setAttempts(BLUR_LEVELS.length - 1); // Reveal full image
    } else {
      // Wrong Guess
      const nextAttempt = attempts + 1;
      setAttempts(nextAttempt);
      if (nextAttempt >= MAX_ATTEMPTS) {
        setIsGameOver(true);
        setAttempts(BLUR_LEVELS.length - 1); // Reveal on loss too
      }
    }
    setGuess('');
    setSuggestions([]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setGuess(val);
    if (val.length > 0) {
      const filtered = allArtists.filter(a => a.toLowerCase().includes(val.toLowerCase())).slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (name: string) => {
    setGuess(name);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Calculate current blur - if game over (win/loss), 0 blur. Else use array.
  const currentBlur = isGameOver ? 0 : BLUR_LEVELS[Math.min(attempts, BLUR_LEVELS.length - 1)];

  if (loading) return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-2xl animate-pulse">טוען משחק...</div>
      </div>
  );

  if (!challenge) return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-xl text-gray-400">אין משחק פעיל היום, נסה מחר!</div>
      </div>
  );

  return (
    <div className="min-h-screen bg-[#050814] text-white font-sans selection:bg-purple-500/30" dir="rtl">
      <Head><title>Pixel Psy - נחשו את האמן</title></Head>
      <Navigation />

      <main className="max-w-xl mx-auto px-4 pt-24 pb-10">
        
        {/* Header */}
        <div className="text-center mb-8 relative">
          <Link href="/" className="absolute right-0 top-1 text-gray-500 hover:text-white transition">
            <FaArrowLeft />
          </Link>
          <h1 className="text-5xl font-black bg-gradient-to-r from-green-400 via-emerald-400 to-teal-500 bg-clip-text text-transparent italic tracking-tighter transform -rotate-2">
            PIXEL PSY
          </h1>
          <p className="text-gray-400 font-medium">נחשו את האמן המסתתר</p>
        </div>

        {/* Game Area */}
        <div className="relative aspect-square w-full max-w-md mx-auto bg-gray-900 rounded-2xl overflow-hidden border-4 border-gray-800 shadow-2xl mb-6 group">
            {/* The Image */}
            <img 
              src={challenge.image_url} 
              alt="Hidden Artist"
              className="w-full h-full object-cover transition-all duration-1000 ease-in-out"
              style={{ 
                  filter: `blur(${currentBlur}px)`,
                  transform: 'scale(1.1)' // Prevent blurred edges showing white
              }} 
            />
            
            {/* "GIVE UP" / STATUS Overlay */}
            {isGameOver && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-500">
                    <div className="text-center p-8 bg-gray-900/90 rounded-2xl border border-white/10 shadow-2xl transform scale-110">
                        <div className="text-5xl mb-3">{isWon ? '🎉' : '💀'}</div>
                        <h2 className="text-3xl font-black mb-1 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            {isWon ? 'כל הכבוד!' : 'המשחק נגמר'}
                        </h2>
                        <p className="text-gray-400 text-sm mb-4">האמן הוא:</p>
                        <p className="text-2xl font-black text-green-400 tracking-wide bg-green-900/20 px-4 py-2 rounded-lg border border-green-500/30">
                            {challenge.solution}
                        </p>
                        <button 
                            onClick={() => window.location.reload()}
                            className="mt-6 text-sm text-gray-500 hover:text-white underline decoration-gray-700 underline-offset-4"
                        >
                            שחק שוב (רענן)
                        </button>
                    </div>
                </div>
            )}
        </div>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-8 px-2">
            {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => {
                let statusClass = "bg-gray-800 border-gray-700"; // Empty
                if (i < attempts) statusClass = "bg-red-500/20 border-red-500/50"; // Wrong
                if (isWon && i === attempts) statusClass = "bg-green-500 border-green-400 shadow-[0_0_15px_rgba(74,222,128,0.5)]"; // Won
                
                return (
                    <div key={i} className={`h-3 flex-1 rounded-full border transition-all duration-500 ${statusClass}`} />
                );
            })}
        </div>

        {/* Input Area */}
        {!isGameOver && (
            <div className="relative mb-8 z-20">
                <form onSubmit={handleGuess} className="flex gap-3">
                    <div className="relative flex-1">
                        <input 
                            type="text" 
                            value={guess}
                            onChange={handleInputChange}
                            placeholder="הקלידו שם אמן..."
                            className="w-full bg-gray-900 border-2 border-gray-700 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all text-lg placeholder-gray-600"
                            autoFocus
                        />
                        
                        {/* Autocomplete Dropdown */}
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute bottom-full left-0 right-0 mb-2 bg-gray-800 rounded-xl border border-gray-600 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-2 fade-in">
                                {suggestions.map((s, i) => (
                                    <div 
                                        key={i}
                                        onClick={() => selectSuggestion(s)}
                                        className="px-4 py-3 hover:bg-green-600 hover:text-white cursor-pointer border-b border-gray-700/50 last:border-0 transition-colors"
                                    >
                                        {s}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <button 
                        type="submit"
                        disabled={!guess}
                        className="bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-green-900/20 active:scale-95 flex items-center justify-center min-w-[80px]"
                    >
                        נחש
                    </button>
                </form>
            </div>
        )}

        {/* History Log */}
        <div className="space-y-2">
            {history.map((h, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-xl animate-in slide-in-from-top-2 fade-in">
                    <span className="text-red-200 font-medium">{h}</span>
                    <span className="text-red-400 text-xs font-bold">X</span>
                </div>
            ))}
        </div>

      </main>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Navigation from '../components/Navigation';
import { FaArrowUp, FaArrowDown, FaCheck, FaShareAlt, FaQuestionCircle, FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';
import { createClient } from '@supabase/supabase-js';

// --- Configuration ---
const MAX_GUESSES = 8; 
const DELAY_MS = 350; // Delay between cell reveals 

interface FeedbackItem {
  value: string | number;
  match: boolean;
  direction?: 'higher' | 'lower' | 'equal';
}

interface GuessResult {
  name: FeedbackItem;
  genre: FeedbackItem;
  country: FeedbackItem;
  year: FeedbackItem;
  group: FeedbackItem;
  albums: FeedbackItem;
  letter: FeedbackItem;
}

export default function PsyDle() {
  const [query, setQuery] = useState('');
  const [allArtists, setAllArtists] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [guesses, setGuesses] = useState<GuessResult[]>([]);
  const [isWon, setIsWon] = useState(false);
  const [solution, setSolution] = useState<any>(null);
  const [silhouetteUrl, setSilhouetteUrl] = useState<string | null>(null);
  const [showSilhouette, setShowSilhouette] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [loading, setLoading] = useState(false);

  // Auto-scroll to bottom of grid when guessing
  const gridEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
    const seen = localStorage.getItem('psydle_instructions_seen');
    if (!seen) setShowInstructions(true);

    fetch('/api/game/psydle').then(r => r.json()).then(data => {
        if(data.names) setAllArtists(data.names);
        if(data.silhouetteUrl) setSilhouetteUrl(data.silhouetteUrl);
    });
  }, []);

  useEffect(() => {
    gridEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [guesses]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setQuery(val);
      if (val.length > 0) {
          setSuggestions(allArtists.filter(a => a.toLowerCase().includes(val.toLowerCase())).slice(0, 5));
      } else {
          setSuggestions([]);
      }
  };

  const submitGuess = async (artistName: string) => {
      if (guesses.some(g => g.name.value === artistName)) return;
      
      setQuery('');
      setSuggestions([]);
      setLoading(true);

      try {
          const res = await fetch('/api/game/psydle', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ guessName: artistName })
          });
          const data = await res.json();
          
          if (data.ok) {
              const newGuesses = [...guesses, data.feedback]; // Append to end for natural flow
              setGuesses(newGuesses);
              if (data.isCorrect) {
                  setTimeout(() => {
                      setIsWon(true);
                      setSolution(data.solution);
                      setShowSilhouette(true);
                  }, 2500); // Wait for animation
              }
          }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
  };

  const handleShare = async () => {
    let text = `Psy-Dle 2025 ${isWon ? '🏆' : '💀'} ${guesses.length}/${MAX_GUESSES}\n\n`;
    guesses.forEach(g => {
        text += (g.genre.match ? '🟩' : '⬛');
        text += (g.country.match ? '🟩' : '⬛');
        text += (g.year.match ? '🟩' : g.year.direction === 'higher' ? '⬆️' : '⬇️');
        text += (g.group.match ? '🟩' : '⬛');
        text += (g.albums.match ? '🟩' : g.albums.direction === 'higher' ? '⬆️' : '⬇️');
        text += '\n';
    });
    text += '\nhttps://tracktrip.co.il/psy-dle';

    if (navigator.share) {
        try { await navigator.share({ text }); } catch(e){}
    } else {
        navigator.clipboard.writeText(text);
        alert('הועתק ללוח!');
    }
  };

  // --- SUB-COMPONENTS ---

  // The Header Row (Sticky on mobile)
  const HeaderRow = () => (
      <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2 px-1 sticky top-20 z-30 bg-[#09090b] py-2 border-b border-white/10 text-[9px] md:text-xs text-gray-500 font-bold text-center uppercase tracking-wider">
            <div>אמן</div>
            <div>ז'אנר</div>
            <div>מדינה</div>
            <div>שנה</div>
            <div>הרכב</div>
            <div>אלבומים</div>
            <div>אות</div>
      </div>
  );

  // A Single Feedback Cell with 3D Flip
  const Cell = ({ item, delay, isText = false }: { item: FeedbackItem, delay: number, isText?: boolean }) => {
    // Determine styles
    const isMatch = item.match;
    const isHigher = item.direction === 'higher';
    const isLower = item.direction === 'lower';
    
    // Base Colors (Poeltl Style)
    // Green = Match
    // Yellow = Close/Direction (Only for arrows)
    // Gray = Wrong
    
    // Animation: We use a simple CSS animation with delay
    // We render the 'result' state immediately but hide it with animation
    
    let bgClass = 'bg-[#18181b] border-[#27272a]'; // Default dark
    if (isMatch) bgClass = 'bg-green-600 border-green-500 text-white shadow-[0_0_10px_rgba(22,163,74,0.4)]';
    
    // For text resizing (fit long names)
    const textLength = String(item.value).length;
    const fontSize = textLength > 12 ? 'text-[9px] md:text-[10px]' : textLength > 8 ? 'text-[10px] md:text-xs' : 'text-xs md:text-sm';

    return (
      <div 
        className="relative h-14 md:h-16 w-full perspective-1000"
      >
          <div 
            className={`w-full h-full flex flex-col items-center justify-center p-1 text-center border rounded-lg transition-all duration-700 ${bgClass}`}
            style={{ 
                animation: `flip-slot 0.6s ease-out forwards`,
                animationDelay: `${delay}ms`,
                opacity: 0, // Start hidden
                transform: 'rotateX(90deg)' // Start rotated
            }}
          >
              <span className={`font-bold leading-tight break-words ${fontSize}`}>
                  {item.value}
              </span>
              
              {/* Direction Arrows */}
              {!isMatch && (isHigher || isLower) && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                      {isHigher ? <FaArrowUp className="text-yellow-400 text-4xl" /> : <FaArrowDown className="text-yellow-400 text-4xl" />}
                  </div>
              )}
               {/* Small overlay arrows for clarity */}
               {!isMatch && isHigher && <FaArrowUp className="text-yellow-400 text-[10px] mt-1" />}
               {!isMatch && isLower && <FaArrowDown className="text-yellow-400 text-[10px] mt-1" />}
          </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans overflow-x-hidden">
      <Head><title>Psy-Dle | נחשו את האמן</title></Head>
      <Navigation />

      {/* Instructions Modal */}
      {showInstructions && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-gray-900 border border-purple-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
                <button onClick={() => setShowInstructions(false)} className="absolute top-4 left-4 text-gray-400 hover:text-white"><FaTimes /></button>
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">איך משחקים?</h2>
                    <p className="text-gray-400 text-sm">יש לכם 8 ניסיונות לנחש את האמן היומי.</p>
                </div>
                
                <div className="space-y-4 text-sm bg-black/40 p-4 rounded-xl mb-6">
                    <div className="flex items-center gap-3">
                        <span className="w-8 h-8 flex items-center justify-center bg-green-600 rounded-lg text-white font-bold">V</span>
                        <span>תכונה <strong>נכונה</strong> (ז'אנר, מדינה וכו')</span>
                    </div>
                    <div className="flex items-center gap-3">
                         <span className="w-8 h-8 flex items-center justify-center bg-[#18181b] border border-gray-700 rounded-lg text-white font-bold">X</span>
                        <span>תכונה <strong>לא נכונה</strong></span>
                    </div>
                    <div className="flex items-center gap-3">
                         <div className="w-8 h-8 flex items-center justify-center bg-[#18181b] border border-gray-700 rounded-lg text-white"><FaArrowUp className="text-yellow-400" /></div>
                        <span>התשובה <strong>גבוהה</strong> או <strong>מאוחרת</strong> יותר</span>
                    </div>
                </div>

                <button onClick={() => { setShowInstructions(false); localStorage.setItem('psydle_instructions_seen', 'true'); }} className="w-full btn-primary py-3 rounded-xl font-bold text-lg shadow-lg shadow-purple-500/20">
                    יאללה מתחילים!
                </button>
            </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-2 pt-24 pb-32">
        
        {/* HEADER */}
        <div className="flex flex-col items-center mb-8 relative">
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 neon-text-fix pb-2">
                PSY-DLE
            </h1>
            <button 
                onClick={() => setShowInstructions(true)} 
                className="absolute left-0 top-2 text-purple-400 hover:text-white transition opacity-60 hover:opacity-100"
            >
                <FaQuestionCircle size={24}/>
            </button>
        </div>

        {/* --- SILHOUETTE HINT --- */}
        {silhouetteUrl && !isWon && (
            <div className="flex flex-col items-center mb-8">
                 {/* Toggle Button */}
                 <button 
                    onClick={() => setShowSilhouette(!showSilhouette)}
                    className="flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/50 transition-all text-sm text-gray-300 mb-4"
                >
                    {showSilhouette ? <FaEyeSlash /> : <FaEye />} 
                    {showSilhouette ? 'הסתר רמז' : 'הצג רמז ויזואלי'}
                </button>

                {/* The "Silhouette" (Actually a glitchy preview) */}
                <div className={`transition-all duration-500 overflow-hidden ${showSilhouette ? 'h-40 opacity-100' : 'h-0 opacity-0'}`}>
                    <div className="relative w-40 h-40 rounded-full border-4 border-purple-500/30 bg-black shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                        <img 
                            src={silhouetteUrl} 
                            className="w-full h-full object-cover"
                            style={{ 
                                // Heavy blur + Grayscale to prevent easy guessing
                                filter: 'blur(15px) grayscale(100%) brightness(0.8) contrast(1.5)',
                                transform: 'scale(1.2)' 
                            }}
                        />
                        {/* Overlay to obscure details */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/80" />
                    </div>
                </div>
            </div>
        )}

        {/* --- VICTORY SCREEN --- */}
        {isWon && solution && (
            <div className="mb-10 animate-in zoom-in duration-500">
                <div className="bg-gradient-to-b from-gray-900 to-black border border-green-500/40 rounded-3xl p-8 max-w-md mx-auto text-center shadow-[0_0_50px_rgba(34,197,94,0.15)]">
                    <div className="relative w-40 h-40 mx-auto mb-6">
                        <img src={solution.image_url} className="w-full h-full rounded-full border-4 border-green-500 shadow-xl object-cover" />
                        <div className="absolute -bottom-2 -right-2 bg-green-500 text-black p-3 rounded-full text-2xl shadow-lg border-4 border-black">🎉</div>
                    </div>
                    <h2 className="text-4xl font-black text-white mb-2">{solution.name}</h2>
                    <div className="flex justify-center gap-2 mb-6">
                        <span className="bg-green-900/50 text-green-400 px-3 py-1 rounded-full text-xs border border-green-500/30">
                            {solution.genre}
                        </span>
                        <span className="bg-green-900/50 text-green-400 px-3 py-1 rounded-full text-xs border border-green-500/30">
                            {solution.country}
                        </span>
                    </div>
                    <button onClick={handleShare} className="w-full btn-primary py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 hover:scale-105 transition-transform">
                        <FaShareAlt /> שתף ניצחון
                    </button>
                    <p className="text-xs text-gray-600 mt-4">המשחק יתאפס מחר בחצות</p>
                </div>
            </div>
        )}

        {/* --- GAME GRID --- */}
        <div className="w-full max-w-4xl mx-auto">
            {guesses.length > 0 && <HeaderRow />}

            <div className="space-y-2 mb-32"> {/* Extra padding for bottom input */}
                {/* Past Guesses */}
                {guesses.map((g, i) => (
                    <div key={i} className="grid grid-cols-7 gap-1 md:gap-2">
                        <Cell item={g.name} delay={0} isText />
                        <Cell item={g.genre} delay={150} />
                        <Cell item={g.country} delay={300} />
                        <Cell item={g.year} delay={450} />
                        <Cell item={g.group} delay={600} />
                        <Cell item={g.albums} delay={750} />
                        <Cell item={g.letter} delay={900} />
                    </div>
                ))}

                {/* Empty Slots (Visual placeholders) */}
                {!isWon && Array.from({ length: Math.max(0, MAX_GUESSES - guesses.length) }).map((_, i) => (
                    <div key={`empty-${i}`} className="grid grid-cols-7 gap-1 md:gap-2 opacity-30">
                        {Array.from({ length: 7 }).map((_, j) => (
                            <div key={j} className="h-14 w-full bg-white/5 rounded-lg border border-white/5 border-dashed" />
                        ))}
                    </div>
                ))}
                
                <div ref={gridEndRef} />
            </div>
        </div>

        {/* --- STICKY INPUT AREA --- */}
        {!isWon && (
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/95 to-transparent z-40 pb-8">
                <div className="max-w-lg mx-auto relative">
                    <input 
                        className="w-full bg-[#18181b] border-2 border-purple-500/40 rounded-2xl px-6 py-4 text-white text-center text-lg focus:outline-none focus:border-purple-400 focus:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all placeholder-gray-500 shadow-2xl"
                        placeholder="הקלידו שם אמן..."
                        value={query}
                        onChange={handleSearch}
                        disabled={loading}
                        autoFocus
                    />
                    
                    {/* Autocomplete */}
                    {suggestions.length > 0 && (
                        <div className="absolute bottom-full left-0 right-0 mb-4 bg-[#18181b] rounded-2xl border border-gray-700 shadow-2xl overflow-hidden max-h-60 overflow-y-auto animate-in slide-in-from-bottom-2">
                            {suggestions.map(s => (
                                <div 
                                    key={s} 
                                    onClick={() => submitGuess(s)}
                                    className="px-6 py-4 hover:bg-purple-600/20 hover:text-purple-300 cursor-pointer border-b border-gray-800 last:border-0 transition-colors font-medium flex justify-between items-center group"
                                >
                                    <span>{s}</span>
                                    <span className="text-gray-600 group-hover:text-purple-400 text-sm">בחר</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )}

      </main>
    </div>
  );
}

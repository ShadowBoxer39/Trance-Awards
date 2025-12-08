import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Navigation from '../components/Navigation';
import { FaShareAlt, FaQuestionCircle, FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';
import { BsArrowUpSquareFill, BsArrowDownSquareFill } from 'react-icons/bs';

const MAX_GUESSES = 8;

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
              const newGuesses = [...guesses, data.feedback];
              setGuesses(newGuesses);
              if (data.isCorrect) {
                  setTimeout(() => {
                      setIsWon(true);
                      setSolution(data.solution);
                      setShowSilhouette(true); // Reveal full image
                  }, 1500);
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

  // Header Component
  const HeaderRow = () => (
      <div className="grid grid-cols-7 gap-1 md:gap-2 mb-3 px-1 sticky top-20 z-30 bg-[#09090b] py-3 border-b border-white/10 text-[10px] md:text-xs text-gray-400 font-bold text-center uppercase tracking-wider shadow-lg">
            <div>אמן</div>
            <div>ז'אנר</div>
            <div>מדינה</div>
            <div>מתי התחילו</div>
            <div>הרכב</div>
            <div>אלבומים</div>
            <div>אות</div>
      </div>
  );

  // Cell Component
  const Cell = ({ item, delay }: { item: FeedbackItem, delay: number }) => {
    const isMatch = item.match;
    const isHigher = item.direction === 'higher'; 
    const isLower = item.direction === 'lower';
    
    let bgClass = 'bg-[#202024] border-[#303036]'; 
    if (isMatch) bgClass = 'bg-green-600 border-green-500 text-white shadow-[0_0_15px_rgba(22,163,74,0.4)]';
    
    const textLength = String(item.value).length;
    const fontSize = textLength > 12 ? 'text-[9px] md:text-[10px]' : textLength > 8 ? 'text-[10px] md:text-xs' : 'text-xs md:text-sm';

    return (
      <div className="relative h-16 md:h-20 w-full perspective-1000">
          <div 
            className={`w-full h-full flex flex-col items-center justify-center p-1 text-center border-2 rounded-xl transition-all duration-700 ${bgClass}`}
            style={{ 
                animation: `flip-slot 0.6s ease-out forwards`,
                animationDelay: `${delay}ms`,
                opacity: 0,
                transform: 'rotateX(90deg)' 
            }}
          >
              <span className={`font-bold leading-tight break-words ${fontSize} mb-1`}>
                  {item.value}
              </span>
              {!isMatch && (isHigher || isLower) && (
                  <div className="mt-1 animate-bounce">
                      {isHigher && <BsArrowUpSquareFill className="text-yellow-400 text-lg md:text-xl drop-shadow-md" />}
                      {isLower && <BsArrowDownSquareFill className="text-yellow-400 text-lg md:text-xl drop-shadow-md" />}
                  </div>
              )}
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
            <div className="bg-[#18181b] border border-purple-500/30 rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
                <button onClick={() => setShowInstructions(false)} className="absolute top-4 left-4 text-gray-400 hover:text-white transition"><FaTimes size={20}/></button>
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-2">איך משחקים?</h2>
                    <p className="text-gray-400">יש לכם 8 ניסיונות לנחש את האמן היומי.</p>
                </div>
                
                <div className="space-y-4 text-sm bg-black/40 p-5 rounded-2xl mb-6 border border-white/5">
                    <div className="flex items-center gap-4">
                        <span className="w-10 h-10 flex items-center justify-center bg-green-600 rounded-lg text-white font-bold shadow-lg">V</span>
                        <span>תכונה <strong>נכונה</strong> (ז'אנר, מדינה וכו')</span>
                    </div>
                    <div className="flex items-center gap-4">
                         <span className="w-10 h-10 flex items-center justify-center bg-[#202024] border border-gray-600 rounded-lg text-white font-bold shadow-lg">X</span>
                        <span>תכונה <strong>לא נכונה</strong></span>
                    </div>
                    <div className="flex items-center gap-4">
                         <div className="w-10 h-10 flex items-center justify-center bg-[#202024] border border-gray-600 rounded-lg text-white shadow-lg">
                            <BsArrowUpSquareFill className="text-yellow-400 text-xl" />
                         </div>
                        <span>התשובה <strong>גבוהה</strong> או <strong>מאוחרת</strong> יותר</span>
                    </div>
                </div>
                <button onClick={() => { setShowInstructions(false); localStorage.setItem('psydle_instructions_seen', 'true'); }} className="w-full btn-primary py-4 rounded-xl font-bold text-lg shadow-lg shadow-purple-500/20 hover:scale-[1.02] transition-transform">
                    יאללה מתחילים!
                </button>
            </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-2 pt-24 pb-32">
        
        {/* HEADER - FIX APPLIED HERE */}
        <div className="flex flex-col items-center mb-10 relative">
            <h1 className="title-safe-area text-6xl md:text-8xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">
                PSY-DLE
            </h1>
            <button 
                onClick={() => setShowInstructions(true)} 
                className="absolute left-4 top-4 text-purple-400 hover:text-white transition opacity-80 hover:opacity-100 bg-purple-500/10 p-2 rounded-full"
            >
                <FaQuestionCircle size={20}/>
            </button>
        </div>

        {/* --- SILHOUETTE AREA --- */}
        {silhouetteUrl && !isWon && (
            <div className="flex flex-col items-center mb-10">
                 <button 
                    onClick={() => setShowSilhouette(!showSilhouette)}
                    className={`flex items-center gap-2 px-6 py-2 rounded-full border transition-all text-sm mb-6 ${showSilhouette ? 'bg-purple-600 border-purple-500 text-white shadow-lg' : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'}`}
                >
                    {showSilhouette ? <FaEyeSlash /> : <FaEye />} 
                    {showSilhouette ? 'הסתר רמז' : 'הצג רמז'}
                </button>

                {/* Animated Reveal with STENCIL Filter */}
                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showSilhouette ? 'h-48 opacity-100' : 'h-0 opacity-0'}`}>
                    <div className="relative w-48 h-48 rounded-full border-4 border-purple-500/30 bg-black shadow-[0_0_50px_rgba(168,85,247,0.15)] mx-auto">
                        <img 
                            src={silhouetteUrl} 
                            className="w-full h-full object-cover rounded-full stencil-silhouette" // <--- Applied new class
                            alt="Mystery Artist"
                        />
                    </div>
                </div>
            </div>
        )}

        {/* --- VICTORY SCREEN --- */}
        {isWon && solution && (
            <div className="mb-12 animate-in zoom-in duration-500">
                <div className="bg-gradient-to-b from-[#18181b] to-black border border-green-500/40 rounded-3xl p-10 max-w-md mx-auto text-center shadow-[0_0_60px_rgba(34,197,94,0.1)]">
                    <div className="relative w-40 h-40 mx-auto mb-6">
                        <img src={solution.image_url} className="w-full h-full rounded-full border-4 border-green-500 shadow-2xl object-cover" />
                        <div className="absolute -bottom-2 -right-2 bg-green-500 text-black p-3 rounded-full text-2xl shadow-lg border-4 border-[#18181b]">🎉</div>
                    </div>
                    <h2 className="text-4xl font-black text-white mb-2">{solution.name}</h2>
                    <div className="flex justify-center gap-2 mb-8">
                        <span className="bg-green-900/40 text-green-400 px-4 py-1 rounded-full text-sm font-bold border border-green-500/30">
                            {solution.genre}
                        </span>
                    </div>
                    <button onClick={handleShare} className="w-full btn-primary py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2 shadow-xl hover:shadow-purple-500/40 hover:scale-[1.02] transition-all">
                        <FaShareAlt /> שתף ניצחון
                    </button>
                    <p className="text-xs text-gray-600 mt-6 font-medium">המשחק יתאפס מחר בחצות</p>
                </div>
            </div>
        )}

        {/* --- GAME GRID --- */}
        <div className="w-full max-w-5xl mx-auto px-1">
            {guesses.length > 0 && <HeaderRow />}

            <div className="space-y-3 mb-32">
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

                {!isWon && Array.from({ length: Math.max(0, MAX_GUESSES - guesses.length) }).map((_, i) => (
                    <div key={`empty-${i}`} className="grid grid-cols-7 gap-1 md:gap-2 opacity-30">
                        {Array.from({ length: 7 }).map((_, j) => (
                            <div key={j} className="h-14 md:h-16 w-full bg-white/5 rounded-xl border border-white/5" />
                        ))}
                    </div>
                ))}
                
                <div ref={gridEndRef} />
            </div>
        </div>

        {/* --- STICKY INPUT --- */}
        {!isWon && (
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/95 to-transparent z-40 pb-8">
                <div className="max-w-lg mx-auto relative">
                    <input 
                        className="w-full bg-[#18181b] border-2 border-purple-500/40 rounded-2xl px-6 py-5 text-white text-center text-xl font-bold focus:outline-none focus:border-purple-400 focus:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all placeholder-gray-500 shadow-2xl"
                        placeholder="הקלידו שם אמן..."
                        value={query}
                        onChange={handleSearch}
                        disabled={loading}
                        autoFocus
                    />
                    
                    {suggestions.length > 0 && (
                        <div className="absolute bottom-full left-0 right-0 mb-4 bg-[#18181b] rounded-2xl border border-gray-700 shadow-2xl overflow-hidden max-h-60 overflow-y-auto animate-in slide-in-from-bottom-2">
                            {suggestions.map(s => (
                                <div 
                                    key={s} 
                                    onClick={() => submitGuess(s)}
                                    className="px-6 py-4 hover:bg-purple-600/20 hover:text-purple-300 cursor-pointer border-b border-gray-800 last:border-0 transition-colors font-bold text-lg flex justify-between items-center group"
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

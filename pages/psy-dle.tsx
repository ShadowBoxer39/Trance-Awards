import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Navigation from '../components/Navigation';
import { FaArrowUp, FaArrowDown, FaCheck, FaShareAlt, FaEye, FaQuestionCircle, FaTimes } from 'react-icons/fa';

// --- Types ---
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

const MAX_GUESSES = 8;

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

  useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
    
    // Check if user has seen instructions
    const seen = localStorage.getItem('psydle_instructions_seen');
    if (!seen) setShowInstructions(true);

    fetch('/api/game/psydle').then(r => r.json()).then(data => {
        if(data.names) setAllArtists(data.names);
        if(data.silhouetteUrl) setSilhouetteUrl(data.silhouetteUrl);
    });
  }, []);

  const closeInstructions = () => {
      setShowInstructions(false);
      localStorage.setItem('psydle_instructions_seen', 'true');
  };

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

      try {
          const res = await fetch('/api/game/psydle', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ guessName: artistName })
          });
          const data = await res.json();
          
          if (data.ok) {
              const newGuesses = [data.feedback, ...guesses];
              setGuesses(newGuesses);
              if (data.isCorrect) {
                  setIsWon(true);
                  setSolution(data.solution);
              }
              setQuery('');
              setSuggestions([]);
          }
      } catch (e) { console.error(e); }
  };

  const handleShare = async () => {
    let text = `Psy-Dle 2025 ${isWon ? '🏆' : '💀'} ${guesses.length}/${MAX_GUESSES}\n\n`;
    [...guesses].reverse().forEach(g => {
        text += (g.genre.match ? '🟩' : '⬛');
        text += (g.country.match ? '🟩' : '⬛');
        text += (g.year.match ? '🟩' : '🟨');
        text += (g.group.match ? '🟩' : '⬛');
        text += (g.albums.match ? '🟩' : '🟨');
        text += '\n';
    });
    text += '\nhttps://tracktrip.co.il/psy-dle';

    if (navigator.share) {
        try { await navigator.share({ text }); } catch(e){}
    } else {
        navigator.clipboard.writeText(text);
        alert('הועתק!');
    }
  };

  // Render a Cell in the grid
  const Cell = ({ item, isHeader = false }: { item?: FeedbackItem, isHeader?: boolean }) => {
    if (isHeader) return null; // Handled in main render
    if (!item) return <div className="h-14 w-full bg-white/5 rounded border border-white/10" />; // Empty slot

    let bg = item.match ? 'bg-green-600 border-green-400' : 'bg-gray-800 border-gray-600';
    let content = item.value;
    
    // Add arrows for numeric/letter hints
    let arrow = null;
    if (!item.match && item.direction === 'higher') arrow = <FaArrowUp className="text-yellow-400 text-xs animate-bounce" />;
    if (!item.match && item.direction === 'lower') arrow = <FaArrowDown className="text-yellow-400 text-xs animate-bounce" />;

    return (
      <div className={`h-14 w-full rounded flex flex-col items-center justify-center p-1 text-center border shadow-lg transition-all animate-in zoom-in ${bg}`}>
          <div className="flex items-center gap-1">
             <span className="text-xs md:text-sm font-bold text-white leading-tight truncate px-1">{content}</span>
             {arrow}
          </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans selection:bg-purple-500/30 overflow-x-hidden">
      <Head><title>Psy-Dle | נחשו את האמן</title></Head>
      <Navigation />

      {/* --- INSTRUCTIONS MODAL --- */}
      {showInstructions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-gray-900 border border-purple-500/50 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
                <button onClick={closeInstructions} className="absolute top-4 left-4 text-gray-400 hover:text-white"><FaTimes /></button>
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4">איך משחקים?</h2>
                <ul className="space-y-3 text-sm text-gray-300 mb-6">
                    <li>🎯 נחשו את האמן היומי ב-8 ניסיונות.</li>
                    <li>🟩 <strong>ירוק:</strong> התכונה נכונה.</li>
                    <li>⬜ <strong>אפור:</strong> התכונה לא נכונה.</li>
                    <li>⬆️ <strong>חץ למעלה:</strong> התשובה גבוהה/מאוחרת יותר.</li>
                    <li>⬇️ <strong>חץ למטה:</strong> התשובה נמוכה/מוקדמת יותר.</li>
                    <li>👥 <strong>הרכב:</strong> סולו, צמד או הרכב.</li>
                </ul>
                <button onClick={closeInstructions} className="w-full btn-primary py-3 rounded-xl font-bold">הבנתי, יאללה!</button>
            </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-2 pt-24 pb-20">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6 px-2">
            <button onClick={() => setShowInstructions(true)} className="text-purple-400 hover:text-white transition"><FaQuestionCircle size={24}/></button>
            <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">
                PSY-DLE
            </h1>
            <div className="w-6" /> {/* Spacer */}
        </div>

        {/* --- SILHOUETTE TOGGLE --- */}
        {silhouetteUrl && !isWon && (
            <div className="flex flex-col items-center mb-8">
                <button 
                    onClick={() => setShowSilhouette(!showSilhouette)}
                    className="flex items-center gap-2 px-5 py-2 rounded-full bg-purple-900/30 border border-purple-500/30 hover:border-purple-400 transition-all text-sm text-purple-200 mb-4"
                >
                    {showSilhouette ? <FaEye /> : <FaEye />} 
                    {showSilhouette ? 'הסתר רמז' : 'הצג רמז (צללית)'}
                </button>
                
                {showSilhouette && (
                    <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-purple-500/50 bg-black shadow-[0_0_30px_rgba(168,85,247,0.4)] animate-in zoom-in overflow-hidden">
                        {/* High Contrast "Hologram" Filter */}
                        <img 
                            src={silhouetteUrl} 
                            className="w-full h-full object-cover"
                            style={{ 
                                filter: 'grayscale(100%) contrast(150%) brightness(50%) sepia(100%) hue-rotate(230deg) saturate(500%)',
                                transform: 'scale(1.1)'
                            }}
                        />
                    </div>
                )}
            </div>
        )}

        {/* --- GAME GRID --- */}
        <div className="w-full overflow-x-auto pb-4">
            <div className="min-w-[600px] md:min-w-full">
                
                {/* Headers */}
                <div className="grid grid-cols-7 gap-2 mb-2 px-1">
                    {['אמן', 'ז\'אנר', 'מדינה', 'שנה', 'הרכב', 'אלבומים', 'אות'].map(h => (
                        <div key={h} className="text-xs text-gray-500 font-bold text-center uppercase tracking-wider">{h}</div>
                    ))}
                </div>

                {/* Rows (Guesses + Empty Slots) */}
                <div className="space-y-2">
                    {/* Render Past Guesses */}
                    {guesses.map((g, i) => (
                        <div key={i} className="grid grid-cols-7 gap-2">
                            <Cell item={g.name} />
                            <Cell item={g.genre} />
                            <Cell item={g.country} />
                            <Cell item={g.year} />
                            <Cell item={g.group} />
                            <Cell item={g.albums} />
                            <Cell item={g.letter} />
                        </div>
                    ))}

                    {/* Render Empty Slots if not won */}
                    {!isWon && Array.from({ length: Math.max(0, MAX_GUESSES - guesses.length) }).map((_, i) => (
                        <div key={`empty-${i}`} className="grid grid-cols-7 gap-2 opacity-50">
                            {Array.from({ length: 7 }).map((_, j) => (
                                <div key={j} className="h-14 w-full bg-white/5 rounded border border-white/5 border-dashed" />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* --- INPUT AREA --- */}
        {!isWon && guesses.length < MAX_GUESSES && (
            <div className="mt-8 relative max-w-lg mx-auto">
                <input 
                    className="w-full bg-gray-900 border-2 border-purple-500/50 rounded-xl px-4 py-4 text-white text-center text-lg focus:outline-none focus:border-purple-400 focus:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all placeholder-gray-600"
                    placeholder="הקלידו שם אמן..."
                    value={query}
                    onChange={handleSearch}
                    autoFocus
                />
                {suggestions.length > 0 && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-gray-900 rounded-xl border border-gray-700 shadow-2xl overflow-hidden max-h-48 overflow-y-auto z-50">
                        {suggestions.map(s => (
                            <div 
                                key={s} 
                                onClick={() => { setQuery(s); setSuggestions([]); submitGuess(s); }}
                                className="px-5 py-3 hover:bg-purple-900/50 cursor-pointer border-b border-gray-800 last:border-0 transition-colors"
                            >
                                {s}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}

        {/* --- VICTORY / LOSS SCREEN --- */}
        {isWon && solution && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-in zoom-in duration-500">
                <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-green-500 rounded-3xl p-8 max-w-md w-full text-center shadow-[0_0_50px_rgba(34,197,94,0.3)]">
                    <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-green-400 mb-6 shadow-xl">
                        <img src={solution.image_url} className="w-full h-full object-cover" />
                    </div>
                    <h2 className="text-4xl font-black text-white mb-2">{solution.name}</h2>
                    <p className="text-green-400 font-bold mb-6 text-lg">פיצחת את זה!</p>
                    
                    <button onClick={handleShare} className="w-full btn-primary py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-purple-500/40">
                        <FaShareAlt /> שתף ניצחון
                    </button>
                    <button onClick={() => window.location.reload()} className="mt-4 text-gray-500 text-sm hover:text-white">סגור</button>
                </div>
            </div>
        )}
      </main>
    </div>
  );
}

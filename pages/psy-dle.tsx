import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Navigation from '../components/Navigation';
import { FaArrowUp, FaArrowDown, FaCheck, FaShareAlt, FaEye, FaEyeSlash } from 'react-icons/fa';
import Link from 'next/link';

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
  const [loading, setLoading] = useState(false);
  const [solution, setSolution] = useState<any>(null);
  
  // Silhouette State
  const [silhouetteUrl, setSilhouetteUrl] = useState<string | null>(null);
  const [showSilhouette, setShowSilhouette] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
    // Load initial data
    fetch('/api/game/psydle').then(r => r.json()).then(data => {
        if(data.names) setAllArtists(data.names);
        if(data.silhouetteUrl) setSilhouetteUrl(data.silhouetteUrl);
    });
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setQuery(val);
      if (val.length > 0) {
          setSuggestions(allArtists.filter(a => a.toLowerCase().includes(val.toLowerCase())).slice(0, 5));
      } else {
          setSuggestions([]);
      }
  };

  const selectArtist = (name: string) => {
      setQuery(name);
      setSuggestions([]);
      submitGuess(name);
  };

  const submitGuess = async (artistName: string) => {
      if (guesses.some(g => g.name.value === artistName)) return; 

      setLoading(true);
      try {
          const res = await fetch('/api/game/psydle', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ guessName: artistName })
          });
          const data = await res.json();
          
          if (data.ok) {
              setGuesses([data.feedback, ...guesses]);
              if (data.isCorrect) {
                  setIsWon(true);
                  setSolution(data.solution);
                  setShowSilhouette(true); // Reveal image on win
              }
              setQuery('');
          } else {
              alert("אמן לא נמצא במאגר המשחק");
          }
      } catch (e) {
          console.error(e);
      } finally {
          setLoading(false);
      }
  };

  const handleShare = async () => {
    let text = `Psy-Dle #1 ${isWon ? '🏆' : '🤔'}\n`;
    [...guesses].reverse().forEach(g => {
        text += (g.genre.match ? '🟩' : '⬛');
        text += (g.country.match ? '🟩' : '⬛');
        text += (g.year.match ? '🟩' : g.year.direction === 'higher' ? '⬆️' : '⬇️');
        text += (g.group.match ? '🟩' : '⬛');
        text += (g.albums.match ? '🟩' : g.albums.direction === 'higher' ? '⬆️' : '⬇️');
        text += (g.letter.match ? '🟩' : g.letter.direction === 'higher' ? '⬆️' : '⬇️');
        text += '\n';
    });
    text += 'https://tracktrip.co.il/psy-dle';

    if (navigator.share) {
        try { await navigator.share({ text }); } catch(e){}
    } else {
        navigator.clipboard.writeText(text);
        alert('הועתק ללוח!');
    }
  };

  // --- Components ---

  const AttributeHeader = ({ label }: { label: string }) => (
      <div className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-wider text-center px-1">
          {label}
      </div>
  );

  const AttributeCell = ({ item, delay }: { item: FeedbackItem, delay: number }) => {
    let bg = item.match ? 'bg-green-500 text-black border-green-400' : 'bg-[#1a1a2e] text-white border-white/10';
    // Partial Match Logic (Yellow)? Poeltl typically just uses Green/Gray, 
    // but for arrows we might want yellow to indicate "close"? 
    // Let's stick to standard colors for clarity first.
    
    return (
      <div 
        className={`h-16 w-full rounded-lg flex flex-col items-center justify-center p-1 text-center border transition-all duration-700 animate-in zoom-in spin-in-x ${bg}`}
        style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
      >
          <div className="flex flex-col items-center leading-none gap-1">
            <span className="font-bold text-xs md:text-sm break-words line-clamp-2">
                {item.value}
            </span>
            {/* Arrows */}
            {!item.match && item.direction === 'higher' && (
                <FaArrowUp className="text-white animate-bounce mt-1 text-xs" />
            )}
            {!item.match && item.direction === 'lower' && (
                <FaArrowDown className="text-white animate-bounce mt-1 text-xs" />
            )}
          </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#050814] text-white selection:bg-purple-500/30">
      <Head><title>Psy-Dle | נחשו את האמן</title></Head>
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 pt-24 pb-20">
        
        {/* Header */}
        <div className="text-center mb-8">
             <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400 bg-clip-text text-transparent italic tracking-tighter mb-2">
                PSY-DLE
             </h1>
             <p className="text-gray-400">נחשו את האמן היומי בעזרת הגיון</p>
        </div>

        {/* --- SILHOUETTE AREA --- */}
        {silhouetteUrl && !isWon && (
            <div className="flex justify-center mb-8">
                <button 
                    onClick={() => setShowSilhouette(!showSilhouette)}
                    className="flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm text-gray-300"
                >
                    {showSilhouette ? <FaEyeSlash /> : <FaEye />}
                    {showSilhouette ? 'הסתר צללית' : 'הצג צללית (רמז)'}
                </button>
            </div>
        )}

        {showSilhouette && silhouetteUrl && (
            <div className="flex justify-center mb-8 animate-in fade-in zoom-in duration-300">
                <div className="relative w-40 h-40 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-gray-800 bg-black shadow-2xl">
                    <img 
                        src={silhouetteUrl} 
                        className={`w-full h-full object-cover transition-all duration-1000 ${isWon ? 'filter-none' : 'brightness-0 invert grayscale contrast-200'}`}
                        alt="Silhouette"
                    />
                </div>
            </div>
        )}

        {/* --- INPUT --- */}
        {!isWon && (
            <div className="relative max-w-lg mx-auto mb-12 z-40">
                <input 
                    className="w-full bg-[#0a0f20] border-2 border-purple-500/30 rounded-xl px-5 py-4 text-lg text-white focus:outline-none focus:border-purple-500 focus:shadow-[0_0_20px_rgba(168,85,247,0.2)] transition-all text-center placeholder-gray-500 font-bold"
                    placeholder="הקלידו שם אמן..."
                    value={query}
                    onChange={handleSearch}
                    autoFocus
                />
                
                {suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#0a0f20] rounded-xl border border-gray-700 shadow-2xl overflow-hidden max-h-60 overflow-y-auto z-50">
                        {suggestions.map((s, i) => (
                            <div 
                                key={s} 
                                onClick={() => selectArtist(s)}
                                className="px-5 py-3 hover:bg-purple-600/20 hover:text-purple-300 cursor-pointer border-b border-gray-800 last:border-0 transition-colors font-medium flex justify-between items-center group"
                            >
                                <span>{s}</span>
                                <span className="text-gray-600 group-hover:text-purple-400">↵</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}

        {/* --- VICTORY --- */}
        {isWon && solution && (
             <div className="text-center mb-10 bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/30 rounded-2xl p-8 animate-in zoom-in duration-500 max-w-lg mx-auto">
                 <div className="relative w-32 h-32 mx-auto mb-4">
                    <img src={solution.image_url} className="w-full h-full rounded-full border-4 border-green-500 shadow-lg object-cover" />
                    <div className="absolute -bottom-2 -right-2 bg-green-500 text-black p-2 rounded-full text-xl shadow">🎉</div>
                 </div>
                 <h2 className="text-3xl font-black text-green-400 mb-1">כל הכבוד!</h2>
                 <p className="text-white text-lg mb-6">האמן הוא <span className="font-bold">{solution.name}</span></p>
                 <button 
                    onClick={handleShare}
                    className="flex items-center justify-center gap-2 w-full bg-white text-black font-bold px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors shadow-lg"
                 >
                    <FaShareAlt />
                    שתף תוצאה
                 </button>
                 <p className="text-xs text-gray-500 mt-4">המשחק יתאפס מחר בחצות</p>
             </div>
        )}

        {/* --- GRID HEADER --- */}
        {guesses.length > 0 && (
            <div className="grid grid-cols-7 gap-2 md:gap-3 mb-3 px-1">
                <AttributeHeader label="אמן" />
                <AttributeHeader label="ז'אנר" />
                <AttributeHeader label="מדינה" />
                <AttributeHeader label="שנה" />
                <AttributeHeader label="הרכב" />
                <AttributeHeader label="אלבומים" />
                <AttributeHeader label="אות" />
            </div>
        )}

        {/* --- RESULTS GRID --- */}
        <div className="space-y-2">
            {guesses.map((g, i) => (
                <div key={i} className="grid grid-cols-7 gap-2 md:gap-3">
                    {/* Name (Special styling for the guess itself) */}
                    <div className="col-span-1">
                        <div className={`h-16 w-full rounded-lg flex items-center justify-center p-1 text-center border transition-all duration-500 ${g.name.match ? 'bg-green-500 text-black border-green-400' : 'bg-gray-800 text-white border-gray-600'}`}>
                            <span className="font-bold text-[10px] md:text-xs break-words leading-tight">{g.name.value}</span>
                        </div>
                    </div>

                    <div className="col-span-1"><AttributeCell item={g.genre} delay={100} /></div>
                    <div className="col-span-1"><AttributeCell item={g.country} delay={200} /></div>
                    <div className="col-span-1"><AttributeCell item={g.year} delay={300} /></div>
                    <div className="col-span-1"><AttributeCell item={g.group} delay={400} /></div>
                    <div className="col-span-1"><AttributeCell item={g.albums} delay={500} /></div>
                    <div className="col-span-1"><AttributeCell item={g.letter} delay={600} /></div>
                </div>
            ))}
        </div>
        
        {/* Legend */}
        {guesses.length > 0 && (
            <div className="mt-8 flex justify-center gap-6 text-xs text-gray-500 font-medium bg-black/20 p-3 rounded-full w-fit mx-auto border border-white/5">
                <div className="flex items-center gap-1"><FaCheck className="text-green-500" /> נכון</div>
                <div className="flex items-center gap-1"><FaArrowUp className="text-white" /> גבוה/מאוחר יותר</div>
                <div className="flex items-center gap-1"><FaArrowDown className="text-white" /> נמוך/מוקדם יותר</div>
            </div>
        )}

      </main>
    </div>
  );
}

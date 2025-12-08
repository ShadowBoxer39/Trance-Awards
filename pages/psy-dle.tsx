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
    document.documentElement.setAttribute('dir', 'rtl');
    const seen = localStorage.getItem('psydle_instructions_seen');
    if (!seen) setShowInstructions(true);

    fetch('/api/game/psydle')
      .then((r) => r.json())
      .then((data) => {
        if (data.names) setAllArtists(data.names);
        if (data.silhouetteUrl) setSilhouetteUrl(data.silhouetteUrl);
      });
  }, []);

  useEffect(() => {
    gridEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [guesses]);

  // Scroll back to top when you win so the victory card is visible
  useEffect(() => {
    if (isWon && typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isWon]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (val.length > 0) {
      const lower = val.toLowerCase();
      setSuggestions(
        allArtists
          .filter((a) => a.toLowerCase().includes(lower))
          .slice(0, 7)
      );
    } else {
      setSuggestions([]);
    }
  };

  const submitGuess = async (artistName: string) => {
    if (!artistName) return;
    if (guesses.some((g) => g.name.value === artistName)) return;

    setQuery('');
    setSuggestions([]);
    setLoading(true);

    try {
      const res = await fetch('/api/game/psydle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guessName: artistName }),
      });
      const data = await res.json();

      if (data.ok) {
        const newGuesses = [...guesses, data.feedback];
        setGuesses(newGuesses);
        if (data.isCorrect) {
          setTimeout(() => {
            setIsWon(true);
            setSolution(data.solution);
            setShowSilhouette(true); // reveal image; we unblur it on win
          }, 1200);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    let text = `Psy-Dle 2025 ${isWon ? '🏆' : '💀'} ${guesses.length}/${MAX_GUESSES}\n\n`;
    guesses.forEach((g) => {
      text += g.genre.match ? '🟩' : '⬛';
      text += g.country.match ? '🟩' : '⬛';
      text += g.year.match
        ? '🟩'
        : g.year.direction === 'higher'
        ? '⬆️'
        : '⬇️';
      text += g.group.match ? '🟩' : '⬛';
      text += g.albums.match
        ? '🟩'
        : g.albums.direction === 'higher'
        ? '⬆️'
        : '⬇️';
      text += '\n';
    });
    text += '\nhttps://tracktrip.co.il/psy-dle';

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ text });
      } catch (e) {
        // ignore cancel
      }
    } else if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(text);
      alert('הועתק ללוח!');
    }
  };

  // -------------------------------
  //   Small presentational helpers
  // -------------------------------

  const currentAttempt = Math.min(guesses.length + 1, MAX_GUESSES);

  const usedNames = new Set(guesses.map((g) => String(g.name.value)));
  const filteredSuggestions = suggestions.filter((s) => !usedNames.has(s));

  // Blur level for the photo hint: gets clearer as guesses increase
  const getBlurClass = () => {
    if (isWon) return 'blur-0 brightness-100';
    if (guesses.length <= 1) return 'blur-3xl brightness-75';
    if (guesses.length <= 3) return 'blur-2xl brightness-75';
    if (guesses.length <= 5) return 'blur-xl brightness-75';
    return 'blur-lg brightness-75';
  };

  // Header row for the grid – lighter, clearer
  const HeaderRow = () => (
    <div className="grid grid-cols-7 gap-1 md:gap-2 mb-3 px-1 py-2 bg-[#0b0b10] border-y border-white/5 text-[10px] md:text-xs text-gray-300 font-semibold text-center uppercase tracking-wide">
      <div className="flex flex-col gap-0.5">
        <span>אמן</span>
      </div>
      <div className="flex flex-col gap-0.5">
        <span>ז'אנר</span>
      </div>
      <div className="flex flex-col gap-0.5">
        <span>מדינה</span>
      </div>
      <div className="flex flex-col gap-0.5">
        <span>מתי התחילו</span>
      </div>
      <div className="flex flex-col gap-0.5">
        <span>הרכב</span>
      </div>
      <div className="flex flex-col gap-0.5">
        <span>אלבומים</span>
      </div>
      <div className="flex flex-col gap-0.5">
        <span>אות</span>
      </div>
    </div>
  );

  // Single grid cell – flatter style, value + arrow in one line
  const Cell = ({
    item,
    delay,
    isText = false,
  }: {
    item: FeedbackItem;
    delay: number;
    isText?: boolean;
  }) => {
    const isMatch = item.match;
    const isHigher = item.direction === 'higher';
    const isLower = item.direction === 'lower';

    let bgClass =
      'bg-[#111118] border border-[#272733] text-gray-100 shadow-none';
    if (isMatch)
      bgClass =
        'bg-emerald-600 border-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.45)]';

    const textLength = String(item.value).length;
    const fontSize =
      textLength > 12
        ? 'text-[9px] md:text-[10px]'
        : textLength > 8
        ? 'text-[10px] md:text-xs'
        : 'text-xs md:text-sm';

    return (
      <div className="relative h-16 md:h-20 w-full perspective-1000">
        <div
          className={`w-full h-full flex items-center justify-center px-2 text-center rounded-xl transition-all duration-400 ${bgClass}`}
          style={{
            animation: `flip-slot 0.4s ease-out forwards`,
            animationDelay: `${delay}ms`,
            opacity: 0,
            transform: 'rotateX(90deg)',
          }}
        >
          <div className="flex items-center justify-center gap-1">
            <span
              className={`font-bold leading-tight break-words ${fontSize} ${
                isText ? 'md:max-w-[10rem]' : ''
              }`}
            >
              {item.value}
            </span>
            {!isMatch && (isHigher || isLower) && (
              <>
                {isHigher && (
                  <BsArrowUpSquareFill className="text-yellow-400 text-sm md:text-base drop-shadow-md" />
                )}
                {isLower && (
                  <BsArrowDownSquareFill className="text-yellow-400 text-sm md:text-base drop-shadow-md" />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans overflow-x-hidden">
      <Head>
        <title>Psy-Dle | נחשו את האמן</title>
      </Head>
      <Navigation />

      {/* Instructions Modal */}
      {showInstructions && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-[#18181b] border border-purple-500/30 rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setShowInstructions(false)}
              className="absolute top-4 left-4 text-gray-400 hover:text-white transition"
            >
              <FaTimes size={20} />
            </button>
            <div className="text-center mb-6">
              <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-2">
                איך משחקים?
              </h2>
              <p className="text-gray-400">
                יש לכם 8 ניסיונות לנחש את האמן היומי.
              </p>
            </div>

            <div className="space-y-4 text-sm bg-black/40 p-5 rounded-2xl mb-6 border border-white/5">
              <div className="flex items-center gap-4">
                <span className="w-10 h-10 flex items-center justify-center bg-emerald-600 rounded-lg text-white font-bold shadow-lg">
                  ✓
                </span>
                <span>
                  תכונה <strong>נכונה</strong> (ז&apos;אנר, מדינה וכו&apos;)
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="w-10 h-10 flex items-center justify-center bg-[#202024] border border-gray-600 rounded-lg text-white font-bold shadow-lg">
                  ✗
                </span>
                <span>תכונה לא תואמת לאמן.</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 flex items-center justify-center bg-[#202024] border border-gray-600 rounded-lg text-white shadow-lg">
                  <BsArrowUpSquareFill className="text-yellow-400 text-xl" />
                </div>
                <span>
                  התשובה <strong>גבוהה</strong> או <strong>מאוחרת</strong>{' '}
                  יותר (שנה / מספר אלבומים).
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setShowInstructions(false);
                localStorage.setItem('psydle_instructions_seen', 'true');
              }}
              className="w-full btn-primary py-4 rounded-xl font-bold text-lg shadow-lg shadow-purple-500/20 hover:scale-[1.02] transition-transform"
            >
              יאללה מתחילים!
            </button>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-2 pt-20 pb-24">
        {/* HEADER */}
        <div className="flex flex-col items-center mb-6 relative">
          <h1 className="title-safe-area text-5xl md:text-7xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">
            PSY-DLE
          </h1>
          <button
            onClick={() => setShowInstructions(true)}
            className="absolute left-4 top-2 text-purple-400 hover:text-white transition opacity-80 hover:opacity-100 bg-purple-500/10 p-2 rounded-full"
          >
            <FaQuestionCircle size={20} />
          </button>
        </div>

        {/* IMAGE HINT (Blurred photo instead of pure silhouette) */}
        {silhouetteUrl && (
          <div className="flex flex-col items-center mb-6">
            {!isWon && (
              <>
                <button
                  onClick={() => setShowSilhouette((prev) => !prev)}
                  className={`flex items-center gap-2 px-5 py-2 rounded-full border transition-all text-xs md:text-sm mb-3 ${
                    showSilhouette
                      ? 'bg-purple-600 border-purple-500 text-white shadow-lg'
                      : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {showSilhouette ? <FaEyeSlash /> : <FaEye />}
                  {showSilhouette ? 'הסתר רמז בתמונה' : 'הצג רמז בתמונה'}
                </button>
                <p className="text-[11px] md:text-xs text-gray-500 mb-2 text-center">
                  הרמז הוא תמונה מטושטשת של האמן. ככל שתתקדמו בניחושים –
                  התמונה תהיה חדה יותר.
                </p>
              </>
            )}

            <div
              className={`transition-all duration-500 ease-in-out overflow-hidden ${
                (showSilhouette || isWon) ? 'h-40 md:h-44 opacity-100' : 'h-0 opacity-0'
              }`}
            >
              <div className="relative w-40 h-40 md:w-44 md:h-44 rounded-full border border-purple-500/40 bg-black shadow-[0_0_40px_rgba(168,85,247,0.2)] mx-auto flex items-center justify-center">
                <img
                  src={silhouetteUrl}
                  alt="Mystery Artist"
                  className={`w-full h-full rounded-full object-cover transition-all duration-500 ${getBlurClass()}`}
                />
              </div>
            </div>
          </div>
        )}

        {/* STICKY INPUT BAR (top, Poeltl-style) */}
        {!isWon && (
          <div className="sticky top-14 z-40 bg-[#09090b]/95 backdrop-blur-md border-y border-white/5 py-3 mb-6">
            <div className="max-w-xl mx-auto flex flex-col items-center gap-2">
              <p className="text-[11px] md:text-xs text-gray-400 font-medium">
                ניסיון {currentAttempt} מתוך {MAX_GUESSES}
              </p>
              <div className="w-full relative">
                <input
                  className="w-full bg-[#18181b] border-2 border-purple-500/40 rounded-2xl px-6 py-3 md:py-4 text-white text-center text-lg md:text-xl font-bold focus:outline-none focus:border-purple-400 focus:shadow-[0_0_24px_rgba(168,85,247,0.3)] transition-all placeholder-gray-500 shadow-xl"
                  placeholder="הקלידו שם אמן..."
                  value={query}
                  onChange={handleSearch}
                  disabled={loading}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && filteredSuggestions[0]) {
                      submitGuess(filteredSuggestions[0]);
                    }
                  }}
                />

                {/* Autocomplete */}
                {filteredSuggestions.length > 0 && (
                  <div className="absolute mt-2 left-0 right-0 bg-[#18181b] rounded-2xl border border-gray-700 shadow-2xl overflow-hidden max-h-60 overflow-y-auto animate-in fade-in">
                    {filteredSuggestions.map((s) => (
                      <div
                        key={s}
                        onClick={() => submitGuess(s)}
                        className="px-6 py-3 hover:bg-purple-600/20 hover:text-purple-300 cursor-pointer border-b border-gray-800 last:border-0 transition-colors font-bold text-sm md:text-base flex justify-between items-center group"
                      >
                        <span>{s}</span>
                        <span className="text-gray-600 group-hover:text-purple-400 text-xs">
                          בחר
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VICTORY SCREEN */}
        {isWon && solution && (
          <div className="mb-10 animate-in zoom-in duration-500">
            <div className="bg-gradient-to-b from-[#18181b] to-black border border-emerald-500/40 rounded-3xl p-8 md:p-10 max-w-md mx-auto text-center shadow-[0_0_60px_rgba(16,185,129,0.15)]">
              <div className="relative w-36 h-36 md:w-40 md:h-40 mx-auto mb-6">
                <img
                  src={solution.image_url}
                  className="w-full h-full rounded-full border-4 border-emerald-500 shadow-2xl object-cover"
                  alt={solution.name}
                />
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-black p-3 rounded-full text-2xl shadow-lg border-4 border-[#18181b]">
                  🎉
                </div>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-2">
                {solution.name}
              </h2>
              <div className="flex justify-center gap-2 mb-6">
                <span className="bg-emerald-900/40 text-emerald-400 px-4 py-1 rounded-full text-xs md:text-sm font-bold border border-emerald-500/30">
                  {solution.genre}
                </span>
              </div>
              <button
                onClick={handleShare}
                className="w-full btn-primary py-3 md:py-4 rounded-xl text-base md:text-lg font-bold flex items-center justify-center gap-2 shadow-xl hover:shadow-purple-500/40 hover:scale-[1.02] transition-all"
              >
                <FaShareAlt /> שתף ניצחון
              </button>
              <p className="text-[11px] text-gray-600 mt-4 font-medium">
                המשחק יתאפס מחר בחצות
              </p>
            </div>
          </div>
        )}

        {/* GAME GRID */}
        <div className="w-full max-w-5xl mx-auto px-1">
          {guesses.length > 0 && <HeaderRow />}

          <div className="space-y-3 mb-10">
            {guesses.map((g, i) => {
              const isWinningRow = isWon && i === guesses.length - 1;
              return (
                <div
                  key={i}
                  className={`grid grid-cols-7 gap-1 md:gap-2 ${
                    isWinningRow ? 'animate-pulse' : ''
                  }`}
                >
                  <Cell item={g.name} delay={0} isText />
                  <Cell item={g.genre} delay={100} />
                  <Cell item={g.country} delay={200} />
                  <Cell item={g.year} delay={300} />
                  <Cell item={g.group} delay={400} />
                  <Cell item={g.albums} delay={500} />
                  <Cell item={g.letter} delay={600} />
                </div>
              );
            })}

            {/* Empty placeholder rows */}
            {!isWon &&
              Array.from({
                length: Math.max(0, MAX_GUESSES - guesses.length),
              }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="grid grid-cols-7 gap-1 md:gap-2 opacity-25"
                >
                  {Array.from({ length: 7 }).map((_, j) => (
                    <div
                      key={j}
                      className="h-14 md:h-16 w-full bg-white/5 rounded-xl border border-white/5"
                    />
                  ))}
                </div>
              ))}

            <div ref={gridEndRef} />
          </div>
        </div>
      </main>
    </div>
  );
}

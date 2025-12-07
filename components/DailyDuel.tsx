import React, { useState, useEffect } from 'react';
import { usePlayer } from './PlayerProvider'; 
import { createClient } from '@supabase/supabase-js';
import { FaPlay, FaPause, FaVoteYea } from 'react-icons/fa';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const FALLBACK_IMG = "/images/logo.png"; 

type DuelData = {
  id: number;
  type: 'track' | 'album' | 'artist';
  title_a: string;
  media_url_a: string;
  image_a?: string;    
  votes_a: number;
  title_b: string;
  media_url_b: string;
  image_b?: string;   
  votes_b: number;
};

// --- VISUALIZER ---
const NeonEqualizer = ({ color }: { color: string }) => (
  <div className="flex items-end justify-center gap-1 h-6 w-10">
    <div className={`w-1.5 rounded-t-full animate-[bounce_0.8s_infinite] h-3 ${color}`}></div>
    <div className={`w-1.5 rounded-t-full animate-[bounce_1.2s_infinite] h-6 ${color}`}></div>
    <div className={`w-1.5 rounded-t-full animate-[bounce_0.6s_infinite] h-4 ${color}`}></div>
    <div className={`w-1.5 rounded-t-full animate-[bounce_1.0s_infinite] h-5 ${color}`}></div>
  </div>
);

export default function DailyDuel() {
  const { playTrack, activeUrl, isPlaying, toggle, progress, seek } = usePlayer();
  const [duel, setDuel] = useState<DuelData | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDuel();
  }, []);

  const fetchDuel = async () => {
    try {
      const { data } = await supabase
        .from('daily_duels')
        .select('*')
        .order('publish_date', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setDuel(data);
        if (typeof window !== 'undefined' && localStorage.getItem(`duel_vote_${data.id}`)) {
          setHasVoted(true);
        }
      } else {
        // Fallback Demo
        setDuel({
          id: 999,
          type: 'track',
          title_a: 'Infected Mushroom - Becoming Insane',
          media_url_a: 'https://www.youtube.com/watch?v=Z6hL6fkJ1_k', 
          image_a: 'https://i.ytimg.com/vi/Z6hL6fkJ1_k/hqdefault.jpg',
          votes_a: 120,
          title_b: 'Astrix - Deep Jungle Walk',
          media_url_b: 'https://www.youtube.com/watch?v=7NrnTe28tsM',
          image_b: 'https://i.ytimg.com/vi/7NrnTe28tsM/hqdefault.jpg',
          votes_b: 145
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (side: 'a' | 'b') => {
    if (!duel || hasVoted) return;
    setHasVoted(true);
    setDuel(prev => prev ? {
      ...prev,
      [side === 'a' ? 'votes_a' : 'votes_b']: prev[side === 'a' ? 'votes_a' : 'votes_b'] + 1
    } : null);

    if (duel.id !== 999) {
      await supabase.rpc('increment_duel_vote', { row_id: duel.id, side });
      localStorage.setItem(`duel_vote_${duel.id}`, side);
    }
  };

  const handlePlay = (e: React.MouseEvent, url: string, title: string, img: string) => {
    e.stopPropagation();
    if (!url) return;
    playTrack({ url, title, image: img || FALLBACK_IMG });
  };

  // ✅ SAFE SEEKER HANDLER
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation(); 
    seek(parseFloat(e.target.value));
  };

  // ✅ BLOCKS CLICKS FROM REACHING THE CARD
  const stopProp = (e: React.MouseEvent | React.TouchEvent) => e.stopPropagation();

  if (loading || !duel) return null;

  const totalVotes = (duel.votes_a || 0) + (duel.votes_b || 0);
  const percentA = totalVotes === 0 ? 50 : Math.round(((duel.votes_a || 0) / totalVotes) * 100);
  const percentB = 100 - percentA;
  
  const imgA = duel.image_a || FALLBACK_IMG;
  const imgB = duel.image_b || FALLBACK_IMG;

  const isActiveA = activeUrl === duel.media_url_a;
  const isActiveB = activeUrl === duel.media_url_b;
  const isPlayingA = isPlaying && isActiveA;
  const isPlayingB = isPlaying && isActiveB;

  // --- RESULT BAR (Compact) ---
  if (hasVoted) {
    return (
      <div className="w-full max-w-4xl mx-auto my-8 px-4 animate-fade-in-down" dir="rtl">
        <div className="relative overflow-hidden rounded-2xl p-[2px] bg-gradient-to-r from-red-500 via-purple-500 to-blue-500">
          <div className="bg-black/90 backdrop-blur-xl rounded-2xl p-6 relative">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-blue-400">התוצאות</h3>
              <p className="text-gray-400 text-xs mt-1">נתראה בקרב הבא!</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center gap-2 flex-1">
                 <img src={imgA} className="w-20 h-20 object-cover relative z-10" style={{ borderRadius: '50%', border: '4px solid #ef4444' }} alt="" />
                 <span className="text-white text-xs font-bold text-center line-clamp-1 mt-2">{duel.title_a}</span>
              </div>
              <div className="flex-[3] flex flex-col gap-2">
                  <div className="h-6 bg-gray-800 rounded-full overflow-hidden flex text-[10px] font-black shadow-inner border border-white/5">
                      <div className="bg-gradient-to-r from-red-600 to-red-500 flex items-center justify-center text-white relative" style={{ width: `${percentA}%` }}>
                        <span className="z-10 relative drop-shadow-md">{percentA}%</span>
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      </div>
                      <div className="bg-gradient-to-l from-blue-600 to-blue-500 flex items-center justify-center text-white relative" style={{ width: `${percentB}%` }}>
                        <span className="z-10 relative drop-shadow-md">{percentB}%</span>
                      </div>
                  </div>
                  <div className="flex justify-between px-2 text-[10px] text-gray-500 font-mono tracking-widest">
                      <span>{duel.votes_a} VOTES</span>
                      <span>{duel.votes_b} VOTES</span>
                  </div>
              </div>
              <div className="flex flex-col items-center gap-2 flex-1">
                 <img src={imgB} className="w-20 h-20 object-cover relative z-10" style={{ borderRadius: '50%', border: '4px solid #3b82f6' }} alt="" />
                 <span className="text-white text-xs font-bold text-center line-clamp-1 mt-2">{duel.title_b}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- ARENA MODE (Voting) ---
  return (
    <div className="w-full max-w-5xl mx-auto my-12 px-4 relative z-20" dir="rtl">
      
      <div className="text-center mb-10 relative">
        <h2 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter drop-shadow-2xl transform -skew-x-6">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-white to-blue-500 animate-gradient-x">
            DAILY DUEL
          </span>
        </h2>
        <div className="flex items-center justify-center gap-3 mt-4">
            <span className="h-px w-12 bg-white/30"></span>
            <p className="text-purple-300 text-xs md:text-sm font-bold tracking-[0.3em] uppercase">
            מי ינצח היום?
            </p>
            <span className="h-px w-12 bg-white/30"></span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 relative">
        
        {/* === CARD A (RED) === */}
        <div className={`relative bg-gray-900/40 rounded-3xl p-4 border transition-all duration-500
            ${isPlayingA ? 'border-red-500/50 shadow-[0_0_60px_rgba(239,68,68,0.3)] scale-[1.02]' : 'border-white/5 hover:border-white/20 hover:bg-gray-900/60'}
        `}>
            {/* DISC CONTAINER */}
            <div 
                className="relative aspect-square rounded-full border-8 border-gray-900 shadow-2xl cursor-pointer overflow-hidden group mx-auto w-full max-w-[280px]"
                onClick={isPlayingA ? toggle : (e) => handlePlay(e, duel.media_url_a, duel.title_a, imgA)}
            >
                {/* Spinning Vinyl - FORCED ROUND */}
                <img 
                    src={imgA} 
                    alt={duel.title_a} 
                    className={`w-full h-full object-cover 
                        ${isPlayingA ? 'animate-[spin_4s_linear_infinite]' : 'group-hover:scale-110 transition-transform duration-700'}
                    `}
                    style={{ borderRadius: '50%' }}
                />
                
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 shadow-xl group-hover:scale-110 transition-transform">
                        {isPlayingA ? <FaPause className="text-red-500" /> : <FaPlay className="text-white ml-1" />}
                    </div>
                </div>

                {isPlayingA && <div className="absolute inset-0 rounded-full border-4 border-red-500/50 animate-ping"></div>}
            </div>

            {/* INFO & CONTROLS */}
            <div className="mt-6 text-center">
                <h3 className="text-xl md:text-2xl font-black text-white mb-1 line-clamp-1">{duel.title_a}</h3>
                <div className="h-6 flex justify-center items-center mb-4">
                    {isPlayingA ? <NeonEqualizer color="bg-red-500" /> : <span className="text-xs text-gray-500 font-bold tracking-widest">לחץ לניגון</span>}
                </div>

                {/* SEEKER BAR - NOW PROTECTED */}
                <div 
                    className={`relative h-12 flex items-center justify-center transition-all duration-500 ${isActiveA ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-2 pointer-events-none'}`}
                    onMouseDown={stopProp}
                    onTouchStart={stopProp}
                    onClick={stopProp}
                >
                    <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden relative group">
                        <div className="h-full bg-gradient-to-r from-red-600 to-orange-500 absolute left-0 top-0 transition-all duration-100 ease-out" style={{ width: `${isActiveA ? progress * 100 : 0}%` }}></div>
                        
                        {/* INPUT SLIDER: High Z-Index + Forced Pointer Events */}
                        <input 
                            type="range" 
                            min={0} max={1} step="any"
                            value={isActiveA ? progress : 0}
                            onChange={handleSeek}
                            style={{ pointerEvents: 'auto', zIndex: 50 }} 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        
                        {isActiveA && (
                            <div 
                                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg pointer-events-none transition-all duration-100 ease-out"
                                style={{ left: `${progress * 100}%`, transform: 'translate(-50%, -50%)' }}
                            />
                        )}
                    </div>
                </div>

                <button 
                    onClick={() => handleVote('a')}
                    className="w-full py-4 rounded-xl font-black text-lg uppercase tracking-wider transition-all duration-300
                    bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg shadow-red-900/20
                    hover:shadow-red-500/40 hover:scale-[1.02] active:scale-[0.98]
                    flex items-center justify-center gap-3 mt-4 border border-red-500/20"
                >
                    <FaVoteYea /> אני בוחר בזה
                </button>
            </div>
        </div>

        {/* === CARD B (BLUE) === */}
        <div className={`relative bg-gray-900/40 rounded-3xl p-4 border transition-all duration-500
            ${isPlayingB ? 'border-blue-500/50 shadow-[0_0_60px_rgba(59,130,246,0.3)] scale-[1.02]' : 'border-white/5 hover:border-white/20 hover:bg-gray-900/60'}
        `}>
            {/* DISC CONTAINER */}
            <div 
                className="relative aspect-square rounded-full border-8 border-gray-900 shadow-2xl cursor-pointer overflow-hidden group mx-auto w-full max-w-[280px]"
                onClick={isPlayingB ? toggle : (e) => handlePlay(e, duel.media_url_b, duel.title_b, imgB)}
            >
                {/* Spinning Vinyl - FORCED ROUND */}
                <img 
                    src={imgB} 
                    alt={duel.title_b} 
                    className={`w-full h-full object-cover 
                        ${isPlayingB ? 'animate-[spin_4s_linear_infinite]' : 'group-hover:scale-110 transition-transform duration-700'}
                    `}
                    style={{ borderRadius: '50%' }}
                />
                
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 shadow-xl group-hover:scale-110 transition-transform">
                        {isPlayingB ? <FaPause className="text-blue-500" /> : <FaPlay className="text-white ml-1" />}
                    </div>
                </div>

                {isPlayingB && <div className="absolute inset-0 rounded-full border-4 border-blue-500/50 animate-ping"></div>}
            </div>

            {/* INFO & CONTROLS */}
            <div className="mt-6 text-center">
                <h3 className="text-xl md:text-2xl font-black text-white mb-1 line-clamp-1">{duel.title_b}</h3>
                <div className="h-6 flex justify-center items-center mb-4">
                    {isPlayingB ? <NeonEqualizer color="bg-blue-500" /> : <span className="text-xs text-gray-500 font-bold tracking-widest">לחץ לניגון</span>}
                </div>

                {/* SEEKER BAR */}
                <div 
                    className={`relative h-12 flex items-center justify-center transition-all duration-500 ${isActiveB ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-2 pointer-events-none'}`}
                    onMouseDown={stopProp}
                    onTouchStart={stopProp}
                    onClick={stopProp}
                >
                    <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden relative group">
                        <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 absolute left-0 top-0 transition-all duration-100 ease-out" style={{ width: `${isActiveB ? progress * 100 : 0}%` }}></div>
                        
                        {/* INPUT SLIDER: High Z-Index + Forced Pointer Events */}
                        <input 
                            type="range" 
                            min={0} max={1} step="any"
                            value={isActiveB ? progress : 0}
                            onChange={handleSeek}
                            style={{ pointerEvents: 'auto', zIndex: 50 }} 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        
                        {isActiveB && (
                            <div 
                                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg pointer-events-none transition-all duration-100 ease-out"
                                style={{ left: `${progress * 100}%`, transform: 'translate(-50%, -50%)' }}
                            />
                        )}
                    </div>
                </div>

                <button 
                    onClick={() => handleVote('b')}
                    className="w-full py-4 rounded-xl font-black text-lg uppercase tracking-wider transition-all duration-300
                    bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg shadow-blue-900/20
                    hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98]
                    flex items-center justify-center gap-3 mt-4 border border-blue-500/20"
                >
                    <FaVoteYea /> אני בוחר בזה
                </button>
            </div>
        </div>

      </div>
      <div className="absolute top-0 right-0 text-[8px] text-gray-800 p-2">v4.0 (Fixed)</div>
    </div>
  );
}

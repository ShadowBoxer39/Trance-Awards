import React, { useState, useEffect } from 'react';
import { usePlayer } from './PlayerProvider'; 
import { createClient } from '@supabase/supabase-js';
import { FaPlay, FaPause, FaVoteYea, FaMusic } from 'react-icons/fa';

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

// --- NEON EQUALIZER ---
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

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation(); // Stops click from bubbling to card
    seek(parseFloat(e.target.value));
  };

  const preventBubble = (e: React.MouseEvent) => e.stopPropagation();

  if (loading || !duel) return null;

  const totalVotes = (duel.votes_a || 0) + (duel.votes_b || 0);
  const percentA = totalVotes === 0 ? 50 : Math.round(((duel.votes_a || 0) / totalVotes) * 100);
  const percentB = 100 - percentA;
  
  const imgA = duel.image_a || FALLBACK_IMG;
  const imgB = duel.image_b || FALLBACK_IMG;

  const isPlayingA = isPlaying && activeUrl === duel.media_url_a;
  const isPlayingB = isPlaying && activeUrl === duel.media_url_b;

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
              {/* A */}
              <div className="flex flex-col items-center gap-2 flex-1">
                 <div className="relative group">
                   <div className="absolute inset-0 bg-red-500 blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
                   <img src={imgA} className="w-20 h-20 rounded-full border-4 border-red-500 object-cover relative z-10" alt="" />
                   {duel.votes_a >= duel.votes_b && <span className="absolute -top-6 -right-4 text-4xl drop-shadow-lg animate-bounce z-20">👑</span>}
                 </div>
                 <span className="text-white text-xs font-bold text-center line-clamp-1 mt-2">{duel.title_a}</span>
              </div>
              {/* Bar */}
              <div className="flex-[3] flex flex-col gap-2">
                  <div className="h-6 bg-gray-800 rounded-full overflow-hidden flex text-[10px] font-black shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] border border-white/5">
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
              {/* B */}
              <div className="flex flex-col items-center gap-2 flex-1">
                 <div className="relative group">
                   <div className="absolute inset-0 bg-blue-500 blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
                   <img src={imgB} className="w-20 h-20 rounded-full border-4 border-blue-500 object-cover relative z-10" alt="" />
                   {duel.votes_b >= duel.votes_a && <span className="absolute -top-6 -right-4 text-4xl drop-shadow-lg animate-bounce z-20">👑</span>}
                 </div>
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
      
      {/* HEADER */}
      <div className="text-center mb-10 relative group cursor-default">
        <div className="absolute inset-0 bg-purple-500/20 blur-[100px] rounded-full opacity-50 group-hover:opacity-70 transition-opacity"></div>
        <h2 className="relative text-5xl md:text-7xl font-black text-white italic tracking-tighter drop-shadow-2xl transform -skew-x-6">
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
        
        {/* === VS LIGHTNING === */}
        <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none items-center justify-center">
             <div className="w-24 h-24 relative flex items-center justify-center">
                <div className="absolute inset-0 bg-white/20 blur-xl rounded-full animate-pulse"></div>
                <div className="w-20 h-20 bg-black border-2 border-white/20 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.3)] z-10 backdrop-blur-md">
                    <span className="font-black italic text-3xl text-white">VS</span>
                </div>
             </div>
        </div>

        {/* === CARD A (RED) === */}
        <div className={`relative bg-gray-900/40 rounded-3xl p-4 border transition-all duration-500
            ${isPlayingA ? 'border-red-500/50 shadow-[0_0_60px_rgba(239,68,68,0.3)] scale-[1.02]' : 'border-white/5 hover:border-white/20 hover:bg-gray-900/60'}
        `}>
            {/* DISC CONTAINER */}
            <div 
                className="relative aspect-square rounded-full border-8 border-gray-900 shadow-2xl cursor-pointer overflow-hidden group mx-auto w-full max-w-[280px]"
                onClick={isPlayingA ? toggle : (e) => handlePlay(e, duel.media_url_a, duel.title_a, imgA)}
            >
                {/* Spinning Vinyl */}
                <img 
                    src={imgA} 
                    alt={duel.title_a} 
                    className={`w-full h-full object-cover rounded-full 
                        ${isPlayingA ? 'animate-[spin_4s_linear_infinite]' : 'group-hover:scale-110 transition-transform duration-700'}
                    `}
                />
                
                {/* Center Hole / Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 shadow-xl group-hover:scale-110 transition-transform">
                        {isPlayingA ? <FaPause className="text-red-500" /> : <FaPlay className="text-white ml-1" />}
                    </div>
                </div>

                {/* Playing Ring */}
                {isPlayingA && <div className="absolute inset-0 rounded-full border-4 border-red-500/50 animate-ping"></div>}
            </div>

            {/* INFO & CONTROLS */}
            <div className="mt-6 text-center">
                <h3 className="text-xl md:text-2xl font-black text-white mb-1 line-clamp-1">{duel.title_a}</h3>
                <div className="h-6 flex justify-center items-center mb-4">
                    {isPlayingA ? <NeonEqualizer color="bg-red-500" /> : <span className="text-xs text-gray-500 font-bold tracking-widest">לחץ לניגון</span>}
                </div>

                {/* BIG SEEKER BAR */}
                <div 
                    className={`relative h-12 flex items-center justify-center transition-all duration-500 ${isPlayingA ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-2 pointer-events-none'}`}
                    onClick={preventBubble}
                >
                    <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden relative group">
                        <div className="h-full bg-gradient-to-r from-red-600 to-orange-500 absolute left-0 top-0 transition-all duration-100 ease-out" style={{ width: `${isPlayingA ? progress * 100 : 0}%` }}></div>
                        <input 
                            type="range" 
                            min={0} max={1} step="any"
                            value={isPlayingA ? progress : 0}
                            onChange={handleSeek}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                        />
                        {/* Thumb Indicator */}
                        {isPlayingA && (
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
                {/* Spinning Vinyl */}
                <img 
                    src={imgB} 
                    alt={duel.title_b} 
                    className={`w-full h-full object-cover rounded-full 
                        ${isPlayingB ? 'animate-[spin_4s_linear_infinite]' : 'group-hover:scale-110 transition-transform duration-700'}
                    `}
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

                {/* BIG SEEKER BAR */}
                <div 
                    className={`relative h-12 flex items-center justify-center transition-all duration-500 ${isPlayingB ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-2 pointer-events-none'}`}
                    onClick={preventBubble}
                >
                    <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden relative group">
                        <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 absolute left-0 top-0 transition-all duration-100 ease-out" style={{ width: `${isPlayingB ? progress * 100 : 0}%` }}></div>
                        <input 
                            type="range" 
                            min={0} max={1} step="any"
                            value={isPlayingB ? progress : 0}
                            onChange={handleSeek}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                        />
                        {isPlayingB && (
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
    </div>
  );
}

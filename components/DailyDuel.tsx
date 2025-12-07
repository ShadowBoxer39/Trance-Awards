import React, { useState, useEffect } from 'react';
import { usePlayer } from './PlayerProvider'; 
import { createClient } from '@supabase/supabase-js';
import { FaPlay, FaPause, FaVoteYea } from 'react-icons/fa'; // Make sure you have react-icons installed

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

// --- EQUALIZER COMPONENT (Visual Effect) ---
const Equalizer = () => (
  <div className="flex items-end justify-center gap-1 h-8 w-12">
    <div className="w-1.5 bg-green-400 animate-[bounce_1s_infinite] h-3"></div>
    <div className="w-1.5 bg-green-400 animate-[bounce_1.2s_infinite] h-6"></div>
    <div className="w-1.5 bg-green-400 animate-[bounce_0.8s_infinite] h-4"></div>
    <div className="w-1.5 bg-green-400 animate-[bounce_1.1s_infinite] h-5"></div>
  </div>
);

export default function DailyDuel() {
  const { playTrack, activeUrl, isPlaying, toggle, progress } = usePlayer();
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

  const handlePause = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggle();
  };

  if (loading || !duel) return null;

  const totalVotes = (duel.votes_a || 0) + (duel.votes_b || 0);
  const percentA = totalVotes === 0 ? 50 : Math.round(((duel.votes_a || 0) / totalVotes) * 100);
  const percentB = 100 - percentA;
  
  const imgA = duel.image_a || FALLBACK_IMG;
  const imgB = duel.image_b || FALLBACK_IMG;

  const isPlayingA = isPlaying && activeUrl === duel.media_url_a;
  const isPlayingB = isPlaying && activeUrl === duel.media_url_b;

  // --- COMPACT MODE (Post Vote) ---
  if (hasVoted) {
    return (
      <div className="w-full max-w-4xl mx-auto my-6 px-4 animate-fade-in-down" dir="rtl">
        <div className="bg-gradient-to-r from-gray-900 to-black border border-white/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-white">תוצאות הדו-קרב</h3>
            <p className="text-gray-400 text-sm">תודה שהצבעת!</p>
          </div>

          <div className="flex items-center gap-4 relative z-10">
            {/* A */}
            <div className="flex flex-col items-center gap-2 flex-1">
               <div className="relative">
                 <img src={imgA} className="w-16 h-16 rounded-full border-4 border-red-500 object-cover shadow-lg shadow-red-900/50" alt="" />
                 {duel.votes_a >= duel.votes_b && <span className="absolute -top-3 -right-2 text-2xl drop-shadow-md animate-bounce">👑</span>}
               </div>
               <span className="text-white font-bold text-sm text-center line-clamp-2 h-10">{duel.title_a}</span>
            </div>

            {/* Bar */}
            <div className="flex-[3] flex flex-col gap-1">
                <div className="h-8 bg-gray-800 rounded-full overflow-hidden flex text-xs font-bold shadow-inner border border-white/10">
                    <div className="bg-gradient-to-r from-red-600 to-red-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(239,68,68,0.5)]" style={{ width: `${percentA}%` }}>{percentA}%</div>
                    <div className="bg-gradient-to-l from-blue-600 to-blue-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(59,130,246,0.5)]" style={{ width: `${percentB}%` }}>{percentB}%</div>
                </div>
                <div className="flex justify-between px-2 text-[10px] text-gray-500 font-mono">
                    <span>{duel.votes_a} קולות</span>
                    <span>{duel.votes_b} קולות</span>
                </div>
            </div>

            {/* B */}
            <div className="flex flex-col items-center gap-2 flex-1">
               <div className="relative">
                 <img src={imgB} className="w-16 h-16 rounded-full border-4 border-blue-500 object-cover shadow-lg shadow-blue-900/50" alt="" />
                 {duel.votes_b >= duel.votes_a && <span className="absolute -top-3 -right-2 text-2xl drop-shadow-md animate-bounce">👑</span>}
               </div>
               <span className="text-white font-bold text-sm text-center line-clamp-2 h-10">{duel.title_b}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- FULL MODE (The Card Player) ---
  return (
    <div className="w-full max-w-6xl mx-auto my-8 px-4 relative z-30" dir="rtl">
      
      <div className="text-center mb-8 relative">
        <h2 className="relative text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-l from-red-500 via-purple-100 to-blue-500 italic tracking-tighter drop-shadow-sm">
          BATTLE OF THE BEATS
        </h2>
        <p className="text-gray-400 text-sm md:text-base mt-2 font-bold tracking-wide uppercase">
          לחץ על התמונה לניגון • לחץ למטה להצבעה
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 max-w-5xl mx-auto">
        
        {/* === CARD A === */}
        <div className={`relative rounded-3xl overflow-hidden bg-gray-900 border transition-all duration-500 group
            ${isPlayingA ? 'border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.4)] scale-[1.02]' : 'border-white/10 hover:border-white/30'}
        `}>
            {/* 1. TOP SECTION: PLAYER (Image + Controls) */}
            <div 
                className="relative h-64 md:h-80 cursor-pointer overflow-hidden"
                onClick={isPlayingA ? handlePause : (e) => handlePlay(e, duel.media_url_a, duel.title_a, imgA)}
            >
                {/* Image */}
                <img 
                    src={imgA} 
                    alt={duel.title_a} 
                    className={`w-full h-full object-cover transition-transform duration-700 
                        ${isPlayingA ? 'scale-110' : 'group-hover:scale-105 opacity-60'}
                    `}
                />
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-90" />

                {/* Center Controls */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                    {isPlayingA ? (
                        <div className="flex flex-col items-center animate-fade-in">
                            <Equalizer />
                            <div className="mt-4 w-16 h-16 rounded-full bg-red-600/90 backdrop-blur-md flex items-center justify-center shadow-2xl border border-white/20 hover:scale-110 transition-transform">
                                <FaPause className="text-white text-2xl" />
                            </div>
                            <span className="mt-2 text-xs font-bold text-red-400 tracking-widest uppercase animate-pulse">מנגן כעת</span>
                        </div>
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border-2 border-white/30 group-hover:scale-110 group-hover:bg-red-500 group-hover:border-red-500 transition-all duration-300 shadow-xl">
                            <FaPlay className="text-white text-3xl ml-1" />
                        </div>
                    )}
                </div>

                {/* Progress Bar (Bottom of Image) */}
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/10">
                    <div 
                        className="h-full bg-gradient-to-r from-red-600 to-orange-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] transition-all duration-200 ease-linear" 
                        style={{ width: isPlayingA ? `${progress * 100}%` : '0%' }}
                    />
                </div>
            </div>

            {/* 2. BOTTOM SECTION: TITLE & VOTE */}
            <div className="p-6 text-center relative bg-gray-900/50 backdrop-blur-sm">
                <h3 className="text-2xl font-black text-white mb-1 leading-tight line-clamp-2 h-16 flex items-center justify-center">
                    {duel.title_a}
                </h3>
                
                <button 
                    onClick={() => handleVote('a')}
                    className="w-full py-4 mt-2 rounded-xl font-bold text-lg uppercase tracking-wider transition-all duration-300
                    bg-gradient-to-r from-red-900 to-red-700 border border-red-500/30 text-red-100
                    hover:from-red-600 hover:to-red-500 hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] hover:text-white
                    flex items-center justify-center gap-3 group/btn"
                >
                    <FaVoteYea className="text-xl group-hover/btn:scale-125 transition-transform" />
                    הצבע לזה
                </button>
            </div>
        </div>

        {/* === VS BADGE (Mobile: Hidden or Small, Desktop: Absolute Center) === */}
        <div className="hidden md:flex absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none items-center justify-center">
             <div className="w-20 h-20 rounded-full bg-black border-4 border-white/10 flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.2)]">
                <span className="font-black italic text-2xl text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500">VS</span>
             </div>
        </div>

        {/* === CARD B === */}
        <div className={`relative rounded-3xl overflow-hidden bg-gray-900 border transition-all duration-500 group
            ${isPlayingB ? 'border-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.4)] scale-[1.02]' : 'border-white/10 hover:border-white/30'}
        `}>
            {/* 1. TOP SECTION: PLAYER */}
            <div 
                className="relative h-64 md:h-80 cursor-pointer overflow-hidden"
                onClick={isPlayingB ? handlePause : (e) => handlePlay(e, duel.media_url_b, duel.title_b, imgB)}
            >
                {/* Image */}
                <img 
                    src={imgB} 
                    alt={duel.title_b} 
                    className={`w-full h-full object-cover transition-transform duration-700 
                        ${isPlayingB ? 'scale-110' : 'group-hover:scale-105 opacity-60'}
                    `}
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-90" />

                {/* Center Controls */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                    {isPlayingB ? (
                        <div className="flex flex-col items-center animate-fade-in">
                            <Equalizer />
                            <div className="mt-4 w-16 h-16 rounded-full bg-blue-600/90 backdrop-blur-md flex items-center justify-center shadow-2xl border border-white/20 hover:scale-110 transition-transform">
                                <FaPause className="text-white text-2xl" />
                            </div>
                            <span className="mt-2 text-xs font-bold text-blue-400 tracking-widest uppercase animate-pulse">מנגן כעת</span>
                        </div>
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border-2 border-white/30 group-hover:scale-110 group-hover:bg-blue-500 group-hover:border-blue-500 transition-all duration-300 shadow-xl">
                            <FaPlay className="text-white text-3xl ml-1" />
                        </div>
                    )}
                </div>

                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/10">
                    <div 
                        className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] transition-all duration-200 ease-linear" 
                        style={{ width: isPlayingB ? `${progress * 100}%` : '0%' }}
                    />
                </div>
            </div>

            {/* 2. BOTTOM SECTION: TITLE & VOTE */}
            <div className="p-6 text-center relative bg-gray-900/50 backdrop-blur-sm">
                <h3 className="text-2xl font-black text-white mb-1 leading-tight line-clamp-2 h-16 flex items-center justify-center">
                    {duel.title_b}
                </h3>
                
                <button 
                    onClick={() => handleVote('b')}
                    className="w-full py-4 mt-2 rounded-xl font-bold text-lg uppercase tracking-wider transition-all duration-300
                    bg-gradient-to-r from-blue-900 to-blue-700 border border-blue-500/30 text-blue-100
                    hover:from-blue-600 hover:to-blue-500 hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:text-white
                    flex items-center justify-center gap-3 group/btn"
                >
                    <FaVoteYea className="text-xl group-hover/btn:scale-125 transition-transform" />
                    הצבע לזה
                </button>
            </div>
        </div>

      </div>
    </div>
  );
}

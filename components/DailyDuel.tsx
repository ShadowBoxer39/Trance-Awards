import React, { useState, useEffect } from 'react';
import { usePlayer } from './PlayerProvider'; 
import { createClient } from '@supabase/supabase-js';

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
    e.stopPropagation(); // Prevent voting when clicking play
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
        <div className="bg-white/5 border border-white/10 rounded-full p-2 shadow-2xl relative overflow-hidden backdrop-blur-md">
          <div className="flex items-center gap-4 relative z-10">
            <div className="flex items-center gap-3 flex-1 justify-end pl-2">
               <span className="text-white font-bold text-sm truncate hidden md:block">{duel.title_a}</span>
               <div className="relative shrink-0">
                 <img src={imgA} className="w-10 h-10 rounded-full border-2 border-red-500 object-cover" alt="" />
                 {duel.votes_a >= duel.votes_b && <span className="absolute -top-2 -right-1 text-lg">👑</span>}
               </div>
            </div>
            <div className="flex-[2] h-6 bg-gray-900 rounded-full overflow-hidden flex text-[10px] font-bold shadow-inner">
              <div className="bg-gradient-to-r from-red-600 to-red-500 flex items-center justify-center text-white" style={{ width: `${percentA}%` }}>{percentA}%</div>
              <div className="bg-gradient-to-l from-blue-600 to-blue-500 flex items-center justify-center text-white" style={{ width: `${percentB}%` }}>{percentB}%</div>
            </div>
            <div className="flex items-center gap-3 flex-1 justify-start pr-2">
               <div className="relative shrink-0">
                 <img src={imgB} className="w-10 h-10 rounded-full border-2 border-blue-500 object-cover" alt="" />
                 {duel.votes_b >= duel.votes_a && <span className="absolute -top-2 -right-1 text-lg">👑</span>}
               </div>
               <span className="text-white font-bold text-sm truncate hidden md:block">{duel.title_b}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- FULL MODE (The Card Player) ---
  return (
    <div className="w-full max-w-6xl mx-auto my-8 px-4 relative z-30" dir="rtl">
      
      <div className="text-center mb-6 relative">
        <h2 className="relative text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-l from-red-500 via-purple-100 to-blue-500 italic tracking-tighter">
          הדו-קרב היומי
        </h2>
        <p className="text-gray-400 text-sm mt-2 font-bold tracking-wide">
          מי ינצח? הבחירה בידיים שלכם
        </p>
      </div>

      <div className="relative flex flex-col md:flex-row gap-0 items-stretch min-h-[400px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black/40 backdrop-blur-sm">
        
        {/* === CHALLENGER A === */}
        <div 
          className={`relative flex-1 group cursor-pointer overflow-hidden transition-all duration-500
            ${isPlayingA ? 'ring-[4px] ring-inset ring-red-500 shadow-[inset_0_0_80px_rgba(239,68,68,0.4)] z-20' : 'hover:flex-[1.2]'}
          `}
          onClick={() => handleVote('a')}
        >
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
             <img 
               src={imgA} 
               alt={duel.title_a} 
               className={`w-full h-full object-cover transition-all duration-700
                 ${isPlayingA ? 'scale-110 blur-sm' : 'opacity-60 group-hover:opacity-80 group-hover:scale-105'}
               `}
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-red-900/20" />
          </div>
          
          {/* Controls */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 p-6 text-center">
            {duel.type === 'track' && (
               <button 
                 onClick={isPlayingA ? handlePause : (e) => handlePlay(e, duel.media_url_a, duel.title_a, imgA)} 
                 className={`w-20 h-20 mb-6 rounded-full flex items-center justify-center transition-all duration-300 z-30 shadow-2xl
                   ${isPlayingA 
                     ? 'bg-red-600 text-white scale-110 ring-4 ring-red-500/50' 
                     : 'bg-white/10 border-2 border-white/50 hover:bg-red-600 hover:border-red-600 hover:scale-110 backdrop-blur-md'}
                 `}
               >
                 <span className="text-3xl">{isPlayingA ? '⏸' : '▶'}</span>
               </button>
            )}
            <h3 className="text-2xl md:text-4xl font-black text-white mb-2 leading-tight drop-shadow-lg">{duel.title_a}</h3>
            
            {/* Playing Status */}
            {isPlayingA && (
                <div className="mt-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    <span className="text-red-400 text-xs font-bold tracking-widest uppercase">מנגן כעת</span>
                </div>
            )}
          </div>

          {/* Progress Bar (Bottom of Card) */}
          {isPlayingA && (
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20 z-30">
                <div 
                    className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] transition-all duration-200" 
                    style={{ width: `${progress * 100}%` }}
                />
            </div>
          )}
        </div>

        {/* === VS Badge === */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
          <div className="w-16 h-16 bg-black border-2 border-white/10 rounded-full flex items-center justify-center shadow-xl">
            <span className="font-black italic text-xl text-white">VS</span>
          </div>
        </div>

        {/* === CHALLENGER B === */}
        <div 
          className={`relative flex-1 group cursor-pointer overflow-hidden transition-all duration-500
            ${isPlayingB ? 'ring-[4px] ring-inset ring-blue-500 shadow-[inset_0_0_80px_rgba(59,130,246,0.4)] z-20' : 'hover:flex-[1.2]'}
          `}
          onClick={() => handleVote('b')}
        >
           {/* Background Image */}
           <div className="absolute inset-0 z-0">
             <img 
               src={imgB} 
               alt={duel.title_b} 
               className={`w-full h-full object-cover transition-all duration-700
                 ${isPlayingB ? 'scale-110 blur-sm' : 'opacity-60 group-hover:opacity-80 group-hover:scale-105'}
               `} 
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-blue-900/20" />
          </div>
          
          {/* Controls */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 p-6 text-center">
             {duel.type === 'track' && (
               <button 
                 onClick={isPlayingB ? handlePause : (e) => handlePlay(e, duel.media_url_b, duel.title_b, imgB)} 
                 className={`w-20 h-20 mb-6 rounded-full flex items-center justify-center transition-all duration-300 z-30 shadow-2xl
                   ${isPlayingB
                     ? 'bg-blue-600 text-white scale-110 ring-4 ring-blue-500/50' 
                     : 'bg-white/10 border-2 border-white/50 hover:bg-blue-600 hover:border-blue-600 hover:scale-110 backdrop-blur-md'}
                 `}
               >
                 <span className="text-3xl">{isPlayingB ? '⏸' : '▶'}</span>
               </button>
            )}
            <h3 className="text-2xl md:text-4xl font-black text-white mb-2 leading-tight drop-shadow-lg">{duel.title_b}</h3>

            {/* Playing Status */}
            {isPlayingB && (
                <div className="mt-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                    <span className="text-blue-400 text-xs font-bold tracking-widest uppercase">מנגן כעת</span>
                </div>
            )}
          </div>

          {/* Progress Bar (Bottom of Card) */}
          {isPlayingB && (
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20 z-30">
                <div 
                    className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)] transition-all duration-200" 
                    style={{ width: `${progress * 100}%` }}
                />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

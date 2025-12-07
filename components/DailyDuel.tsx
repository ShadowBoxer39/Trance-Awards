import React, { useState, useEffect } from 'react';
import { usePlayer } from './PlayerProvider'; 
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Fallback Image
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
  const { playTrack, activeUrl, isPlaying } = usePlayer();
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
        // ✅ DEMO MODE: NOW USING YOUTUBE!
        // These are official tracks. Click play to test.
        setDuel({
          id: 999,
          type: 'track',
          title_a: 'Infected Mushroom - Becoming Insane',
          // Note the '?t=10' -> Starts at 10 seconds!
          media_url_a: 'https://www.youtube.com/watch?v=Z6hL6fkJ1_k?t=10', 
          image_a: 'https://i.ytimg.com/vi/Z6hL6fkJ1_k/maxresdefault.jpg',
          votes_a: 120,
          
          title_b: 'Astrix - Deep Jungle Walk',
          media_url_b: 'https://www.youtube.com/watch?v=7NrnTe28tsM?t=60',
          image_b: 'https://i.ytimg.com/vi/7NrnTe28tsM/maxresdefault.jpg',
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
    
    playTrack({
      url: url,
      title: title,
      image: img || FALLBACK_IMG,
      artist: "Daily Duel"
    });
  };

  if (loading || !duel) return null;

  const totalVotes = (duel.votes_a || 0) + (duel.votes_b || 0);
  const percentA = totalVotes === 0 ? 50 : Math.round(((duel.votes_a || 0) / totalVotes) * 100);
  const percentB = 100 - percentA;
  
  const imgA = duel.image_a || FALLBACK_IMG;
  const imgB = duel.image_b || FALLBACK_IMG;

  const isPlayingA = isPlaying && activeUrl === duel.media_url_a;
  const isPlayingB = isPlaying && activeUrl === duel.media_url_b;

  // COMPACT MODE (Post Vote)
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
        <div className="text-center mt-2 text-xs text-gray-500">תודה שהצבעתם! נתראה בקרב הבא מחר.</div>
      </div>
    );
  }

  // FULL MODE
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
        {/* A */}
        <div 
          className={`relative flex-1 group cursor-pointer overflow-hidden transition-all duration-500 ${isPlayingA ? 'ring-[4px] ring-inset ring-red-500 z-20' : 'hover:flex-[1.2]'}`}
          onClick={() => handleVote('a')}
        >
          <div className="absolute inset-0 z-0">
             <img src={imgA} className={`w-full h-full object-cover transition-all duration-700 ${isPlayingA ? 'scale-110 blur-sm' : 'opacity-60 group-hover:opacity-80'}`} alt="" />
             <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-red-900/20" />
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 p-6 text-center">
            <button onClick={(e) => handlePlay(e, duel.media_url_a, duel.title_a, imgA)} className={`w-16 h-16 mb-4 rounded-full flex items-center justify-center transition-all duration-300 z-30 ${isPlayingA ? 'bg-red-500 text-white scale-110 animate-pulse' : 'bg-white/10 border-2 border-white/50 hover:bg-red-600'}`}>
               <span className="text-2xl pr-1">{isPlayingA ? '⏸' : '▶'}</span>
            </button>
            <h3 className="text-3xl font-black text-white drop-shadow-md">{duel.title_a}</h3>
          </div>
        </div>

        {/* VS */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
          <div className="w-16 h-16 bg-black border-2 border-white/10 rounded-full flex items-center justify-center shadow-xl">
            <span className="font-black italic text-xl text-white">VS</span>
          </div>
        </div>

        {/* B */}
        <div 
          className={`relative flex-1 group cursor-pointer overflow-hidden transition-all duration-500 ${isPlayingB ? 'ring-[4px] ring-inset ring-blue-500 z-20' : 'hover:flex-[1.2]'}`}
          onClick={() => handleVote('b')}
        >
           <div className="absolute inset-0 z-0">
             <img src={imgB} className={`w-full h-full object-cover transition-all duration-700 ${isPlayingB ? 'scale-110 blur-sm' : 'opacity-60 group-hover:opacity-80'}`} alt="" />
             <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-blue-900/20" />
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 p-6 text-center">
             <button onClick={(e) => handlePlay(e, duel.media_url_b, duel.title_b, imgB)} className={`w-16 h-16 mb-4 rounded-full flex items-center justify-center transition-all duration-300 z-30 ${isPlayingB ? 'bg-blue-500 text-white scale-110 animate-pulse' : 'bg-white/10 border-2 border-white/50 hover:bg-blue-600'}`}>
                 <span className="text-2xl pr-1">{isPlayingB ? '⏸' : '▶'}</span>
             </button>
            <h3 className="text-3xl font-black text-white drop-shadow-md">{duel.title_b}</h3>
          </div>
        </div>
      </div>
    </div>
  );
}

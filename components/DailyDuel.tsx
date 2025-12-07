import React, { useState, useEffect } from 'react';
import { usePlayer } from './PlayerProvider'; 
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type DuelData = {
  id: number;
  type: 'track' | 'album' | 'artist';
  title_a: string;
  media_url_a: string; // SoundCloud URL
  image_a?: string;    // NEW: Image URL
  votes_a: number;
  
  title_b: string;
  media_url_b: string; // SoundCloud URL
  image_b?: string;    // NEW: Image URL
  votes_b: number;
};

export default function DailyDuel() {
  const { playUrl, activeUrl, isPlaying } = usePlayer();
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
        // Mock Data with IMAGES
        setDuel({
          id: 999,
          type: 'track',
          title_a: 'Infected Mushroom - Becoming Insane',
          media_url_a: 'https://soundcloud.com/infectedmushroom/becoming-insane',
          image_a: '/images/infected.jpg', // Make sure this exists in public/images or use a remote URL
          votes_a: 120,
          
          title_b: 'Astrix - Deep Jungle Walk',
          media_url_b: 'https://soundcloud.com/astrix-official/astrix-deep-jungle-walk',
          image_b: '/images/astrix.jpeg',
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

  const handlePlay = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    playUrl(url);
  };

  if (loading || !duel) return null;

  const totalVotes = (duel.votes_a || 0) + (duel.votes_b || 0);
  const percentA = totalVotes === 0 ? 50 : Math.round(((duel.votes_a || 0) / totalVotes) * 100);
  const percentB = 100 - percentA;

  // --- 1. COMPACT / SHRUNK VIEW (POST VOTE) ---
  if (hasVoted) {
    return (
      <div className="w-full max-w-4xl mx-auto my-6 px-4 animate-fade-in-up" dir="rtl">
        <div className="bg-gradient-to-r from-gray-900 to-black border border-white/20 rounded-2xl p-4 shadow-2xl relative overflow-hidden">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-3 relative z-10">
             <span className="text-gray-400 text-xs font-bold tracking-widest">הדו-קרב היומי: התוצאות</span>
             <span className="text-green-400 text-xs">תודה שהצבעתם!</span>
          </div>

          {/* The Bar */}
          <div className="flex items-center gap-4 relative z-10">
            
            {/* Side A Info */}
            <div className="flex items-center gap-3 flex-1 justify-end">
               <span className="text-white font-bold text-sm truncate max-w-[100px] md:max-w-xs">{duel.title_a}</span>
               <div className="relative">
                 <img src={duel.image_a || duel.media_url_a} className="w-10 h-10 rounded-full border border-red-500 object-cover" alt="" />
                 {duel.votes_a > duel.votes_b && <span className="absolute -top-1 -right-1 text-xs">👑</span>}
               </div>
            </div>

            {/* Progress Bar */}
            <div className="flex-1 max-w-[300px] h-4 bg-gray-800 rounded-full overflow-hidden flex text-[10px] font-bold">
              <div 
                className="bg-red-600 flex items-center justify-center text-white transition-all duration-1000"
                style={{ width: `${percentA}%` }}
              >
                {percentA}%
              </div>
              <div 
                className="bg-blue-600 flex items-center justify-center text-white transition-all duration-1000"
                style={{ width: `${percentB}%` }}
              >
                {percentB}%
              </div>
            </div>

            {/* Side B Info */}
            <div className="flex items-center gap-3 flex-1 justify-start">
               <div className="relative">
                 <img src={duel.image_b || duel.media_url_b} className="w-10 h-10 rounded-full border border-blue-500 object-cover" alt="" />
                 {duel.votes_b > duel.votes_a && <span className="absolute -top-1 -right-1 text-xs">👑</span>}
               </div>
               <span className="text-white font-bold text-sm truncate max-w-[100px] md:max-w-xs">{duel.title_b}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- 2. FULL VIEW (PRE VOTE) ---
  const isPlayingA = isPlaying && activeUrl === duel.media_url_a.split('?')[0];
  const isPlayingB = isPlaying && activeUrl === duel.media_url_b.split('?')[0];

  return (
    <div className="w-full max-w-6xl mx-auto my-8 px-4 relative z-30" dir="rtl">
      
      {/* Header */}
      <div className="text-center mb-8 relative">
        <h2 className="relative text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-l from-red-500 via-purple-100 to-blue-500 italic tracking-tighter">
          הדו-קרב היומי
        </h2>
        <p className="text-gray-400 text-sm mt-2 font-bold tracking-wide">
          מי ינצח? הבחירה בידיים שלכם
        </p>
      </div>

      <div className="relative flex flex-col md:flex-row gap-0 items-stretch min-h-[450px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black/40 backdrop-blur-sm">
        
        {/* === CHALLENGER A (Right Side in RTL) === */}
        <div 
          className={`relative flex-1 group cursor-pointer overflow-hidden transition-all duration-500
            ${isPlayingA ? 'ring-[6px] ring-inset ring-red-500 shadow-[0_0_50px_rgba(239,68,68,0.5)] z-20' : 'hover:flex-[1.2]'}
          `}
          onClick={() => handleVote('a')}
        >
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
             <img 
               src={duel.image_a || duel.media_url_a} 
               alt={duel.title_a} 
               className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700" 
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-red-900/30" />
          </div>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 p-6 text-center">
            
            {/* Play Button (Always visible for tracks) */}
            {duel.type === 'track' && (
               <button 
                 onClick={(e) => handlePlay(e, duel.media_url_a)}
                 className={`w-20 h-20 mb-6 rounded-full flex items-center justify-center transition-all duration-300
                   ${isPlayingA 
                     ? 'bg-red-500 text-white scale-110 shadow-[0_0_30px_rgba(239,68,68,0.8)]' 
                     : 'bg-white/10 border-2 border-white/50 hover:bg-red-600 hover:border-red-600 hover:scale-110 backdrop-blur-md'
                   }`}
               >
                 <span className="text-3xl pr-1">{isPlayingA ? '⏸' : '▶'}</span>
               </button>
            )}

            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight drop-shadow-lg">
              {duel.title_a}
            </h3>
            <span className="text-red-300 font-bold text-sm tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
              לחץ להצבעה
            </span>
          </div>
        </div>

        {/* === VS BADGE === */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
          <div className="w-20 h-20 bg-black border-2 border-white/10 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.15)] backdrop-blur-xl">
            <span className="font-black italic text-2xl text-white">VS</span>
          </div>
        </div>

        {/* === CHALLENGER B (Left Side in RTL) === */}
        <div 
          className={`relative flex-1 group cursor-pointer overflow-hidden transition-all duration-500
            ${isPlayingB ? 'ring-[6px] ring-inset ring-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.5)] z-20' : 'hover:flex-[1.2]'}
          `}
          onClick={() => handleVote('b')}
        >
           {/* Background Image */}
           <div className="absolute inset-0 z-0">
             <img 
               src={duel.image_b || duel.media_url_b} 
               alt={duel.title_b} 
               className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700" 
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-blue-900/30" />
          </div>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 p-6 text-center">
             
             {/* Play Button */}
             {duel.type === 'track' && (
               <button 
                 onClick={(e) => handlePlay(e, duel.media_url_b)}
                 className={`w-20 h-20 mb-6 rounded-full flex items-center justify-center transition-all duration-300
                   ${isPlayingB
                     ? 'bg-blue-500 text-white scale-110 shadow-[0_0_30px_rgba(59,130,246,0.8)]' 
                     : 'bg-white/10 border-2 border-white/50 hover:bg-blue-600 hover:border-blue-600 hover:scale-110 backdrop-blur-md'
                   }`}
               >
                 <span className="text-3xl pr-1">{isPlayingB ? '⏸' : '▶'}</span>
               </button>
            )}

            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight drop-shadow-lg">
              {duel.title_b}
            </h3>
            <span className="text-blue-300 font-bold text-sm tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
              לחץ להצבעה
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

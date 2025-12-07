// components/DailyDuel.tsx
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
  media_url_a: string;
  votes_a: number;
  title_b: string;
  media_url_b: string;
  votes_b: number;
};

export default function DailyDuel() {
  // ✅ FIX 1: Use playUrl instead of playTrack
  const { playUrl } = usePlayer();
  
  const [duel, setDuel] = useState<DuelData | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDuel();
  }, []);

  const fetchDuel = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_duels')
        .select('*')
        .order('publish_date', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setDuel(data);
        if (localStorage.getItem(`duel_vote_${data.id}`)) {
          setHasVoted(true);
        }
      } else {
        // ✅ FIX 2: Fallback Mock Data (So you see the UI even if DB is empty)
        console.log("No duel found in DB, showing demo mode.");
        setDuel({
          id: 999,
          type: 'track',
          title_a: 'Infected Mushroom - Becoming Insane',
          media_url_a: 'https://soundcloud.com/infectedmushroom/becoming-insane',
          votes_a: 120,
          title_b: 'Astrix - Deep Jungle Walk',
          media_url_b: 'https://soundcloud.com/astrix-official/astrix-deep-jungle-walk',
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

    // Optimistic Update
    setHasVoted(true);
    setDuel(prev => prev ? {
      ...prev,
      [side === 'a' ? 'votes_a' : 'votes_b']: prev[side === 'a' ? 'votes_a' : 'votes_b'] + 1
    } : null);

    // Only try to save to DB if it's a real record (id !== 999)
    if (duel.id !== 999) {
        await supabase.rpc('increment_duel_vote', { row_id: duel.id, side });
        localStorage.setItem(`duel_vote_${duel.id}`, side);
    }
  };

  // ✅ FIX 3: Safe play handler
  const handlePlay = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    if (url && url.includes('soundcloud')) {
        playUrl(url);
    } else {
        alert("Playing: " + url); // Fallback if not a soundcloud link
    }
  };

  if (loading || !duel) return null;

  const totalVotes = (duel.votes_a || 0) + (duel.votes_b || 0);
  const percentA = totalVotes === 0 ? 50 : Math.round(((duel.votes_a || 0) / totalVotes) * 100);
  const percentB = 100 - percentA;

  return (
    <div className="w-full max-w-6xl mx-auto my-8 px-4 relative z-30">
      
      {/* Header */}
      <div className="text-center mb-8 relative">
        <div className="absolute inset-0 flex items-center justify-center opacity-20 blur-3xl">
          <div className="w-32 h-32 bg-purple-500 rounded-full"></div>
        </div>
        <h2 className="relative text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-purple-100 to-blue-500 italic tracking-tighter">
          THE DAILY DUEL
        </h2>
        <p className="text-gray-400 text-sm mt-2 font-mono uppercase tracking-widest">
          {duel.type.toUpperCase()} DUEL • CAST YOUR VOTE
        </p>
      </div>

      <div className="relative flex flex-col md:flex-row gap-0 items-stretch min-h-[450px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black/40 backdrop-blur-sm">
        
        {/* === CHALLENGER A (RED) === */}
        <div 
          className={`relative flex-1 group transition-all duration-700 ease-out 
            ${hasVoted ? 'flex-[1] grayscale-[0.5] hover:grayscale-0' : 'hover:flex-[1.5] cursor-pointer'}`}
          onClick={() => !hasVoted && handleVote('a')}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/80 to-black z-0 group-hover:scale-110 transition-transform duration-1000" />
          
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 p-6 text-center">
            
            <div className="mb-6 relative group/media">
               {duel.type === 'track' ? (
                 <button 
                   onClick={(e) => handlePlay(e, duel.media_url_a)}
                   className="w-28 h-28 rounded-full bg-red-600/20 border-2 border-red-500 flex items-center justify-center hover:scale-110 hover:bg-red-600 transition-all shadow-[0_0_30px_rgba(239,68,68,0.3)]"
                 >
                   <span className="text-4xl pl-1">▶</span>
                 </button>
               ) : (
                 <img src={duel.media_url_a} className="w-56 h-56 object-cover rounded-xl shadow-2xl border-2 border-red-500/30 group-hover/media:border-red-500 transition-colors" alt={duel.title_a} />
               )}
            </div>

            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight max-w-xs drop-shadow-lg">
              {duel.title_a}
            </h3>
            
            {hasVoted && (
               <div className="mt-4">
                 <span className="text-6xl font-black text-white">{percentA}%</span>
                 <div className="text-red-400 font-bold uppercase text-xs tracking-widest mt-1">Votes</div>
               </div>
            )}
          </div>
        </div>

        {/* === VS BADGE === */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
          <div className="w-20 h-20 bg-black border border-white/10 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(168,85,247,0.4)] backdrop-blur-xl">
            <span className="font-black italic text-2xl bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-blue-400">VS</span>
          </div>
        </div>

        {/* === CHALLENGER B (BLUE) === */}
        <div 
          className={`relative flex-1 group transition-all duration-700 ease-out 
            ${hasVoted ? 'flex-[1] grayscale-[0.5] hover:grayscale-0' : 'hover:flex-[1.5] cursor-pointer'}`}
          onClick={() => !hasVoted && handleVote('b')}
        >
          <div className="absolute inset-0 bg-gradient-to-bl from-blue-900/80 to-black z-0 group-hover:scale-110 transition-transform duration-1000" />
          
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 p-6 text-center">
             <div className="mb-6 relative group/media">
               {duel.type === 'track' ? (
                 <button 
                   onClick={(e) => handlePlay(e, duel.media_url_b)}
                   className="w-28 h-28 rounded-full bg-blue-600/20 border-2 border-blue-500 flex items-center justify-center hover:scale-110 hover:bg-blue-600 transition-all shadow-[0_0_30px_rgba(59,130,246,0.3)]"
                 >
                   <span className="text-4xl pl-1">▶</span>
                 </button>
               ) : (
                 <img src={duel.media_url_b} className="w-56 h-56 object-cover rounded-xl shadow-2xl border-2 border-blue-500/30 group-hover/media:border-blue-500 transition-colors" alt={duel.title_b} />
               )}
            </div>

            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight max-w-xs drop-shadow-lg">
              {duel.title_b}
            </h3>

            {hasVoted && (
               <div className="mt-4">
                 <span className="text-6xl font-black text-white">{percentB}%</span>
                 <div className="text-blue-400 font-bold uppercase text-xs tracking-widest mt-1">Votes</div>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

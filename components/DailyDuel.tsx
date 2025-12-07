import React, { useState, useEffect } from 'react';
import { usePlayer } from './PlayerProvider'; // Using your existing player!
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase (or import from your lib)
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
  const { playTrack } = usePlayer(); // Hook into your global player
  const [duel, setDuel] = useState<DuelData | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch today's duel
  useEffect(() => {
    fetchDuel();
  }, []);

  const fetchDuel = async () => {
    // Logic to get the active duel (or latest one)
    const { data } = await supabase
      .from('daily_duels')
      .select('*')
      .order('publish_date', { ascending: false })
      .limit(1)
      .single();

    if (data) setDuel(data);
    
    // Check local storage for previous vote
    const localVote = localStorage.getItem(`duel_vote_${data?.id}`);
    if (localVote) setHasVoted(true);
    
    setLoading(false);
  };

  const handleVote = async (side: 'a' | 'b') => {
    if (!duel || hasVoted) return;

    // 1. Optimistic UI Update (Show result immediately)
    setHasVoted(true);
    setDuel(prev => prev ? {
      ...prev,
      [side === 'a' ? 'votes_a' : 'votes_b']: prev[side === 'a' ? 'votes_a' : 'votes_b'] + 1
    } : null);

    // 2. Save to DB
    await supabase.rpc('increment_duel_vote', { row_id: duel.id, side });

    // 3. Save to LocalStorage to prevent spam
    localStorage.setItem(`duel_vote_${duel.id}`, side);
  };

  // Helper to calculate percentages
  const totalVotes = (duel?.votes_a || 0) + (duel?.votes_b || 0);
  const percentA = totalVotes === 0 ? 50 : Math.round(((duel?.votes_a || 0) / totalVotes) * 100);
  const percentB = 100 - percentA;

  if (loading || !duel) return null;

  return (
    <div className="w-full max-w-6xl mx-auto my-8 p-4">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 animate-pulse">
          THE DAILY DUEL
        </h2>
        <p className="text-gray-400 text-sm">Make your choice. Define the culture.</p>
      </div>

      <div className="relative flex flex-col md:flex-row gap-4 items-stretch h-[400px] md:h-[500px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
        
        {/* === OPTION A (RED) === */}
        <div 
          className={`relative flex-1 group transition-all duration-500 ${hasVoted ? 'flex-[1]' : 'hover:flex-[1.2] cursor-pointer'}`}
          onClick={() => !hasVoted && handleVote('a')}
        >
          {/* Background Image / Blur */}
          <div className="absolute inset-0 bg-red-900/20 group-hover:bg-red-900/40 transition-colors z-10" />
          
          {/* Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 p-6 text-center">
            
            {/* Media Display */}
            <div className="mb-6 relative">
               {duel.type === 'track' ? (
                 <button 
                   onClick={(e) => { e.stopPropagation(); playTrack(duel.media_url_a); }}
                   className="w-32 h-32 rounded-full bg-red-600 flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-red-500/50"
                 >
                   <span className="text-4xl">▶️</span>
                 </button>
               ) : (
                 <img src={duel.media_url_a} className="w-48 h-48 object-cover rounded-xl shadow-lg border-2 border-red-500/50" alt={duel.title_a} />
               )}
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">{duel.title_a}</h3>
            
            {hasVoted && (
               <div className="text-5xl font-black text-red-400 drop-shadow-lg">
                 {percentA}%
               </div>
            )}
          </div>
        </div>

        {/* === VS BADGE === */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
          <div className="w-16 h-16 bg-black border-2 border-white/20 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.2)]">
            <span className="font-black italic text-xl">VS</span>
          </div>
        </div>

        {/* === OPTION B (BLUE) === */}
        <div 
          className={`relative flex-1 group transition-all duration-500 ${hasVoted ? 'flex-[1]' : 'hover:flex-[1.2] cursor-pointer'}`}
          onClick={() => !hasVoted && handleVote('b')}
        >
          <div className="absolute inset-0 bg-blue-900/20 group-hover:bg-blue-900/40 transition-colors z-10" />
          
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 p-6 text-center">
             {/* Media Display B */}
             <div className="mb-6 relative">
               {duel.type === 'track' ? (
                 <button 
                   onClick={(e) => { e.stopPropagation(); playTrack(duel.media_url_b); }}
                   className="w-32 h-32 rounded-full bg-blue-600 flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-blue-500/50"
                 >
                   <span className="text-4xl">▶️</span>
                 </button>
               ) : (
                 <img src={duel.media_url_b} className="w-48 h-48 object-cover rounded-xl shadow-lg border-2 border-blue-500/50" alt={duel.title_b} />
               )}
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">{duel.title_b}</h3>

            {hasVoted && (
               <div className="text-5xl font-black text-blue-400 drop-shadow-lg">
                 {percentB}%
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

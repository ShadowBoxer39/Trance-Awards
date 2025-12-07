import React, { useState, useEffect, useRef } from 'react';
import { usePlayer } from './PlayerProvider'; 
import { createClient } from '@supabase/supabase-js';
import { FaPlay, FaPause, FaBolt } from 'react-icons/fa';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! 
);

const FALLBACK_IMG = "/images/logo.png"; 

export default function DailyDuel() {
  const { playTrack, activeUrl, isPlaying, toggle, progress, seek } = usePlayer();
  const [duel, setDuel] = useState<any>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- SMOOTH SEEKING LOGIC ---
  const [localProgress, setLocalProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Sync player progress to local state ONLY when not dragging
  useEffect(() => {
    if (!isDragging) {
      setLocalProgress(progress);
    }
  }, [progress, isDragging]);

  const handleSeekStart = () => setIsDragging(true);
  
  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalProgress(parseFloat(e.target.value));
  };

  const handleSeekEnd = (e: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>) => {
    setIsDragging(false);
    // @ts-ignore
    seek(parseFloat(e.target.value));
  };
  // ---------------------------

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
        if (typeof window !== 'undefined' && localStorage.getItem(`duel_vote_${data.id}`)) setHasVoted(true);
      } else {
        // Fallback Data
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
    setDuel((prev: any) => prev ? {
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

  if (loading || !duel) return null;

  const totalVotes = (duel.votes_a || 0) + (duel.votes_b || 0);
  const percentA = totalVotes === 0 ? 50 : Math.round(((duel.votes_a || 0) / totalVotes) * 100);
  const percentB = 100 - percentA;
  
  const isActiveA = activeUrl === duel.media_url_a;
  const isActiveB = activeUrl === duel.media_url_b;
  const isPlayingA = isPlaying && isActiveA;
  const isPlayingB = isPlaying && isActiveB;

  // Reusable Vinyl Card Component
  const DuelCard = ({ side, title, img, url, isActive, isPlayingLocal, percent }: any) => {
    const isRed = side === 'a';
    const colorClass = isRed ? 'red' : 'blue'; // Used for dynamic class names logic
    const glowColor = isRed ? 'shadow-red-500/40' : 'shadow-blue-500/40';
    const borderColor = isRed ? 'border-red-500/50' : 'border-blue-500/50';
    const btnGradient = isRed ? 'from-red-600 to-orange-600' : 'from-blue-600 to-cyan-600';

    return (
      <div className={`relative group flex flex-col items-center p-4 rounded-3xl bg-gray-900/40 border border-white/5 transition-all duration-300 ${isActive ? `bg-gray-900/80 ${borderColor} shadow-lg ${glowColor}` : 'hover:bg-gray-900/60'}`}>
        
        {/* VINYL DISC IMAGE */}
        <div 
          className="relative w-32 h-32 md:w-40 md:h-40 cursor-pointer mb-4"
          onClick={isPlayingLocal ? toggle : (e) => handlePlay(e, url, title, img)}
        >
          {/* Spinning Animation Wrapper */}
          <div className={`w-full h-full rounded-full border-4 ${isRed ? 'border-gray-800' : 'border-gray-800'} shadow-2xl overflow-hidden ${isPlayingLocal ? 'animate-spin-slow' : ''}`}>
             <img src={img} alt={title} className="w-full h-full object-cover" />
             {/* Center Vinyl Hole */}
             <div className="absolute inset-0 m-auto w-8 h-8 bg-gray-900 rounded-full border-2 border-white/20 z-10"></div>
          </div>

          {/* Play/Pause Overlay */}
          <div className="absolute inset-0 flex items-center justify-center z-20">
             <div className={`w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center border border-white/20 transition-transform ${isPlayingLocal ? 'scale-100' : 'scale-0 group-hover:scale-100'}`}>
                {isPlayingLocal ? <FaPause className="text-white text-xs" /> : <FaPlay className="text-white text-xs ml-0.5" />}
             </div>
          </div>
        </div>

        {/* INFO & CONTROLS */}
        <div className="w-full text-center z-10">
          <h3 className="text-sm md:text-base font-bold text-white line-clamp-1 mb-2 h-6">{title}</h3>
          
          {/* Custom Seek Bar */}
          <div className="relative w-full h-6 flex items-center justify-center mb-3">
             <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden relative">
                {/* Progress Fill */}
                <div 
                  className={`absolute left-0 top-0 h-full transition-all duration-75 ease-out ${isRed ? 'bg-red-500' : 'bg-blue-500'}`} 
                  style={{ width: `${isActive ? localProgress * 100 : 0}%` }}
                />
                {/* Range Input (Invisible but interactive) */}
                <input 
                  type="range" min={0} max={1} step="0.001"
                  value={isActive ? localProgress : 0}
                  onChange={handleSeekChange}
                  onMouseDown={handleSeekStart}
                  onMouseUp={handleSeekEnd}
                  onTouchStart={handleSeekStart}
                  onTouchEnd={handleSeekEnd}
                  disabled={!isActive}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
                />
             </div>
          </div>

          {/* Vote Button OR Result Bar */}
          {!hasVoted ? (
            <button 
              onClick={() => handleVote(side)}
              className={`w-full py-2.5 rounded-xl font-bold text-xs md:text-sm uppercase tracking-wider bg-gradient-to-r ${btnGradient} text-white hover:scale-[1.02] active:scale-95 transition-all shadow-lg`}
            >
              הצבעה
            </button>
          ) : (
            <div className="w-full">
               <div className="flex justify-between text-xs text-gray-400 mb-1 font-mono">
                 <span>{percent}%</span>
               </div>
               <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                 <div 
                   className={`h-full bg-gradient-to-r ${btnGradient} transition-all duration-1000 ease-out`} 
                   style={{ width: `${percent}%` }}
                 />
               </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8 px-4 relative z-20" dir="rtl">
      
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter text-white">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-white to-blue-500 animate-gradient-x">
            DAILY DUEL
          </span>
        </h2>
        <div className="text-xs font-bold text-gray-400 tracking-[0.3em] uppercase mt-1">
          מי ינצח היום?
        </div>
      </div>

      {/* Grid Container */}
      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        
        {/* VS Badge (Absolute Center) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none hidden md:flex">
           <div className="w-12 h-12 bg-black border border-white/20 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.2)]">
              <span className="font-black italic text-xs text-white"><FaBolt /></span>
           </div>
        </div>

        {/* Card A */}
        <DuelCard 
          side="a"
          title={duel.title_a}
          img={duel.image_a || FALLBACK_IMG}
          url={duel.media_url_a}
          isActive={isActiveA}
          isPlayingLocal={isPlayingA}
          percent={percentA}
        />

        {/* Card B */}
        <DuelCard 
          side="b"
          title={duel.title_b}
          img={duel.image_b || FALLBACK_IMG}
          url={duel.media_url_b}
          isActive={isActiveB}
          isPlayingLocal={isPlayingB}
          percent={percentB}
        />

      </div>
      
      {/* Mobile VS Badge (Inline) */}
      <div className="md:hidden text-center -mt-2 mb-2 relative z-30">
         <span className="bg-black px-2 text-xs font-bold text-gray-500 border border-white/10 rounded-full py-1">VS</span>
      </div>

      <style jsx global>{`
        .animate-spin-slow {
          animation: spin 6s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

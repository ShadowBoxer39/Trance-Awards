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

// --- ANIMATED EQUALIZER ---
const Equalizer = () => (
  <div className="flex items-end justify-center gap-0.5 h-4 w-6">
    <div className="w-1 bg-green-400 animate-[bounce_1s_infinite] h-2"></div>
    <div className="w-1 bg-green-400 animate-[bounce_1.2s_infinite] h-4"></div>
    <div className="w-1 bg-green-400 animate-[bounce_0.8s_infinite] h-3"></div>
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

  const handlePause = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggle();
  };

  // ✅ New Seeker Function
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    seek(parseFloat(e.target.value));
  };

  // Prevent click bubbling on the range input
  const stopProp = (e: React.MouseEvent) => e.stopPropagation();

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
      <div className="w-full max-w-4xl mx-auto my-4 px-4 animate-fade-in-down" dir="rtl">
        <div className="bg-gradient-to-r from-gray-900 to-black border border-white/10 rounded-xl p-3 shadow-lg relative overflow-hidden">
          <div className="text-center mb-2">
            <h3 className="text-sm font-bold text-gray-300">תוצאות הדו-קרב</h3>
          </div>
          <div className="flex items-center gap-3 relative z-10">
            {/* A */}
            <div className="flex flex-col items-center gap-1 flex-1">
               <div className="relative">
                 <img src={imgA} className="w-10 h-10 rounded-full border-2 border-red-500 object-cover" alt="" />
                 {duel.votes_a >= duel.votes_b && <span className="absolute -top-2 -right-1 text-lg animate-bounce">👑</span>}
               </div>
               <span className="text-white text-[10px] font-bold text-center line-clamp-1">{duel.title_a}</span>
            </div>
            {/* Bar */}
            <div className="flex-[3] flex flex-col gap-1">
                <div className="h-4 bg-gray-800 rounded-full overflow-hidden flex text-[9px] font-bold shadow-inner">
                    <div className="bg-gradient-to-r from-red-600 to-red-500 flex items-center justify-center text-white" style={{ width: `${percentA}%` }}>{percentA}%</div>
                    <div className="bg-gradient-to-l from-blue-600 to-blue-500 flex items-center justify-center text-white" style={{ width: `${percentB}%` }}>{percentB}%</div>
                </div>
            </div>
            {/* B */}
            <div className="flex flex-col items-center gap-1 flex-1">
               <div className="relative">
                 <img src={imgB} className="w-10 h-10 rounded-full border-2 border-blue-500 object-cover" alt="" />
                 {duel.votes_b >= duel.votes_a && <span className="absolute -top-2 -right-1 text-lg animate-bounce">👑</span>}
               </div>
               <span className="text-white text-[10px] font-bold text-center line-clamp-1">{duel.title_b}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- COMPACT FULL MODE ---
  return (
    <div className="w-full max-w-4xl mx-auto my-6 px-4 relative z-30" dir="rtl">
      
      <div className="text-center mb-4 relative">
        <h2 className="relative text-3xl font-black text-transparent bg-clip-text bg-gradient-to-l from-red-500 via-purple-100 to-blue-500 italic tracking-tighter">
          BATTLE OF THE BEATS
        </h2>
        <p className="text-gray-500 text-xs mt-1 font-bold tracking-widest uppercase">
          הבחירה בידיים שלכם
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 max-w-3xl mx-auto">
        
        {/* === CARD A === */}
        <div className={`relative rounded-xl overflow-hidden bg-gray-900 border transition-all duration-300 group
            ${isPlayingA ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 'border-white/10'}
        `}>
            {/* IMAGE + PLAYER */}
            <div 
                className="relative h-40 sm:h-52 cursor-pointer overflow-hidden"
                onClick={isPlayingA ? handlePause : (e) => handlePlay(e, duel.media_url_a, duel.title_a, imgA)}
            >
                <img src={imgA} alt={duel.title_a} className={`w-full h-full object-cover transition-transform duration-700 ${isPlayingA ? 'scale-110 opacity-100' : 'group-hover:scale-105 opacity-60'}`}/>
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-80" />

                {/* Center Button */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                    {isPlayingA ? (
                        <div className="w-12 h-12 rounded-full bg-red-600/90 flex items-center justify-center shadow-lg border border-white/20">
                            <FaPause className="text-white text-sm" />
                        </div>
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/30 group-hover:scale-110 transition-all">
                            <FaPlay className="text-white text-lg ml-1" />
                        </div>
                    )}
                    {isPlayingA && <div className="mt-2"><Equalizer /></div>}
                </div>

                {/* ✅ INTERACTIVE TIMELINE */}
                {isPlayingA && (
                    <div className="absolute bottom-0 left-0 right-0 h-4 z-30 flex items-end group/bar" onClick={stopProp}>
                        <input 
                            type="range" 
                            min={0} max={1} step="any"
                            value={progress}
                            onChange={handleSeek}
                            className="absolute w-full h-full opacity-0 cursor-pointer z-40"
                        />
                        <div className="w-full h-1 bg-white/20">
                            <div className="h-full bg-red-500 relative" style={{ width: `${progress * 100}%` }}>
                                <div className="absolute right-0 -top-1 w-3 h-3 bg-white rounded-full shadow-md scale-0 group-hover/bar:scale-100 transition-transform"/>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* VOTE BUTTON */}
            <div className="p-3 text-center bg-gray-900/80 backdrop-blur-sm border-t border-white/5">
                <h3 className="text-sm font-bold text-white mb-2 line-clamp-1">{duel.title_a}</h3>
                <button 
                    onClick={() => handleVote('a')}
                    className="w-full py-2 rounded-lg font-bold text-xs uppercase tracking-wide
                    bg-gradient-to-r from-red-900 to-red-800 border border-red-500/30 text-red-100
                    hover:from-red-600 hover:to-red-500 hover:text-white transition-all
                    flex items-center justify-center gap-2"
                >
                    <FaVoteYea /> הצבעה
                </button>
            </div>
        </div>

        {/* === CARD B === */}
        <div className={`relative rounded-xl overflow-hidden bg-gray-900 border transition-all duration-300 group
            ${isPlayingB ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'border-white/10'}
        `}>
            {/* IMAGE + PLAYER */}
            <div 
                className="relative h-40 sm:h-52 cursor-pointer overflow-hidden"
                onClick={isPlayingB ? handlePause : (e) => handlePlay(e, duel.media_url_b, duel.title_b, imgB)}
            >
                <img src={imgB} alt={duel.title_b} className={`w-full h-full object-cover transition-transform duration-700 ${isPlayingB ? 'scale-110 opacity-100' : 'group-hover:scale-105 opacity-60'}`}/>
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-80" />

                <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                    {isPlayingB ? (
                        <div className="w-12 h-12 rounded-full bg-blue-600/90 flex items-center justify-center shadow-lg border border-white/20">
                            <FaPause className="text-white text-sm" />
                        </div>
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/30 group-hover:scale-110 transition-all">
                            <FaPlay className="text-white text-lg ml-1" />
                        </div>
                    )}
                    {isPlayingB && <div className="mt-2"><Equalizer /></div>}
                </div>

                {/* ✅ INTERACTIVE TIMELINE */}
                {isPlayingB && (
                    <div className="absolute bottom-0 left-0 right-0 h-4 z-30 flex items-end group/bar" onClick={stopProp}>
                        <input 
                            type="range" 
                            min={0} max={1} step="any"
                            value={progress}
                            onChange={handleSeek}
                            className="absolute w-full h-full opacity-0 cursor-pointer z-40"
                        />
                        <div className="w-full h-1 bg-white/20">
                            <div className="h-full bg-blue-500 relative" style={{ width: `${progress * 100}%` }}>
                                <div className="absolute right-0 -top-1 w-3 h-3 bg-white rounded-full shadow-md scale-0 group-hover/bar:scale-100 transition-transform"/>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* VOTE BUTTON */}
            <div className="p-3 text-center bg-gray-900/80 backdrop-blur-sm border-t border-white/5">
                <h3 className="text-sm font-bold text-white mb-2 line-clamp-1">{duel.title_b}</h3>
                <button 
                    onClick={() => handleVote('b')}
                    className="w-full py-2 rounded-lg font-bold text-xs uppercase tracking-wide
                    bg-gradient-to-r from-blue-900 to-blue-800 border border-blue-500/30 text-blue-100
                    hover:from-blue-600 hover:to-blue-500 hover:text-white transition-all
                    flex items-center justify-center gap-2"
                >
                    <FaVoteYea /> הצבעה
                </button>
            </div>
        </div>

      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePlayer } from './PlayerProvider';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const FALLBACK_IMG = "/images/logo.png";

// --- Compact Vinyl with Fixed Seek ---
function CompactVinyl({ 
  isPlaying, 
  isActive,
  progress,
  color,
  onPlayPause,
  onSeek
}: { 
  imageUrl?: string; 
  isPlaying: boolean;
  isActive: boolean;
  progress: number;
  color: 'red' | 'blue';
  onPlayPause: () => void;
  onSeek: (progress: number) => void;
}) {
  const [rotation, setRotation] = useState(0);
  const [localProgress, setLocalProgress] = useState(progress);
  const [isDragging, setIsDragging] = useState(false);
  
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const seekBarRef = useRef<HTMLDivElement>(null);
  const dragProgressRef = useRef(progress);

  // Sync external progress
  useEffect(() => {
    if (!isDragging) {
      setLocalProgress(progress);
      dragProgressRef.current = progress;
    }
  }, [progress, isDragging]);

  // Rotation Animation
  useEffect(() => {
    if (isPlaying && !isDragging) {
      const animate = (currentTime: number) => {
        if (lastTimeRef.current) {
          const delta = currentTime - lastTimeRef.current;
          setRotation(prev => (prev + delta * 0.045) % 360); 
        }
        lastTimeRef.current = currentTime;
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      lastTimeRef.current = 0;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, isDragging]);

  // Calculate seek percentage (0.0 to 1.0)
  const calculateProgress = useCallback((clientX: number) => {
    if (!seekBarRef.current) return 0;
    const rect = seekBarRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const val = Math.max(0, Math.min(1, x / rect.width));
    return parseFloat(val.toFixed(4));
  }, []);

  // --- Drag Handlers ---
  const handleSeekStart = (clientX: number) => {
    if (!isActive) return;
    setIsDragging(true);
    const newProgress = calculateProgress(clientX);
    setLocalProgress(newProgress);
    dragProgressRef.current = newProgress;
  };

  const handleSeekMove = useCallback((clientX: number) => {
    if (isDragging) {
      const newProgress = calculateProgress(clientX);
      setLocalProgress(newProgress);
      dragProgressRef.current = newProgress;
    }
  }, [isDragging, calculateProgress]);

  const handleSeekEnd = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      onSeek(dragProgressRef.current); // Send final value
    }
  }, [isDragging, onSeek]);

  // Global listeners for smooth dragging outside the bar
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleSeekMove(e.clientX);
    const onTouchMove = (e: TouchEvent) => handleSeekMove(e.touches[0].clientX);
    const onMouseUp = () => handleSeekEnd();
    
    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('touchend', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onMouseUp);
    };
  }, [isDragging, handleSeekMove, handleSeekEnd]);

  // Click handler
  const handleBarClick = (e: React.MouseEvent) => {
    if (!isActive) return;
    e.stopPropagation();
    const newProgress = calculateProgress(e.clientX);
    setLocalProgress(newProgress);
    onSeek(newProgress);
  };

  const accentColor = color === 'red' ? 'from-red-500 to-orange-500' : 'from-blue-500 to-cyan-500';
  const glowColor = color === 'red' ? 'shadow-red-500/50' : 'shadow-blue-500/50';

  return (
    // dir="ltr" is CRITICAL here for the math to work correctly on Hebrew sites
    <div className="flex items-center gap-3 w-full mt-auto pt-2" dir="ltr">
      
      {/* Vinyl Play Button */}
      <div 
        className={`relative w-12 h-12 flex-shrink-0 cursor-pointer group`}
        onClick={(e) => {
          e.stopPropagation();
          onPlayPause();
        }}
      >
        <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${accentColor} blur opacity-20 group-hover:opacity-60 transition-opacity`} />
        
        <div 
          className={`relative w-full h-full rounded-full bg-black shadow-lg ${isActive ? glowColor : ''} border border-white/10 flex items-center justify-center overflow-hidden`}
          style={{ transform: `rotate(${rotation}deg)` }}
        >
           <div className="absolute inset-0 opacity-30" style={{
            background: `repeating-radial-gradient(circle at center, #333 0, #333 1px, transparent 2px, transparent 4px)`
          }} />

          <div className="absolute inset-0 flex items-center justify-center">
             <div className={`w-4 h-4 text-white z-10 drop-shadow-md ${isPlaying ? '' : 'pl-0.5'}`}>
               {isPlaying ? (
                 <svg fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
               ) : (
                 <svg fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
               )}
             </div>
          </div>
        </div>
      </div>

      {/* Seek Bar */}
      <div 
        ref={seekBarRef}
        className={`relative flex-1 h-8 flex items-center cursor-pointer group ${!isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={handleBarClick}
        onMouseDown={(e) => handleSeekStart(e.clientX)}
        onTouchStart={(e) => handleSeekStart(e.touches[0].clientX)}
      >
        <div className="relative w-full h-1.5 bg-black/40 backdrop-blur-md rounded-full overflow-hidden border border-white/5">
          <div 
            className={`absolute inset-y-0 left-0 bg-gradient-to-r ${accentColor} transition-all ${isDragging ? 'duration-0' : 'duration-300 ease-out'}`}
            style={{ width: `${localProgress * 100}%` }}
          />
        </div>
        
        {isActive && (
            <div 
              className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 bg-white rounded-full shadow-md pointer-events-none transition-transform duration-75 ${isDragging ? 'scale-125' : 'scale-0 group-hover:scale-100'}`}
              style={{ left: `${localProgress * 100}%`, marginLeft: '-6px' }} 
            />
        )}
      </div>
    </div>
  );
}

// --- Enhanced Duel Card ---
function CompactDuelCard({ 
  side,
  title,
  imageUrl,
  mediaUrl,
  isActive,
  isPlaying,
  progress,
  hasVoted,
  votePercent,
  onVote,
  onPlayPause,
  onSeek,
  isTrack
}: {
  side: 'a' | 'b';
  title: string;
  imageUrl: string;
  mediaUrl: string;
  isActive: boolean;
  isPlaying: boolean;
  progress: number;
  hasVoted: boolean;
  votePercent: number;
  onVote: () => void;
  onPlayPause: () => void;
  onSeek: (progress: number) => void;
  isTrack: boolean;
}) {
  const color = side === 'a' ? 'red' : 'blue';
  const buttonGradient = side === 'a' ? 'from-red-600 to-orange-600' : 'from-blue-600 to-cyan-600';

  return (
    <div className={`relative flex-1 min-w-0 h-48 md:h-56 rounded-2xl overflow-hidden group transition-all duration-500 ${isActive ? 'ring-2 ring-white/20 scale-[1.02] z-10' : 'hover:ring-1 hover:ring-white/10'}`}>
      
      {/* 1. BIG BACKGROUND IMAGE */}
      <div className="absolute inset-0">
        <img 
          src={imageUrl || FALLBACK_IMG} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/60 to-transparent opacity-90" />
        
        {isActive && (
             <div className={`absolute inset-0 bg-gradient-to-t ${side === 'a' ? 'from-red-900/20' : 'from-blue-900/20'} to-transparent mix-blend-overlay`} />
        )}
      </div>

      <div className="relative h-full flex flex-col justify-between p-4 md:p-5">
        
        <div className="flex justify-between items-start">
            <span className={`text-[10px] font-black tracking-widest uppercase px-2 py-1 rounded bg-black/40 backdrop-blur text-white/70 border border-white/5`}>
                {side === 'a' ? 'Challenger' : 'Defender'}
            </span>
            
            {hasVoted && (
                <div className="flex flex-col items-end animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <span className="text-2xl md:text-3xl font-black text-white drop-shadow-lg">{votePercent}%</span>
                </div>
            )}
        </div>

        <div className="space-y-3">
            <h3 className="text-white font-bold text-base md:text-lg leading-tight line-clamp-2 drop-shadow-md">
                {title}
            </h3>

            {isTrack && mediaUrl ? (
                <CompactVinyl
                    imageUrl={imageUrl} 
                    isPlaying={isPlaying}
                    isActive={isActive}
                    progress={progress}
                    color={color}
                    onPlayPause={onPlayPause}
                    onSeek={onSeek}
                />
            ) : null}

            {!hasVoted && (
                <button
                onClick={onVote}
                className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r ${buttonGradient} text-white shadow-lg shadow-black/30 transition-all hover:scale-[1.02] active:scale-95 border border-white/10`}
                >
                הצבעה ל{side === 'a' ? 'צד א׳' : 'צד ב׳'}
                </button>
            )}
            
            {hasVoted && (
                 <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mt-2">
                    <div 
                      className={`h-full bg-gradient-to-r ${buttonGradient} transition-all duration-1000 ease-out`}
                      style={{ width: `${votePercent}%` }}
                    />
                 </div>
            )}
        </div>
      </div>
    </div>
  );
}

// --- Main Layout ---
export default function DailyDuel() {
  const { playTrack, activeUrl, isPlaying, toggle, progress, seek } = usePlayer();
  const [duel, setDuel] = useState<any>(null);
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
        // Fallback
        setDuel({
          id: 999,
          type: 'track',
          title_a: 'Detune - The Point',
          media_url_a: 'https://www.youtube.com/watch?v=Z6hL6fkJ1_k',
          image_a: 'https://i.ytimg.com/vi/Z6hL6fkJ1_k/hqdefault.jpg',
          votes_a: 120,
          title_b: 'Skizologic - Spirituality',
          media_url_b: 'https://www.youtube.com/watch?v=7NrnTe28tsM',
          image_b: 'https://i.ytimg.com/vi/7NrnTe28tsM/hqdefault.jpg',
          votes_b: 145
        });
      }
    } catch (e) {
      console.error(e);
      // Fallback on error
      setDuel({
          id: 999,
          type: 'track',
          title_a: 'Detune - The Point',
          media_url_a: 'https://www.youtube.com/watch?v=Z6hL6fkJ1_k',
          image_a: 'https://i.ytimg.com/vi/Z6hL6fkJ1_k/hqdefault.jpg',
          votes_a: 120,
          title_b: 'Skizologic - Spirituality',
          media_url_b: 'https://www.youtube.com/watch?v=7NrnTe28tsM',
          image_b: 'https://i.ytimg.com/vi/7NrnTe28tsM/hqdefault.jpg',
          votes_b: 145
        });
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (side: 'a' | 'b') => {
    if (!duel || hasVoted) return;
    
    setHasVoted(true);
    setDuel((prev: any) => prev ? {
      ...prev,
      [side === 'a' ? 'votes_a' : 'votes_b']: (prev[side === 'a' ? 'votes_a' : 'votes_b'] || 0) + 1
    } : null);

    localStorage.setItem(`duel_vote_${duel.id}`, side);
    
    if (duel.id !== 999) {
      try {
        await supabase.rpc('increment_duel_vote', { row_id: duel.id, side });
      } catch (e) { console.error(e); }
    }
  };

  const handlePlay = (url: string, title: string, img: string) => {
    if (!url) return;
    playTrack({ url, title, image: img || FALLBACK_IMG });
  };

  const handleSeek = (newProgress: number) => {
    seek(newProgress);
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse flex gap-4 h-56">
          <div className="flex-1 bg-gray-800 rounded-2xl" />
          <div className="flex-1 bg-gray-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!duel) return null;

  const duelType = (duel.type || 'track') as 'track' | 'artist' | 'album';
  const isTrack = duelType === 'track';
  const totalVotes = (duel.votes_a || 0) + (duel.votes_b || 0);
  const percentA = totalVotes === 0 ? 50 : Math.round(((duel.votes_a || 0) / totalVotes) * 100);
  const percentB = 100 - percentA;

  const isActiveA = activeUrl === duel.media_url_a;
  const isActiveB = activeUrl === duel.media_url_b;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6" dir="rtl">
      <div className="text-center mb-6">
        <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase transform -rotate-1">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-white to-blue-500 drop-shadow-sm">
            Daily Duel
          </span>
        </h2>
        <p className="text-gray-400 font-medium text-sm mt-1">איזה טראק ינצח היום?</p>
      </div>

      <div className="relative flex flex-col md:flex-row items-stretch gap-4 md:gap-6">
        <CompactDuelCard
          side="a"
          title={duel.title_a}
          imageUrl={duel.image_a || FALLBACK_IMG}
          mediaUrl={duel.media_url_a}
          isActive={isActiveA}
          isPlaying={isPlaying && isActiveA}
          progress={isActiveA ? progress : 0}
          hasVoted={hasVoted}
          votePercent={percentA}
          onVote={() => handleVote('a')}
          onPlayPause={() => {
            if (isActiveA) toggle();
            else handlePlay(duel.media_url_a, duel.title_a, duel.image_a);
          }}
          onSeek={handleSeek}
          isTrack={isTrack}
        />

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
          <div className="relative group">
            <div className="absolute inset-0 bg-white rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="w-12 h-12 md:w-16 md:h-16 bg-black border-2 border-white/10 rounded-full flex items-center justify-center shadow-2xl shadow-black/50">
              <span className="text-lg md:text-xl font-black italic bg-gradient-to-br from-red-500 to-blue-500 bg-clip-text text-transparent">
                VS
              </span>
            </div>
          </div>
        </div>

        <CompactDuelCard
          side="b"
          title={duel.title_b}
          imageUrl={duel.image_b || FALLBACK_IMG}
          mediaUrl={duel.media_url_b}
          isActive={isActiveB}
          isPlaying={isPlaying && isActiveB}
          progress={isActiveB ? progress : 0}
          hasVoted={hasVoted}
          votePercent={percentB}
          onVote={() => handleVote('b')}
          onPlayPause={() => {
            if (isActiveB) toggle();
            else handlePlay(duel.media_url_b, duel.title_b, duel.image_b);
          }}
          onSeek={handleSeek}
          isTrack={isTrack}
        />
      </div>

      {hasVoted && (
        <div className="text-center mt-6 animate-in fade-in duration-700">
          <span className="inline-block px-4 py-1 rounded-full bg-white/5 text-xs text-gray-400 border border-white/5">
            סה״כ {totalVotes.toLocaleString('he-IL')} הצבעות
          </span>
        </div>
      )}
    </div>
  );
}

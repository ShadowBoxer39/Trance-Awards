import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePlayer } from './PlayerProvider';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const FALLBACK_IMG = "/images/logo.png";

// Compact Vinyl with inline seek bar
function CompactVinyl({ 
  imageUrl, 
  isPlaying, 
  isActive,
  progress,
  color,
  onPlayPause,
  onSeek
}: { 
  imageUrl: string;
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

  // Sync external progress when not dragging
  useEffect(() => {
    if (!isDragging) {
      setLocalProgress(progress);
    }
  }, [progress, isDragging]);

  // Smooth rotation animation
  useEffect(() => {
    if (isPlaying && !isDragging) {
      const animate = (currentTime: number) => {
        if (lastTimeRef.current) {
          const delta = currentTime - lastTimeRef.current;
          setRotation(prev => (prev + delta * 0.015) % 360);
        }
        lastTimeRef.current = currentTime;
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      lastTimeRef.current = 0;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, isDragging]);

  // Handle seek bar interaction
  const handleSeekInteraction = useCallback((clientX: number) => {
    if (!seekBarRef.current || !isActive) return;
    
    const rect = seekBarRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const newProgress = Math.max(0, Math.min(1, x / rect.width));
    setLocalProgress(newProgress);
    return newProgress;
  }, [isActive]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isActive) return;
    setIsDragging(true);
    handleSeekInteraction(e.clientX);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      handleSeekInteraction(e.clientX);
    }
  }, [isDragging, handleSeekInteraction]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      onSeek(localProgress);
    }
  }, [isDragging, localProgress, onSeek]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isActive) return;
    setIsDragging(true);
    handleSeekInteraction(e.touches[0].clientX);
  };

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (isDragging) {
      handleSeekInteraction(e.touches[0].clientX);
    }
  }, [isDragging, handleSeekInteraction]);

  const handleTouchEnd = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      onSeek(localProgress);
    }
  }, [isDragging, localProgress, onSeek]);

  // Global mouse/touch listeners for dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Click directly on seek bar
  const handleSeekClick = (e: React.MouseEvent) => {
    if (!isActive) return;
    const newProgress = handleSeekInteraction(e.clientX);
    if (newProgress !== undefined) {
      onSeek(newProgress);
    }
  };

  const accentColor = color === 'red' ? 'from-red-500 to-orange-500' : 'from-blue-500 to-cyan-500';
  const glowColor = color === 'red' ? 'shadow-red-500/30' : 'shadow-blue-500/30';

  return (
    <div className="flex items-center gap-3">
      {/* Mini Vinyl */}
      <div 
        className={`relative w-14 h-14 flex-shrink-0 cursor-pointer group`}
        onClick={onPlayPause}
      >
        {/* Glow */}
        <div className={`absolute -inset-1 rounded-full bg-gradient-to-br ${accentColor} blur-md opacity-0 group-hover:opacity-50 transition-opacity ${isActive ? 'opacity-40' : ''}`} />
        
        {/* Vinyl disc */}
        <div 
          className={`relative w-full h-full rounded-full overflow-hidden shadow-lg ${glowColor} ${isActive ? 'ring-2 ring-white/30' : ''}`}
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {/* Vinyl base */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800" />
          
          {/* Grooves */}
          <div className="absolute inset-0" style={{
            background: `repeating-radial-gradient(circle at center, transparent 0px, transparent 1px, rgba(255,255,255,0.03) 1px, rgba(255,255,255,0.03) 2px)`
          }} />
          
          {/* Label */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-gray-700">
              <img 
                src={imageUrl || FALLBACK_IMG} 
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }}
              />
            </div>
          </div>
          
          {/* Center hole */}
          <div className="absolute inset-0 m-auto w-1.5 h-1.5 bg-gray-900 rounded-full" />
        </div>

        {/* Play/Pause overlay */}
        <div className={`absolute inset-0 rounded-full flex items-center justify-center bg-black/50 transition-opacity ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
          <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${accentColor} flex items-center justify-center`}>
            {isPlaying ? (
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
              </svg>
            ) : (
              <svg className="w-3 h-3 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </div>
        </div>
      </div>

      {/* Seek Bar */}
      <div 
        ref={seekBarRef}
        className={`flex-1 h-8 flex items-center cursor-pointer group ${!isActive ? 'opacity-40 cursor-not-allowed' : ''}`}
        onClick={handleSeekClick}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="relative w-full h-2 bg-gray-700/50 rounded-full overflow-hidden">
          {/* Progress fill */}
          <div 
            className={`absolute inset-y-0 left-0 bg-gradient-to-r ${accentColor} rounded-full transition-all ${isDragging ? '' : 'duration-100'}`}
            style={{ width: `${localProgress * 100}%` }}
          />
          
          {/* Hover effect */}
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
          
          {/* Drag handle */}
          {isActive && (
            <div 
              className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-lg transition-transform ${isDragging ? 'scale-125' : 'scale-0 group-hover:scale-100'}`}
              style={{ left: `calc(${localProgress * 100}% - 8px)` }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Compact Duel Card
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
  const borderGradient = side === 'a' ? 'from-red-500/40 to-orange-500/40' : 'from-blue-500/40 to-cyan-500/40';
  const buttonGradient = side === 'a' ? 'from-red-600 to-orange-600' : 'from-blue-600 to-cyan-600';
  const textColor = side === 'a' ? 'text-red-400' : 'text-blue-400';

  return (
    <div className="relative flex-1 min-w-0">
      {/* Glow on active */}
      <div className={`absolute -inset-0.5 rounded-2xl bg-gradient-to-r ${borderGradient} blur-md transition-opacity duration-300 ${isActive ? 'opacity-60' : 'opacity-0'}`} />
      
      {/* Card */}
      <div className={`relative bg-gray-900/80 backdrop-blur-sm rounded-2xl p-4 border border-white/10 transition-all ${isActive ? 'border-white/20' : ''}`}>
        
        {/* Title */}
        <h3 className="text-sm font-bold text-white truncate mb-3 text-center">
          {title}
        </h3>

        {/* Player or Image */}
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
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
              <img 
                src={imageUrl || FALLBACK_IMG}
                alt={title}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }}
              />
            </div>
          </div>
        )}

        {/* Vote Button or Result */}
        <div className="mt-3">
          {!hasVoted ? (
            <button
              onClick={onVote}
              className={`w-full py-2 px-3 rounded-lg font-bold text-xs uppercase tracking-wider bg-gradient-to-r ${buttonGradient} text-white shadow-md transition-all hover:scale-[1.02] active:scale-95`}
            >
              הצבעה
            </button>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className={`text-lg font-black ${textColor}`}>{votePercent}%</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${buttonGradient} rounded-full transition-all duration-1000`}
                  style={{ width: `${votePercent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Main Component - Compact Horizontal Layout
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
      console.error('Failed to fetch duel:', e);
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

    if (duel.id !== 999) {
      try {
        await supabase.rpc('increment_duel_vote', { row_id: duel.id, side });
        localStorage.setItem(`duel_vote_${duel.id}`, side);
      } catch (e) {
        console.error('Vote error:', e);
      }
    } else {
      localStorage.setItem(`duel_vote_${duel.id}`, side);
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
      <div className="w-full max-w-3xl mx-auto px-4 py-6">
        <div className="animate-pulse flex gap-4">
          <div className="flex-1 h-32 bg-gray-800 rounded-2xl" />
          <div className="w-12" />
          <div className="flex-1 h-32 bg-gray-800 rounded-2xl" />
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
  const isPlayingA = isPlaying && isActiveA;
  const isPlayingB = isPlaying && isActiveB;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-4" dir="rtl">
      {/* Compact Header */}
      <div className="text-center mb-4">
        <h2 className="text-2xl md:text-3xl font-black italic tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-white to-blue-500">
            DAILY DUEL
          </span>
        </h2>
        <p className="text-xs text-gray-500">מי ינצח היום?</p>
      </div>

      {/* Horizontal Battle Layout */}
      <div className="flex items-stretch gap-3 md:gap-4">
        {/* Card A */}
        <CompactDuelCard
          side="a"
          title={duel.title_a}
          imageUrl={duel.image_a || FALLBACK_IMG}
          mediaUrl={duel.media_url_a}
          isActive={isActiveA}
          isPlaying={isPlayingA}
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

        {/* VS Badge */}
        <div className="flex items-center justify-center flex-shrink-0">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-blue-500 rounded-full blur-lg opacity-30" />
            <div className="relative w-10 h-10 md:w-12 md:h-12 bg-black border border-white/20 rounded-full flex items-center justify-center">
              <span className="text-xs md:text-sm font-black italic bg-gradient-to-r from-red-400 to-blue-400 bg-clip-text text-transparent">
                VS
              </span>
            </div>
          </div>
        </div>

        {/* Card B */}
        <CompactDuelCard
          side="b"
          title={duel.title_b}
          imageUrl={duel.image_b || FALLBACK_IMG}
          mediaUrl={duel.media_url_b}
          isActive={isActiveB}
          isPlaying={isPlayingB}
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

      {/* Total votes */}
      {hasVoted && totalVotes > 0 && (
        <div className="text-center mt-3">
          <span className="text-xs text-gray-500">
            {totalVotes.toLocaleString('he-IL')} הצבעות
          </span>
        </div>
      )}
    </div>
  );
}

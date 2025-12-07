import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePlayer } from './PlayerProvider';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const FALLBACK_IMG = "/images/logo.png";

// Type badge colors and icons
const TYPE_CONFIG = {
  track: { icon: '🎵', label: 'טראק', gradient: 'from-violet-600 to-fuchsia-600' },
  artist: { icon: '🎤', label: 'אמן', gradient: 'from-cyan-600 to-blue-600' },
  album: { icon: '💿', label: 'אלבום', gradient: 'from-amber-600 to-orange-600' },
};

// Circular Progress Ring Component
function CircularProgress({ progress, isActive, color }: { progress: number; isActive: boolean; color: 'red' | 'blue' }) {
  const radius = 72;
  const stroke = 4;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress * circumference);
  
  const gradientId = `progress-gradient-${color}`;
  const glowColor = color === 'red' ? 'rgba(239, 68, 68, 0.6)' : 'rgba(59, 130, 246, 0.6)';

  return (
    <svg
      height={radius * 2}
      width={radius * 2}
      className="absolute inset-0 m-auto -rotate-90 pointer-events-none"
      style={{ filter: isActive ? `drop-shadow(0 0 8px ${glowColor})` : 'none' }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          {color === 'red' ? (
            <>
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#fb923c" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </>
          )}
        </linearGradient>
      </defs>
      
      {/* Background track */}
      <circle
        stroke="rgba(255,255,255,0.1)"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      
      {/* Progress arc */}
      <circle
        stroke={`url(#${gradientId})`}
        fill="transparent"
        strokeWidth={stroke}
        strokeDasharray={`${circumference} ${circumference}`}
        style={{ 
          strokeDashoffset,
          transition: 'stroke-dashoffset 0.1s ease-out',
          strokeLinecap: 'round'
        }}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
    </svg>
  );
}

// Vinyl Disc Component
function VinylDisc({ 
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
  const discRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [rotation, setRotation] = useState(0);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  
  // Smooth rotation animation
  useEffect(() => {
    if (isPlaying && !isDragging) {
      const animate = (currentTime: number) => {
        if (lastTimeRef.current) {
          const delta = currentTime - lastTimeRef.current;
          setRotation(prev => (prev + delta * 0.02) % 360); // ~33 RPM
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

  // Seek by clicking on the progress ring
  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isActive) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    let progress = (angle + Math.PI / 2) / (2 * Math.PI);
    if (progress < 0) progress += 1;
    
    onSeek(Math.max(0, Math.min(1, progress)));
  }, [isActive, onSeek]);

  const glowColor = color === 'red' 
    ? 'shadow-red-500/40 hover:shadow-red-500/60' 
    : 'shadow-blue-500/40 hover:shadow-blue-500/60';
  
  const ringColor = color === 'red' ? 'ring-red-500/50' : 'ring-blue-500/50';

  return (
    <div 
      className="relative w-36 h-36 md:w-44 md:h-44 cursor-pointer group"
      onClick={handleSeek}
    >
      {/* Outer glow */}
      <div className={`absolute -inset-2 rounded-full bg-gradient-to-br ${color === 'red' ? 'from-red-600/20 to-orange-600/20' : 'from-blue-600/20 to-cyan-600/20'} blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      
      {/* Circular Progress */}
      <CircularProgress progress={isActive ? progress : 0} isActive={isActive} color={color} />
      
      {/* Vinyl Container */}
      <div 
        ref={discRef}
        className={`absolute inset-3 rounded-full overflow-hidden shadow-2xl ${glowColor} transition-shadow duration-300 ${isActive ? `ring-2 ${ringColor}` : ''}`}
        style={{ 
          transform: `rotate(${rotation}deg)`,
          transition: isDragging ? 'none' : undefined
        }}
        onClick={(e) => {
          e.stopPropagation();
          onPlayPause();
        }}
      >
        {/* Vinyl base */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-full" />
        
        {/* Vinyl grooves */}
        <div className="absolute inset-0 rounded-full" style={{
          background: `repeating-radial-gradient(
            circle at center,
            transparent 0px,
            transparent 2px,
            rgba(255,255,255,0.03) 2px,
            rgba(255,255,255,0.03) 3px,
            transparent 3px,
            transparent 5px
          )`
        }} />
        
        {/* Label/Image area */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-4 border-gray-800 shadow-inner">
            <img 
              src={imageUrl || FALLBACK_IMG} 
              alt="Track artwork"
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }}
            />
          </div>
        </div>
        
        {/* Center hole */}
        <div className="absolute inset-0 m-auto w-3 h-3 bg-gray-900 rounded-full border border-gray-700 z-10" />
        
        {/* Shine effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
      </div>
      
      {/* Play/Pause overlay */}
      <div 
        className={`absolute inset-3 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all duration-300 ${
          isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onPlayPause();
        }}
      >
        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110 ${
          color === 'red' ? 'bg-gradient-to-br from-red-500 to-orange-500' : 'bg-gradient-to-br from-blue-500 to-cyan-500'
        }`}>
          {isPlaying ? (
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
            </svg>
          ) : (
            <svg className="w-5 h-5 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}

// VS Badge Component
function VSBadge() {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
      <div className="relative">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-blue-500 rounded-full blur-xl opacity-50 animate-pulse" />
        
        {/* Badge */}
        <div className="relative w-14 h-14 md:w-16 md:h-16 bg-black border-2 border-white/20 rounded-full flex items-center justify-center shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-full" />
          <span className="text-xl md:text-2xl font-black italic bg-gradient-to-r from-red-400 to-blue-400 bg-clip-text text-transparent">
            VS
          </span>
        </div>
        
        {/* Lightning bolts */}
        <svg className="absolute -left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-400 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
        <svg className="absolute -right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-400 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
      </div>
    </div>
  );
}

// Duel Card Component
function DuelCard({ 
  side,
  title,
  subtitle,
  imageUrl,
  mediaUrl,
  isActive,
  isPlaying,
  progress,
  hasVoted,
  votePercent,
  totalVotes,
  onVote,
  onPlayPause,
  onSeek,
  duelType
}: {
  side: 'a' | 'b';
  title: string;
  subtitle?: string;
  imageUrl: string;
  mediaUrl: string;
  isActive: boolean;
  isPlaying: boolean;
  progress: number;
  hasVoted: boolean;
  votePercent: number;
  totalVotes: number;
  onVote: () => void;
  onPlayPause: () => void;
  onSeek: (progress: number) => void;
  duelType: 'track' | 'artist' | 'album';
}) {
  const color = side === 'a' ? 'red' : 'blue';
  const isTrack = duelType === 'track';
  
  const gradientBorder = side === 'a' 
    ? 'from-red-500/50 via-orange-500/50 to-red-500/50'
    : 'from-blue-500/50 via-cyan-500/50 to-blue-500/50';
  
  const buttonGradient = side === 'a'
    ? 'from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500'
    : 'from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500';

  return (
    <div className={`relative group`}>
      {/* Card glow on active */}
      <div className={`absolute -inset-1 rounded-3xl bg-gradient-to-r ${gradientBorder} blur-lg transition-opacity duration-500 ${isActive ? 'opacity-60' : 'opacity-0 group-hover:opacity-30'}`} />
      
      {/* Card */}
      <div className={`relative bg-gray-900/80 backdrop-blur-xl rounded-3xl p-6 border border-white/10 transition-all duration-300 ${isActive ? 'bg-gray-900/95 border-white/20' : 'hover:bg-gray-900/90'}`}>
        
        {/* Vinyl / Image Area */}
        <div className="flex justify-center mb-5">
          {isTrack && mediaUrl ? (
            <VinylDisc
              imageUrl={imageUrl}
              isPlaying={isPlaying}
              isActive={isActive}
              progress={progress}
              color={color}
              onPlayPause={onPlayPause}
              onSeek={onSeek}
            />
          ) : (
            <div className="relative w-36 h-36 md:w-44 md:h-44 group/img">
              <div className={`absolute -inset-2 rounded-2xl bg-gradient-to-br ${side === 'a' ? 'from-red-600/30 to-orange-600/30' : 'from-blue-600/30 to-cyan-600/30'} blur-xl opacity-0 group-hover/img:opacity-100 transition-opacity duration-500`} />
              <div className="relative w-full h-full rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl">
                <img 
                  src={imageUrl || FALLBACK_IMG}
                  alt={title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110"
                  onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
            </div>
          )}
        </div>
        
        {/* Title */}
        <div className="text-center mb-4">
          <h3 className="text-sm md:text-base font-bold text-white line-clamp-2 min-h-[2.5rem]">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        
        {/* Vote Button or Results */}
        {!hasVoted ? (
          <button
            onClick={onVote}
            className={`w-full py-3 px-4 rounded-xl font-bold text-sm uppercase tracking-wider bg-gradient-to-r ${buttonGradient} text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-95`}
          >
            הצבעה
          </button>
        ) : (
          <div className="space-y-2">
            {/* Percentage display */}
            <div className="flex items-center justify-between">
              <span className={`text-2xl font-black ${side === 'a' ? 'text-red-400' : 'text-blue-400'}`}>
                {votePercent}%
              </span>
              <span className="text-xs text-gray-500">
                {Math.round(totalVotes * votePercent / 100)} הצבעות
              </span>
            </div>
            
            {/* Progress bar */}
            <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className={`absolute inset-y-0 left-0 bg-gradient-to-r ${buttonGradient} rounded-full transition-all duration-1000 ease-out`}
                style={{ width: `${votePercent}%` }}
              />
              {/* Animated shine */}
              <div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shine"
                style={{ animationDelay: side === 'b' ? '0.5s' : '0s' }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Main Component
export default function DailyDuel() {
  const { playTrack, activeUrl, isPlaying, toggle, progress, seek } = usePlayer();
  const [duel, setDuel] = useState<any>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [localProgress, setLocalProgress] = useState(0);

  // Sync progress
  useEffect(() => {
    setLocalProgress(progress);
  }, [progress]);

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
        // Fallback demo data
        setDuel({
          id: 999,
          type: 'track',
          title_a: 'Detune - The Point',
          media_url_a: 'https://www.youtube.com/watch?v=example1',
          image_a: 'https://i.ytimg.com/vi/Z6hL6fkJ1_k/hqdefault.jpg',
          votes_a: 120,
          title_b: 'Skizologic - Spirituality',
          media_url_b: 'https://www.youtube.com/watch?v=example2',
          image_b: 'https://i.ytimg.com/vi/7NrnTe28tsM/hqdefault.jpg',
          votes_b: 145
        });
      }
    } catch (e) {
      console.error('Failed to fetch duel:', e);
      // Set fallback on error
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
    setLocalProgress(newProgress);
    seek(newProgress);
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto my-8 px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-800 rounded-lg w-48 mx-auto mb-6" />
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-3xl h-80" />
            <div className="bg-gray-800 rounded-3xl h-80" />
          </div>
        </div>
      </div>
    );
  }

  if (!duel) return null;

  const duelType = (duel.type || 'track') as 'track' | 'artist' | 'album';
  const typeConfig = TYPE_CONFIG[duelType];
  const totalVotes = (duel.votes_a || 0) + (duel.votes_b || 0);
  const percentA = totalVotes === 0 ? 50 : Math.round(((duel.votes_a || 0) / totalVotes) * 100);
  const percentB = 100 - percentA;

  const isActiveA = activeUrl === duel.media_url_a;
  const isActiveB = activeUrl === duel.media_url_b;
  const isPlayingA = isPlaying && isActiveA;
  const isPlayingB = isPlaying && isActiveB;

  return (
    <div className="w-full max-w-4xl mx-auto my-8 px-4 relative z-20" dir="rtl">
      {/* Header */}
      <div className="text-center mb-8">
        {/* Type badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-4">
          <span>{typeConfig.icon}</span>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {typeConfig.label} vs {typeConfig.label}
          </span>
        </div>
        
        {/* Title */}
        <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter mb-2">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-white to-blue-500">
            DAILY DUEL
          </span>
        </h2>
        
        <p className="text-sm md:text-base text-gray-400 font-medium">
          מי ינצח היום?
        </p>
      </div>

      {/* Battle Arena */}
      <div className="relative">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-900/20 via-transparent to-blue-900/20 blur-3xl -z-10" />
        
        {/* Grid */}
        <div className="relative grid grid-cols-2 gap-4 md:gap-8">
          {/* VS Badge - Desktop */}
          <div className="hidden md:block">
            <VSBadge />
          </div>

          {/* Card A */}
          <DuelCard
            side="a"
            title={duel.title_a}
            imageUrl={duel.image_a || FALLBACK_IMG}
            mediaUrl={duel.media_url_a}
            isActive={isActiveA}
            isPlaying={isPlayingA}
            progress={isActiveA ? localProgress : 0}
            hasVoted={hasVoted}
            votePercent={percentA}
            totalVotes={totalVotes}
            onVote={() => handleVote('a')}
            onPlayPause={() => {
              if (isActiveA) {
                toggle();
              } else {
                handlePlay(duel.media_url_a, duel.title_a, duel.image_a);
              }
            }}
            onSeek={handleSeek}
            duelType={duelType}
          />

          {/* Card B */}
          <DuelCard
            side="b"
            title={duel.title_b}
            imageUrl={duel.image_b || FALLBACK_IMG}
            mediaUrl={duel.media_url_b}
            isActive={isActiveB}
            isPlaying={isPlayingB}
            progress={isActiveB ? localProgress : 0}
            hasVoted={hasVoted}
            votePercent={percentB}
            totalVotes={totalVotes}
            onVote={() => handleVote('b')}
            onPlayPause={() => {
              if (isActiveB) {
                toggle();
              } else {
                handlePlay(duel.media_url_b, duel.title_b, duel.image_b);
              }
            }}
            onSeek={handleSeek}
            duelType={duelType}
          />
        </div>

        {/* Mobile VS Badge */}
        <div className="md:hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
          <div className="w-10 h-10 bg-black border border-white/20 rounded-full flex items-center justify-center shadow-xl">
            <span className="text-xs font-black italic text-white">VS</span>
          </div>
        </div>
      </div>

      {/* Total votes indicator */}
      {hasVoted && totalVotes > 0 && (
        <div className="text-center mt-6">
          <span className="text-sm text-gray-500">
            סה״כ {totalVotes.toLocaleString('he-IL')} הצבעות
          </span>
        </div>
      )}

      {/* Custom animations */}
      <style jsx global>{`
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shine {
          animation: shine 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

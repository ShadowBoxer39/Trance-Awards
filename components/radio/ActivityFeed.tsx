// components/radio/ActivityFeed.tsx
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Milestone } from '@/pages/api/radio/milestones';

interface ActivityFeedProps {
  maxItems?: number;
}

// Format time ago (e.g., "2m ago", "1h ago")
const timeAgo = (timestamp: string) => {
  const now = new Date().getTime();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'כרגע';
  if (diffMins < 60) return `לפני ${diffMins} דקות`;
  if (diffHours < 24) return `לפני ${diffHours} שעות`;
  return `לפני ${diffDays} ימים`;
};

// Get milestone display text and emoji
const getMilestoneDisplay = (milestone: Milestone) => {
  const { milestone_type, metadata, nickname } = milestone;

  switch (milestone_type) {
    case 'listening_hours':
      return {
        icon: '🎧',
        text: `${nickname} הגיע ל-${metadata.hours} שעות האזנה!`,
        gradient: 'from-purple-500 to-pink-500'
      };

    case 'first_signup':
      return {
        icon: '👋',
        text: `${nickname} הצטרף לרדיו!`,
        gradient: 'from-green-500 to-emerald-500'
      };

    case 'track_liked':
      return {
        icon: '❤️',
        text: `${nickname} אהב את "${metadata.track_name}"`,
        gradient: 'from-pink-500 to-rose-500',
        subtitle: metadata.artist_name
      };

    case 'track_milestone_likes':
      return {
        icon: '🔥',
        text: `"${metadata.track_name}" הגיע ל-${metadata.like_count} לייקים!`,
        gradient: 'from-orange-500 to-red-500',
        subtitle: metadata.artist_name
      };

    case 'track_rank_one':
      return {
        icon: '👑',
        text: `"${metadata.track_name}" הגיע למקום הראשון!`,
        gradient: 'from-yellow-500 to-amber-500',
        subtitle: metadata.artist_name
      };

    case 'track_submitted':
      return {
        icon: '🎵',
        text: `${nickname} שלח טראק חדש: "${metadata.track_name}"`,
        gradient: 'from-blue-500 to-cyan-500'
      };

    case 'total_listeners':
      return {
        icon: '🎊',
        text: `הרדיו הגיע ל-${metadata.count} מאזינים!`,
        gradient: 'from-purple-500 to-indigo-500'
      };

    case 'track_first_like':
      return {
        icon: '💝',
        text: `${nickname} נתן לייק ראשון ל"${metadata.track_name}"`,
        gradient: 'from-rose-500 to-pink-500',
        subtitle: metadata.artist_name
      };

    default:
      return {
        icon: '✨',
        text: 'משהו מעניין קרה!',
        gradient: 'from-gray-500 to-slate-500'
      };
  }
};

export default function ActivityFeed({ maxItems = 10 }: ActivityFeedProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const lastTimestampRef = useRef<string | null>(null);

  const fetchMilestones = async (since?: string) => {
    try {
      const url = since
        ? `/api/radio/milestones?since=${encodeURIComponent(since)}&limit=${maxItems}`
        : `/api/radio/milestones?limit=${maxItems}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.milestones && data.milestones.length > 0) {
        if (since) {
          // New milestones - prepend to list
          setMilestones(prev => [
            ...data.milestones,
            ...prev.slice(0, maxItems - data.milestones.length)
          ]);
        } else {
          // Initial load
          setMilestones(data.milestones);
        }

        // Update last timestamp
        lastTimestampRef.current = data.milestones[0].created_at;
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch milestones:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchMilestones();

    // Poll for new milestones every 30 seconds (reduced from 10s to save bandwidth)
    const interval = setInterval(() => {
      if (lastTimestampRef.current) {
        fetchMilestones(lastTimestampRef.current);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">⚡</span>
          <h3 className="text-lg font-bold text-white">פעילות אחרונה</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/20 rounded-2xl p-4 border border-white/5 overflow-hidden" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">⚡</span>
        <h3 className="text-sm font-bold text-white">פעילות אחרונה</h3>
        <div className="flex-1"></div>
        <span className="text-xs text-gray-600">Live</span>
      </div>

      {/* Activity List */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {milestones.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-gray-400 py-8"
            >
              <p>אין פעילות עדיין</p>
              <p className="text-sm mt-2">היו הראשונים! 🎵</p>
            </motion.div>
          ) : (
            milestones.slice(0, 10).map((milestone, index) => {
              const display = getMilestoneDisplay(milestone);

              return (
                <motion.div
                  key={milestone.id}
                  layout
                  initial={{ opacity: 0, x: -50, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 50, scale: 0.9 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                    delay: index * 0.05
                  }}
                  className="relative flex items-center gap-3 p-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
                >
                  {/* Icon */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <span className="text-lg">{display.icon}</span>
                  </div>

                  {/* Avatar if available */}
                  {milestone.avatar_url && (
                    <div className="w-7 h-7 rounded-full border border-white/20 flex-shrink-0 overflow-hidden bg-white/10 flex items-center justify-center">
                      {milestone.avatar_url.startsWith('http') && !milestone.avatar_url.includes('instagram') ? (
                        <img
                          src={milestone.avatar_url}
                          alt={milestone.nickname || ''}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            target.parentElement!.style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="text-sm">{milestone.avatar_url.includes('instagram') ? '👤' : milestone.avatar_url}</span>
                      )}
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/90 leading-tight break-words">
                      {display.text}
                    </p>
                    {display.subtitle && (
                      <p className="text-xs text-gray-500 mt-0.5 break-words">
                        {display.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Time */}
                  <div className="text-xs text-gray-600 flex-shrink-0">
                    {timeAgo(milestone.created_at)}
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

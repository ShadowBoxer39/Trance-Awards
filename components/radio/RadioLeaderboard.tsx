// components/radio/RadioLeaderboard.tsx
import { useState, useEffect } from 'react';
import { FaTrophy, FaCrown, FaHeadphones } from 'react-icons/fa';

interface LeaderboardEntry {
  id: string;
  nickname: string;
  avatar_url: string;
  total_seconds: number;
}

// Same level function as chat - keep in sync!
const getListenerLevel = (totalSeconds: number) => {
  const hours = totalSeconds / 3600;
  if (hours >= 100) return { badge: '💎', title: 'אגדה', color: 'from-cyan-400 to-blue-500' };
  if (hours >= 50) return { badge: '🥇', title: 'סופרפאן', color: 'from-yellow-400 to-amber-500' };
  if (hours >= 10) return { badge: '🥈', title: 'סבבה', color: 'from-gray-300 to-gray-400' };
  return { badge: '🥉', title: 'חדש/ה', color: 'from-amber-600 to-amber-700' };
};

const formatHours = (totalSeconds: number): string => {
  const hours = totalSeconds / 3600;
  if (hours < 1) {
    const minutes = Math.floor(totalSeconds / 60);
    return `${minutes} דק׳`;
  }
  return `${hours.toFixed(1)} שעות`;
};

interface RadioLeaderboardProps {
  currentUserId?: string;
}

export default function RadioLeaderboard({ currentUserId }: RadioLeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch('/api/radio/leaderboard?limit=10');
        if (res.ok) {
          const data = await res.json();
          setLeaderboard(data);
        }
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
      }
      setLoading(false);
    };

    fetchLeaderboard();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchLeaderboard, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getRankStyle = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/30';
      case 1:
        return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/30';
      case 2:
        return 'bg-gradient-to-r from-amber-600/20 to-amber-700/20 border-amber-600/30';
      default:
        return 'bg-white/5 border-white/5';
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <FaCrown className="text-yellow-500" />;
      case 1:
        return <span className="text-gray-400 font-bold">2</span>;
      case 2:
        return <span className="text-amber-600 font-bold">3</span>;
      default:
        return <span className="text-gray-500 font-medium">{index + 1}</span>;
    }
  };

  if (loading) {
    return (
      <div className="bg-black/20 rounded-2xl border border-white/5 p-4 overflow-hidden">
        <div className="flex items-center gap-2 mb-4">
          <FaTrophy className="text-yellow-500" />
          <span className="font-bold text-white text-sm">טבלת המאזינים</span>
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
     <div className="bg-black/20 rounded-2xl border border-white/5 p-4 overflow-hidden">
        <div className="flex items-center gap-2 mb-4">
          <FaTrophy className="text-yellow-500" />
          <span className="font-bold text-white text-sm">טבלת המאזינים</span>
        </div>
        <div className="text-center py-6 text-gray-500 text-sm">
          <FaHeadphones className="mx-auto text-2xl mb-2 opacity-50" />
          <p>אין מאזינים עדיין</p>
          <p className="text-xs mt-1">התחברו והתחילו להאזין!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/20 rounded-2xl border border-white/5 p-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <FaTrophy className="text-yellow-500" />
        <span className="font-bold text-white text-sm">טבלת המאזינים</span>
        <span className="text-xs text-gray-500">Top 10</span>
      </div>

      {/* Leaderboard list */}
      <div className="space-y-2">
        {leaderboard.map((entry, index) => {
          const level = getListenerLevel(entry.total_seconds);
          const isCurrentUser = currentUserId === entry.id;
          const isEmojiAvatar = entry.avatar_url && entry.avatar_url.length <= 4;

          return (
            <div
              key={entry.id}
             className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-xl border transition overflow-hidden ${getRankStyle(index)} ${
                isCurrentUser ? 'ring-2 ring-purple-500/50' : ''
              }`}
            >
              {/* Rank */}
              <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                {getRankIcon(index)}
              </div>

              {/* Avatar */}
              <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden bg-gradient-to-br ${level.color} border border-white/10`}>
                {isEmojiAvatar ? (
                  <span className="text-lg">{entry.avatar_url}</span>
                ) : entry.avatar_url ? (
                  <img src={entry.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm">👤</span>
                )}
              </div>

              {/* Name & Level */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`text-sm font-medium truncate ${
                    isCurrentUser ? 'text-purple-300' : 'text-white'
                  }`}>
                    {entry.nickname}
                  </span>
                  <span className="text-xs" title={level.title}>{level.badge}</span>
                </div>
                <p className="text-[10px] text-gray-500">{level.title}</p>
              </div>

              {/* Hours */}
<div className="flex-shrink-0 w-[65px]">
  <p className="text-xs sm:text-sm font-bold text-white whitespace-nowrap text-center">{formatHours(entry.total_seconds)}</p>
</div>
            </div>
          );
        })}
      </div>

      {/* Footer hint */}
      <div className="mt-4 pt-3 border-t border-white/5 text-center">
        <p className="text-[10px] text-gray-500">
          🎧 האזינו כדי לעלות בדירוג!
        </p>
      </div>
    </div>
  );
}
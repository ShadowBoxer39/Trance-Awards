// pages/track-of-the-week.tsx - FINAL STABLE VERSION

import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import supabase from '../lib/supabaseServer';
import Navigation from '../components/Navigation';
import SEO from '../components/SEO';

interface TrackSubmission {
  id: number;
  name: string;
  photo_url: string | null;
  track_title: string;
  youtube_url: string;
  description: string;
  created_at: string;
}

// NEW: Interface for comments
interface Comment {
  id: string;
  name: string;
  text: string;
  created_at: string;
}

interface Reaction {
  type: string;
  count: number;
}

interface TrackPageProps {
  track: TrackSubmission | null;
  error: string | null;
}

const getYouTubeVideoId = (url: string): string | null => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

// --- Main Component ---
export default function TrackOfTheWeekPage({ track, error }: TrackPageProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Use array state for reactions to ensure stability
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);

  const currentTrack = track;
  const videoId = track ? getYouTubeVideoId(track.youtube_url) : null;
  const isVideoAvailable = track && videoId;

  useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
    // Load name from local storage if exists
    const savedName = localStorage.getItem('track_commenter_name');
    if (savedName) setCommentName(savedName);
  }, []);
  
  // --- Comment Fetching Logic ---
  const fetchComments = () => {
    if (!currentTrack) return;
    fetch(`/api/track-comment-public?trackId=${currentTrack.id}`) 
      .then(res => res.json())
      .then(data => {
        if (data.comments) {
          setComments(data.comments);
        }
      })
      .catch(err => console.error('Failed to load comments:', err));
  };
  
  // --- Reaction Fetching Logic ---
  const fetchReactions = () => {
    if (!currentTrack) return;
    fetch(`/api/track-reaction?trackId=${currentTrack.id}`) 
      .then(res => res.json())
      .then(data => {
        if (data.reactions) {
          // Converts the flat object response (e.g., {fire: 5, cool: 1}) to an array [{type: 'fire', count: 5}]
          const reactionArray = Object.entries(data.reactions).map(([type, count]) => ({ type, count: count as number }));
          setReactions(reactionArray);
        }
      })
      .catch(err => console.error('Failed to load reactions:', err));
  };

  // Main Effect: Called on component mount and track change
  useEffect(() => {
    if (currentTrack) {
      fetchComments(); // Ensure comments are fetched
      fetchReactions();
      
      const userReaction = localStorage.getItem(`track_reaction_${currentTrack.id}`);
      if (userReaction) {
        setSelectedReaction(userReaction);
      }
    }
  }, [currentTrack]);


  // --- Comment Submission Logic ---
  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTrack || !commentName.trim() || !commentText.trim()) return;
    
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/track-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackId: currentTrack.id,
          comment: { // API expects 'comment' object wrapper
            name: commentName.trim(),
            text: commentText.trim(),
          }
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'שגיאה בשליחת התגובה');
      }

      // Success: Clear text and refetch data
      setCommentText('');
      localStorage.setItem('track_commenter_name', commentName.trim()); // Save name
      fetchComments(); 
      
    } catch (err: any) {
      setSubmitError(err.message || 'שגיאה לא ידועה בשליחה');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // --- Reaction Submission Logic ---
  const handleReaction = async (reaction: string) => {
    if (!currentTrack) return;
    
    const isRemoving = selectedReaction === reaction;
    const newReaction = isRemoving ? null : reaction;

    // Optimistic update (for faster UX)
    setSelectedReaction(newReaction);
    
    // Update local state array optimistically (only works if we use the object form, but for this file's state, we use array)
    setReactions(prev => {
        const index = prev.findIndex(r => r.type === reaction);
        if (index > -1) {
            const newArr = [...prev];
            newArr[index].count += isRemoving ? -1 : 1;
            return newArr;
        }
        return prev;
    });

    localStorage.setItem(`track_reaction_${currentTrack.id}`, newReaction || '');
    
    try {
      // POST the single reaction type
      await fetch('/api/track-reaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackId: currentTrack.id,
          reactionType: newReaction, // The API handles the increment
          // No need to send previousReaction if API handles atomic increment
        }),
      });
      // Final fetch to ensure data integrity
      fetchReactions(); 
    } catch (err) {
      // Revert if error occurs
      console.error("Error saving reaction:", err);
      setSelectedReaction(isRemoving ? reaction : null);
      localStorage.removeItem(`track_reaction_${currentTrack.id}`);
      alert('שגיאה בשליחת הריאקשן');
    }
  };

  const reactionMap = {
    '🔥': 'fire',
    '🤯': 'mind_blown',
    '😎': 'cool',
    '😐': 'not_feeling_it',
  };
  const emojiMap: Record<string, string> = {
    'fire': '🔥',
    'mind_blown': '🤯',
    'cool': '😎',
    'not_feeling_it': '😐',
  };
  

  if (error) {
    return (
      <div className="min-h-screen trance-backdrop text-white">
        <Navigation currentPage="track-of-the-week" />
        <main className="container mx-auto p-6 text-center pt-20">
          <h1 className="text-4xl font-bold text-red-500 mb-4">שגיאת טעינה</h1>
          <p className="text-gray-400">לא ניתן היה לטעון את הטראק השבועי. {error}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen trance-backdrop text-gray-100">
      <SEO 
        title="הטראק השבועי"
        description={track ? `הטראק השבועי של הקהילה: ${track.track_title} - נבחר על ידי ${track.name}` : "הטראק השבועי שנבחר על ידי קהילת הוואטסאפ שלנו."}
      />
      <Navigation currentPage="track-of-the-week" />

      <main className="max-w-7xl mx-auto px-6 pt-16 pb-16">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-semibold text-center text-gradient">
            🔥 הטראק השבועי של הקהילה
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mt-2">
            מדי שבוע - טראק חדש נבחר על ידי הקהילה!
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {isVideoAvailable ? (
            <div className="glass-card rounded-2xl p-6 md:p-10 shadow-2xl">
              
              {/* VIDEO EMBED */}
              <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden mb-8 shadow-2xl">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=0`}
                  title={track.track_title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>

              {/* TRACK TITLE AND ARTIST */}
              <div className="text-center mb-10">
                <h2 className="text-4xl md:text-5xl font-bold mb-2 text-white">
                  {track.track_title}
                </h2>
                <p className="text-xl text-green-400 font-medium">
                  {track.name}
                </p>
              </div>


              <div className="grid md:grid-cols-2 gap-8 items-start">
                
                {/* LEFT COLUMN: DESCRIPTION */}
                <div className="bg-black/20 rounded-xl p-6 border border-white/10">
                  <h3 className="text-2xl font-semibold mb-3 text-cyan-400">
                    למה הטראק הזה?
                  </h3>
                  <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-line">
                    {track.description}
                  </p>
                </div>
                
                {/* RIGHT COLUMN: SUBMITTER & CTA */}
                <div className="space-y-6">
                  
                  {/* Submitter Card */}
                  <div className="glass rounded-xl p-4 text-center">
                    <h4 className="text-sm font-medium text-white/60 mb-2">נבחר על ידי:</h4>
                    <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-purple-500/50 bg-gray-700 mx-auto mb-3">
                      {track.photo_url ? (
                        <img
                          src={track.photo_url}
                          alt={`Photo of ${track.name}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                             // Fallback to emoji if image fails
                             e.currentTarget.style.display = 'none';
                             const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                             if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl text-gray-500">
                          👤
                        </div>
                      )}
                    </div>
                    <p className="text-xl font-bold text-purple-400">{track.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(track.created_at).toLocaleDateString('he-IL')}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <a
                      href={track.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full btn-primary px-8 py-4 rounded-lg text-lg font-medium flex items-center justify-center gap-2"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      <span>האזינו ב־YouTube</span>
                    </a>
                    
                    <Link
                      href="/submit-track"
                      className="w-full btn-secondary px-8 py-4 rounded-lg text-lg font-medium text-center"
                    >
                      הגישו טראק משלכם!
                    </Link>
                  </div>
                </div>
                
              </div>
              
              {/* --- REACTIONS SECTION --- */}
              <div className="mt-10 pt-6 border-t border-white/10 text-center">
                <h3 className="text-2xl font-semibold mb-4 text-white">איך הטראק גרם לכם להרגיש?</h3>
                <div className="flex justify-center gap-4 flex-wrap">
                  {reactions.map(r => (
                    <button
                      key={r.type}
                      onClick={() => handleReaction(r.type)}
                      className={`glass rounded-full px-6 py-3 text-2xl transition-all border ${
                        selectedReaction === r.type 
                          ? 'border-purple-500 ring-2 ring-purple-500/50 scale-110' 
                          : 'border-white/10 hover:border-purple-500/50'
                      }`}
                    >
                      {emojiMap[r.type] || r.type}
                      <span className="text-sm ms-2 text-white/70">
                        ({r.count})
                      </span>
                    </button>
                  ))}
                  {/* Fallback buttons for types not yet in DB */}
                  {Object.keys(reactionMap).map(emoji => {
                      const type = reactionMap[emoji as keyof typeof reactionMap];
                      if (!reactions.find(r => r.type === type)) {
                          return (
                              <button
                                key={emoji}
                                onClick={() => handleReaction(type)}
                                disabled={!!selectedReaction}
                                className={`glass rounded-full px-6 py-3 text-2xl transition-all border ${
                                    selectedReaction ? 'opacity-50 border-gray-800' : 'border-white/10 hover:border-purple-500/50'
                                }`}
                              >
                                {emoji}
                                <span className="text-sm ms-2 text-white/70">(0)</span>
                              </button>
                          );
                      }
                      return null;
                  })}
                </div>
              </div>
              
              {/* --- COMMENTS SECTION --- */}
              <div className="mt-10 pt-6 border-t border-white/10">
                <h3 className="text-2xl font-semibold mb-6 text-white text-center">תגובות ({(comments || []).length})</h3>

                {/* Comment Submission Form */}
                <form onSubmit={submitComment} className="max-w-xl mx-auto space-y-4 mb-10">
                    <input
                      type="text"
                      placeholder="שם (יוצג לצד התגובה) *"
                      value={commentName}
                      onChange={(e) => setCommentName(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-gray-900/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60 transition"
                    />
                    <textarea
                      placeholder="התגובה שלכם..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      required
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60 transition resize-none"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting || !commentName.trim() || !commentText.trim()}
                      className="w-full btn-primary px-6 py-3 rounded-lg font-medium"
                    >
                      {isSubmitting ? 'שולח...' : 'שלח תגובה'}
                    </button>
                    {submitError && <p className="text-sm text-red-400 text-center">{submitError}</p>}
                </form>


                {/* Comments List */}
                <div className="space-y-4 max-w-xl mx-auto">
                  {(comments || []).map(comment => (
                    <div key={comment.id} className="bg-black/30 rounded-lg p-4 border border-white/10">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-semibold text-cyan-400">{comment.name}</p>
                        <p className="text-xs text-gray-500">
                            {new Date(comment.created_at).toLocaleDateString('he-IL')}
                        </p>
                      </div>
                      <p className="text-gray-300 leading-relaxed">{comment.text}</p>
                    </div>
                  ))}
                  {(comments || []).length === 0 && (
                      <p className="text-center text-gray-500 py-6">אין עדיין תגובות. היו הראשונים להגיב!</p>
                  )}
                </div>

              </div>

            </div>
          ) : (
            <div className="glass-card rounded-2xl p-12 text-center">
              <div className="text-6xl mb-6">🎵</div>
              <p className="text-2xl font-semibold text-gray-400 mb-4">
                אין עדיין טראק שבועי מאושר
              </p>
              <p className="text-lg text-gray-500 mb-8">
                אתם מוזמנים להגיש המלצה משלכם!
              </p>
              <Link
                href="/submit-track"
                className="btn-primary px-8 py-4 rounded-lg font-medium text-lg inline-block"
              >
                הגישו טראק עכשיו
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// --- Server-Side Fetching ---
export const getServerSideProps: GetServerSideProps<TrackPageProps> = async () => {
  try {
    const supabaseClient = require('../lib/supabaseServer').default;
    const { data, error } = await supabaseClient
      .from('track_of_the_week_submissions')
      .select('*')
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Supabase fetch error:', error);
      return {
        props: {
          track: null,
          error: `שגיאת מסד נתונים: ${error.message}`,
        },
      };
    }

    const track = data as TrackSubmission || null;

    return {
      props: {
        track: track,
        error: null,
      },
    };
  } catch (e: any) {
    console.error('getServerSideProps execution error:', e);
    return {
      props: {
        track: null,
        error: `שגיאה בשרת: ${e.message}`,
      },
    };
  }
};

// pages/track-of-the-week.tsx - FINAL STABLE DESIGN & FUNCTIONALITY

import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";
import Navigation from "../components/Navigation";
import SEO from "@/components/SEO";
import { GetServerSideProps } from 'next';
import supabase from '../lib/supabaseServer'; // Import needed for SSR data fetch

interface TrackOfWeek {
  id: number;
  name: string;
  photo_url: string | null;
  track_title: string;
  youtube_url: string;
  description: string;
  created_at: string;
  // NOTE: Assuming your SSR logic passes these basic fields
}

// NEW: Interface for comments (matching your DB structure)
interface Comment {
  id: string;
  name: string;
  text: string;
  created_at: string; // Timestamp from DB
}

// NEW: Interface for reactions (matching your simplified state)
interface ReactionState {
    '🔥': number;
    '🤯': number;
    '😎': number;
    '😐': number;
}


interface TrackPageProps {
  track: TrackOfWeek | null;
  error: string | null;
}


// Helper to extract YouTube video ID
function getYouTubeId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/g;
  const match = url.match(regex);
  return match ? match[1] : null;
}


// --- Main Component ---
export default function TrackOfTheWeekPage({ track, error }: TrackPageProps) {
  // Use simple reaction state matching the UI counts
  const [reactions, setReactions] = useState<ReactionState>({
    '🔥': 0,
    '🤯': 0,
    '😎': 0,
    '😐': 0,
  });
  
  const [comments, setComments] = useState<Comment[]>([]); // Array for comments
  const [newComment, setNewComment] = useState({ name: "", text: "" });
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null); // State for submission errors

  const currentTrack = track;


  useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
    // Load commenter name from local storage if exists
    const savedName = localStorage.getItem('track_commenter_name');
    if (savedName) setNewComment(prev => ({ ...prev, name: savedName }));
  }, []);


  // --- Data Fetching Functions ---

  const fetchComments = async () => {
    if (!currentTrack) return;
    try {
      // Use the public API for reading comments
      const res = await fetch(`/api/track-comment-public?trackId=${currentTrack.id}`);
      const data = await res.json();
      if (data.comments) {
        setComments(data.comments);
      }
    } catch (err) {
      console.error('Failed to load comments:', err);
    }
  };

  const fetchReactions = async () => {
    if (!currentTrack) return;
    try {
      // Use the reaction API
      const res = await fetch(`/api/track-reaction?trackId=${currentTrack.id}`);
      const data = await res.json();
      if (data.reactions) {
        // Assume API returns {fire: 5, cool: 1, ...} -> set as state
        setReactions(data.reactions);
      }
    } catch (err) {
      console.error('Failed to load reactions:', err);
    }
  };


  // --- Main Initialization Effect ---
  useEffect(() => {
    if (currentTrack) {
      fetchComments(); // FIX: Now fetches comments on load
      fetchReactions();
      
      // Load user's previous reaction
      const userReaction = localStorage.getItem(`track_reaction_${currentTrack.id}`);
      if (userReaction) {
        setSelectedReaction(userReaction);
      }
    }
  }, [currentTrack]);


  // --- Submission and Interaction Logic ---

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTrack || !newComment.name.trim() || !newComment.text.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // API expects a comment object inside the body (as seen in /api/track-comment.ts)
      const response = await fetch("/api/track-comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackId: currentTrack.id,
          comment: {
            name: newComment.name.trim(),
            text: newComment.text.trim(),
          }
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.error || "שגיאה בשליחת התגובה");
      }

      // Success: Clear text, save name, and reload comments
      setNewComment(prev => ({ ...prev, text: "" }));
      localStorage.setItem('track_commenter_name', newComment.name.trim()); 
      fetchComments(); // Synchronize state with DB

    } catch (error: any) {
      setSubmitError(error.message || "שגיאה לא ידועה בשליחה");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReaction = async (reactionType: keyof typeof reactions) => {
    if (!currentTrack) return;
    
    // Check if user already reacted
    const userReaction = localStorage.getItem(`track_reaction_${currentTrack.id}`);
    if (userReaction) {
      alert("כבר הגבתם לטראק הזה. אפשר להגיב רק פעם אחת!");
      return;
    }
    
    // Optimistic update
    setSelectedReaction(reactionType);
    setReactions(prev => ({ ...prev, [reactionType]: prev[reactionType] + 1 }));

    // Save to localStorage
    localStorage.setItem(`track_reaction_${currentTrack.id}`, reactionType);
    
    try {
      // POST the reaction type
      await fetch("/api/track-reaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackId: currentTrack.id,
          reactionType: reactionType,
        }),
      });
      // Final fetch to ensure data integrity
      fetchReactions(); 
    } catch (err) {
      console.error("Error saving reaction:", err);
      // Revert local changes on server error
      setSelectedReaction(null);
      setReactions(prev => ({ ...prev, [reactionType]: prev[reactionType] - 1 }));
      localStorage.removeItem(`track_reaction_${currentTrack.id}`);
      alert('שגיאה בשליחת הריאקשן');
    }
  };


  // --- UI Logic ---
  
  const reactionEmojis: { [key: string]: { emoji: string; label: string } } = {
    '🔥': { emoji: '🔥', label: 'אש' },
    '🤯': { emoji: '🤯', label: 'מפוצץ' },
    '😎': { emoji: '😎', label: 'סבבה' },
    '😐': { emoji: '😐', label: 'לא עפתי' },
  };

  // Maps UI labels to the simple key names used in the DB/state
  const uiReactionMap: Record<string, keyof ReactionState> = {
    '🔥': 'fire',
    '🤯': 'mind_blown',
    '😎': 'cool',
    '😐': 'not_feeling_it',
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
    <>
      <SEO
        title={`${currentTrack?.track_title || 'הטראק השבועי'} - הטראק השבועי`}
        description={currentTrack ? `מידי שבוע - טראק חדש נבחר: ${currentTrack.track_title}` : "הטראק השבועי שנבחר על ידי קהילת הוואטסאפ שלנו."}
        url="https://tracktrip.co.il/track-of-the-week"
      />
      <Head>
        <title>{currentTrack?.track_title || 'הטראק השבועי'} - הטראק השבועי של הקהילה</title>
      </Head>

      <div className="min-h-screen trance-backdrop text-gray-100">
        <Navigation currentPage="track-of-the-week" />

        {/* --- Start Page Content --- */}
        <div className="max-w-6xl mx-auto px-6 py-8 md:py-12">
        
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 mb-4">
              <span className="text-2xl">💧</span>
              <span className="text-sm font-medium text-purple-300">הטראק השבועי של הקהילה</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3">
                {currentTrack?.track_title}
            </h1>
            <p className="text-gray-400 text-lg md:text-xl">
              מידי שבוע - טראק חדש נבחר על ידי הקהילה!
            </p>
          </div>

          {currentTrack ? (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Video + Reactions + Comments */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* YouTube Player */}
                <div className="glass-card rounded-2xl overflow-hidden">
                  <div className="aspect-video bg-gray-900">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${getYouTubeId(currentTrack.youtube_url)}`}
                      title={currentTrack.track_title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>

                {/* Reactions Section */}
                <div className="glass-card rounded-2xl p-6">
                  <h3 className="text-lg font-bold mb-4 text-white/90">מה דעתכם על הטראק?</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {Object.entries(uiReactionMap).map(([emoji, type]) => (
                      <button
                        key={type}
                        onClick={() => handleReaction(type)}
                        disabled={!!selectedReaction && selectedReaction !== type}
                        className={`glass-card p-4 rounded-xl transition-all border ${
                          selectedReaction === type
                            ? "ring-2 ring-purple-500 scale-105 border-purple-500"
                            : selectedReaction
                            ? "opacity-50 border-gray-700 cursor-not-allowed"
                            : "hover:scale-105 hover:bg-purple-500/10 border-gray-700"
                        }`}
                      >
                        <div className="text-3xl mb-2">{emoji}</div>
                        <div className="text-xs text-gray-400 mb-1">
                           {reactionEmojis[emoji as keyof typeof reactionEmojis]?.label || type}
                        </div>
                        {/* Access count by the type key */}
                        <div className="text-lg font-bold text-purple-400">
                          {reactions[type] || 0}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comments Section */}
                <div className="glass-card rounded-2xl p-6">
                  <h3 className="text-lg font-bold mb-4 text-white/90">תגובות ({(comments || []).length})</h3>
                  
                  {/* Comment Form */}
                  <form onSubmit={handleCommentSubmit} className="mb-6">
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="השם שלך *"
                        value={newComment.name}
                        onChange={(e) => setNewComment({ ...newComment, name: e.target.value })}
                        className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                        maxLength={50}
                        required
                      />
                      <textarea
                        placeholder="מה דעתך על הטראק? *"
                        value={newComment.text}
                        onChange={(e) => setNewComment({ ...newComment, text: e.target.value })}
                        className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none min-h-[100px] resize-none"
                        maxLength={500}
                        required
                      />
                      <button
                        type="submit"
                        disabled={!newComment.name.trim() || !newComment.text.trim() || isSubmitting}
                        className="btn-primary px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? "שולח..." : "שלח תגובה"}
                      </button>
                    </div>
                  </form>

                  {/* Comments List */}
                  <div className="space-y-4">
                    {comments.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">אין תגובות עדיין. היו הראשונים!</p>
                    ) : (
                      comments.map((comment) => (
                        <div key={comment.id} className="bg-gray-900/30 rounded-lg p-4 relative group">
                          <div className="flex items-start justify-between mb-2">
                            <div className="font-semibold text-purple-400">{comment.name}</div>
                            <div className="flex items-center gap-2">
                              <div className="text-xs text-gray-500">
                                {new Date(comment.created_at).toLocaleDateString("he-IL")}
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-300">{comment.text}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Submitter Spotlight */}
              <div className="lg:col-span-1 space-y-6">
                <div className="glass-card rounded-2xl p-6 text-center border-4 border-purple-500/50">
                  <h3 className="text-xl font-bold mb-4">בחירת {currentTrack.name}</h3>
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-cyan-400/50 bg-gray-700 mx-auto mb-4">
                    {currentTrack.photo_url ? (
                      <img src={currentTrack.photo_url} alt={currentTrack.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl text-gray-500">👤</div>
                    )}
                  </div>
                  <p className="text-lg font-semibold text-white mb-2">{currentTrack.name}</p>
                  <p className="text-xs text-gray-500 mb-4">נבחר ב- {new Date(currentTrack.created_at).toLocaleDateString('he-IL')}</p>
                  <a
                    href={currentTrack.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full btn-primary px-6 py-3 rounded-lg font-medium inline-flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    <span>צפו ב-YouTube</span>
                  </a>
                </div>
                
                <div className="glass-card rounded-2xl p-6 text-center border-2 border-purple-500/20">
                  <h3 className="text-xl font-bold mb-2">שלחו טראק מומלץ!</h3>
                  <p className="text-sm text-gray-400 mb-4">הטראק שלכם יכול להיות הבחירה הבאה</p>
                  <Link href="/submit-track" className="btn-secondary px-6 py-3 rounded-lg font-medium inline-block">
                    הגישו טראק
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-12 text-center">
              <div className="text-6xl mb-6">🎵</div>
              <p className="text-2xl font-semibold text-gray-400 mb-4">
                אין עדיין טראק שבועי מאושר
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

        {/* Footer */}
        <footer className="border-t border-gray-800 mt-16">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="text-center">
              <p className="text-gray-400 text-sm">© 2025 יוצאים לטראק</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

// Server-side props to fetch the current Track of the Week
export const getServerSideProps: GetServerSideProps<TrackPageProps> = async () => {
  try {
    // This client is configured to use SUPABASE_SERVICE_ROLE_KEY (safe server-side)
    const supabaseClient = require('../lib/supabaseServer').default; 
    
    // Fetch the most recently approved track
    const { data, error } = await supabaseClient
      .from('track_of_the_week_submissions')
      .select('*')
      .eq('is_approved', true)
      .order('created_at', { ascending: false }) // Use created_at if approved_at isn't always set
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means "No rows found"
      console.error('Supabase fetch error:', error);
      return { props: { track: null, error: `שגיאת מסד נתונים: ${error.message}` } };
    }

    const track = data as TrackOfWeek || null;

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

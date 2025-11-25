// pages/track-of-the-week.tsx - WITH GOOGLE AUTH (FIXED - OAuth Callback Handling)
import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from '@supabase/supabase-js';
import Navigation from "../components/Navigation";
import SEO from "@/components/SEO";
import GoogleLoginButton from "../components/GoogleLoginButton";
import { getGoogleUserInfo } from "../lib/googleAuthHelpers";
import type { User } from '@supabase/supabase-js';

interface TrackOfWeek {
  id: number;
  name: string;
  photo_url: string | null;
  track_title: string;
  youtube_url: string;
  description: string;
  created_at: string;
  approved_at?: string;
  is_approved: boolean;
  reactions?: {
    fire: number;
    mind_blown: number;
    cool: number;
    not_feeling_it: number;
  };
  comments?: Array<{
    id: string;
    name: string;
    text: string;
    timestamp: string;
    user_photo_url?: string;
  }>;
}

// Helper to extract YouTube video ID
function getYouTubeId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export default function TrackOfTheWeekPage({
  currentTrack,
  pastTracks,
}: {
  currentTrack: TrackOfWeek | null;
  pastTracks: TrackOfWeek[];
}) {
  const [reactions, setReactions] = useState({
    fire: 0,
    mind_blown: 0,
    cool: 0,
    not_feeling_it: 0,
  });
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState({ text: "" });
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState('');
  const [userPhoto, setUserPhoto] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
    
    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // CRITICAL: Handle OAuth callback first
   const handleOAuthCallback = async () => {
  const url = window.location.href;
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const queryParams = new URLSearchParams(window.location.search);

  // Only try to exchange if we actually have an OAuth response
  if (hashParams.get('access_token') || queryParams.get('code')) {
    console.log('🔐 Handling OAuth callback...');

    // IMPORTANT: exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(url);

    if (error) {
      console.error('OAuth callback error:', error);
    } else {
      console.log('✅ OAuth callback successful:', data);
    }

    // Clean up URL (remove the code/access_token query params)
    window.history.replaceState({}, document.title, window.location.pathname);
  }
};

    // Check for authenticated user
    const checkUser = async () => {
      // First, handle any OAuth callback
      await handleOAuthCallback();
      
      // Then get the current session
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user ?? null;
      
      console.log('USER:', user);
      setUser(user);
      
      if (user) {
        const userInfo = getGoogleUserInfo(user);
        console.log('USER INFO:', userInfo);
        if (userInfo) {
          setUserName(userInfo.name);
          setUserPhoto(userInfo.photoUrl);
        }
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('🔄 Auth state changed:', _event, session?.user?.email);
      setUser(session?.user ?? null);
      if (session?.user) {
        const userInfo = getGoogleUserInfo(session.user);
        if (userInfo) {
          setUserName(userInfo.name);
          setUserPhoto(userInfo.photoUrl);
        }
      } else {
        setUserName('');
        setUserPhoto(null);
      }
    });
    
    if (currentTrack) {
      // Fetch reactions from API
      fetch(`/api/track-reaction?trackId=${currentTrack.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.reactions) {
            setReactions(data.reactions);
          }
        })
        .catch(err => console.error('Failed to load reactions:', err));

      // Fetch comments from API
      fetch(`/api/track-comment-public?trackId=${currentTrack.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.comments) {
            setComments(data.comments);
          }
        })
        .catch(err => console.error('Failed to load comments:', err));

      // Check if user already reacted (from localStorage)
      const userReaction = localStorage.getItem(`track_reaction_${currentTrack.id}`);
      if (userReaction) {
        setSelectedReaction(userReaction);
      }
    }

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [currentTrack]);

  const handleReaction = async (reactionType: keyof typeof reactions) => {
    if (!currentTrack || selectedReaction) return;

    // Optimistic update
    setSelectedReaction(reactionType);
    const newReactions = { ...reactions, [reactionType]: reactions[reactionType] + 1 };
    setReactions(newReactions);

    // Save to localStorage
    localStorage.setItem(`track_reaction_${currentTrack.id}`, reactionType);

    try {
      const response = await fetch("/api/track-reaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackId: currentTrack.id,
          reactionType,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save reaction");
      }

      const data = await response.json();
      if (data.reactions) {
        setReactions(data.reactions);
      }
    } catch (error) {
      console.error("Error saving reaction:", error);
      // Revert on error
      setSelectedReaction(null);
      setReactions(reactions);
      localStorage.removeItem(`track_reaction_${currentTrack.id}`);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('יש להתחבר כדי להוסיף תגובה');
      return;
    }
    
    if (!currentTrack || !newComment.text.trim() || isSubmitting) return;

    setIsSubmitting(true);

    const comment = {
      id: Date.now().toString(),
      name: userName,
      text: newComment.text.trim(),
      timestamp: new Date().toISOString(),
      user_id: user.id,
      user_photo_url: userPhoto,
    };

    try {
      const response = await fetch("/api/track-comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          track_id: currentTrack.id,
          name: userName,
          text: newComment.text.trim(),
          user_id: user.id,
          user_photo_url: userPhoto,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save comment");
      }

      const data = await response.json();
      setComments([data.comment, ...comments]);
      setNewComment({ text: "" });
    } catch (error) {
      console.error("Error saving comment:", error);
      alert("שגיאה בשמירת התגובה");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signOut();
    setUser(null);
    setUserName('');
    setUserPhoto(null);
  };

  const handleDeleteComment = async (commentId: string) => {
    const adminKey = prompt("הזן מפתח אדמין למחיקת התגובה:");
    
    if (!adminKey) return;

    try {
      const response = await fetch("/api/track-comment", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commentId,
          adminKey,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete comment");
      }

      // Remove comment from state
      setComments(comments.filter((c) => c.id !== commentId));
      alert("התגובה נמחקה בהצלחה");
    } catch (error: any) {
      console.error("Error deleting comment:", error);
      alert(error.message === "Unauthorized" ? "מפתח אדמין שגוי" : "שגיאה במחיקת התגובה");
    }
  };

  const reactionEmojis: { [key: string]: { emoji: string; label: string } } = {
    fire: { emoji: "🔥", label: "אש" },
    mind_blown: { emoji: "🤯", label: "מפוצץ את המוח" },
    cool: { emoji: "😎", label: "סבבה" },
    not_feeling_it: { emoji: "😐", label: "לא עפתי" },
  };

  if (!currentTrack) {
    return (
      <>
        <SEO
          title="הטראק השבועי של הקהילה"
          description="מידי שבוע, טראק חדש נבחר על ידי הקהילה שלנו"
          url="https://tracktrip.co.il/track-of-the-week"
        />
        <div className="trance-backdrop min-h-screen">
          <Navigation currentPage="track-of-the-week" />
          <div className="max-w-4xl mx-auto px-6 py-20 text-center">
            <h1 className="text-4xl font-bold mb-6">הטראק השבועי של הקהילה</h1>
            <p className="text-gray-400 mb-8">אין טראק פעיל כרגע. בקרו שוב בקרוב!</p>
            <Link href="/" className="btn-primary px-6 py-3 rounded-lg inline-block">
              חזרה לדף הבית
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title={`${currentTrack.track_title} - הטראק השבועי`}
        description={`מידי שבוע - טראק חדש נבחר: ${currentTrack.track_title}`}
        url="https://tracktrip.co.il/track-of-the-week"
      />
      <Head>
        <title>{currentTrack.track_title} - הטראק השבועי של הקהילה</title>
      </Head>

      <div className="trance-backdrop min-h-screen text-gray-100">
        <Navigation currentPage="track-of-the-week" />

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-purple-900/30 via-cyan-900/30 to-pink-900/30">
          <div className="absolute inset-0 bg-[url('/images/grid.svg')] opacity-10" />
          <div className="max-w-6xl mx-auto px-6 py-12 md:py-16 relative z-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 mb-4">
                <span className="text-2xl">💧</span>
                <span className="text-sm font-medium text-purple-300">הטראק השבועי של הקהילה</span>
              </div>
              
              <h1 className="text-3xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                {currentTrack.track_title}
              </h1>
              <p className="text-gray-400 text-sm md:text-base">מידי שבוע - טראק חדש נבחר על ידי הקהילה!</p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="max-w-6xl mx-auto px-6 py-8 md:py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Video + Reactions */}
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

              {/* Reactions */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4">מה דעתכם על הטראק?</h3>
                <div className="grid grid-cols-4 gap-3">
                  {Object.entries(reactionEmojis).map(([type, { emoji, label }]) => (
                    <button
                      key={type}
                      onClick={() => handleReaction(type as keyof typeof reactions)}
                      disabled={!!selectedReaction}
                      className={`glass-card p-4 rounded-xl transition-all ${
                        selectedReaction === type
                          ? "ring-2 ring-purple-500 scale-105"
                          : selectedReaction
                          ? "opacity-50"
                          : "hover:scale-105 hover:bg-purple-500/10"
                      }`}
                    >
                      <div className="text-3xl mb-2">{emoji}</div>
                      <div className="text-xs text-gray-400 mb-1">{label}</div>
                      <div className="text-lg font-bold text-purple-400">{reactions[type as keyof typeof reactions]}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Comments Section */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4">תגובות ({comments.length})</h3>
                
                {/* Authentication Section */}
                {!user ? (
                  <div className="mb-8 text-center bg-purple-500/10 rounded-xl p-6 border border-purple-500/30">
                    <p className="text-white mb-4 font-medium">התחברו כדי להוסיף תגובה</p>
                    <div className="flex justify-center">
                      <GoogleLoginButton />
                    </div>
                  </div>
                ) : (
                  <div className="mb-6">
                    {/* User Info & Logout */}
                    <div className="flex items-center justify-between mb-4 bg-purple-500/10 rounded-lg p-3 border border-purple-500/30">
                      <div className="flex items-center gap-3">
                        {userPhoto && (
                          <img 
                            src={userPhoto} 
                            alt={userName}
                            className="w-10 h-10 rounded-full border-2 border-purple-500"
                          />
                        )}
                        <span className="text-white font-medium">{userName}</span>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="text-purple-300 hover:text-purple-100 text-sm transition px-3 py-1 rounded bg-purple-500/20 hover:bg-purple-500/30"
                      >
                        התנתק
                      </button>
                    </div>

                    {/* Comment Form */}
                    <form onSubmit={handleCommentSubmit} className="space-y-3">
                      <textarea
                        placeholder="מה דעתך על הטראק?"
                        value={newComment.text}
                        onChange={(e) => setNewComment({ text: e.target.value })}
                        className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none min-h-[100px] resize-none"
                        maxLength={500}
                      />
                      <button
                        type="submit"
                        disabled={!newComment.text.trim() || isSubmitting}
                        className="btn-primary px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? "שולח..." : "שלח תגובה"}
                      </button>
                    </form>
                  </div>
                )}

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">אין תגובות עדיין. היו הראשונים!</p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="bg-gray-900/30 rounded-lg p-4 relative group">
                        <div className="flex items-start gap-3">
                          {comment.user_photo_url && (
                            <img 
                              src={comment.user_photo_url} 
                              alt={comment.name}
                              className="w-10 h-10 rounded-full border-2 border-purple-500 flex-shrink-0"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div className="font-semibold text-purple-400">{comment.name}</div>
                              <div className="flex items-center gap-2">
                                <div className="text-xs text-gray-500">
                                  {new Date(comment.timestamp).toLocaleDateString("he-IL")}
                                </div>
                                {/* Delete button - only visible on hover */}
                                <button
                                  onClick={() => handleDeleteComment(comment.id)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20"
                                  title="מחק תגובה (דרוש מפתח אדמין)"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                            <p className="text-gray-300">{comment.text}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Submitter Spotlight */}
            <div className="space-y-6">
              <div className="glass-card rounded-3xl p-8 border-4 border-purple-500/50 bg-gradient-to-br from-purple-500/20 via-transparent to-cyan-500/20 shadow-2xl shadow-purple-500/30">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 mb-4">
                    <span className="text-xl">✨</span>
                    <span className="text-sm font-bold text-white uppercase tracking-wider">
                      בחירת השבוע
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center mb-8">
                  <div className="w-40 h-40 rounded-full overflow-hidden border-8 border-purple-500 bg-gray-700 mb-6 ring-8 ring-purple-500/30 shadow-2xl shadow-purple-500/50 transform hover:scale-105 transition-transform">
                    {currentTrack.photo_url ? (
                      <img
                        src={currentTrack.photo_url}
                        alt={currentTrack.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl text-gray-500">
                        👤
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    {currentTrack.name}
                  </h3>
                  
                  <p className="text-purple-300 text-sm font-medium">
                    בחר את הטראק הזה בשבילכם
                  </p>
                </div>

                <div className="bg-black/40 rounded-2xl p-6 mb-8 border-2 border-purple-500/30 backdrop-blur-sm">
                  <h4 className="text-base font-bold text-purple-300 mb-3 flex items-center gap-2">
                    <span>💭</span>
                    למה הטראק הזה?
                  </h4>
                  <p className="text-gray-200 leading-relaxed text-base font-medium">
                    {currentTrack.description}
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      const text = `🎵 ${currentTrack.track_title}\nנבחר על ידי ${currentTrack.name}\nהטראק השבועי של קהילת יוצאים לטראק!\n${window.location.href}`;
                      if (navigator.share) {
                        navigator.share({ text });
                      } else {
                        navigator.clipboard.writeText(text);
                        alert("הקישור הועתק!");
                      }
                    }}
                    className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 px-4 py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all text-white"
                  >
                    <span className="text-xl">📤</span>
                    <span className="text-lg">שתפו את הבחירה של {currentTrack.name}</span>
                  </button>
                  <a
                    href={currentTrack.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full btn-secondary px-4 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                    <span className="text-lg">צפו ב-YouTube</span>
                  </a>
                </div>
              </div>

              <div className="glass-card rounded-2xl p-6 text-center bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border-2 border-purple-500/20">
                <span className="text-4xl mb-3 block">🎧</span>
                <h3 className="text-lg font-bold mb-2">יש לכם טראק מושלם?</h3>
                <p className="text-sm text-gray-400 mb-4">שלחו אותו והוא יכול להיות הבא!</p>
                <Link href="/submit-track" className="btn-primary px-6 py-3 rounded-lg inline-block font-medium">
                  הגישו טראק
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Previous Tracks Archive */}
        {pastTracks.length > 0 && (
          <section className="max-w-6xl mx-auto px-6 py-12">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold mb-2">הטראקים השבועיים הקודמים</h2>
              <p className="text-gray-400">גלו עוד טראקים מדהימים שהקהילה בחרה</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {pastTracks.slice(0, 8).map((track) => (
                <div
                  key={track.id}
                  className="glass-card rounded-xl overflow-hidden hover:scale-105 transition-transform group cursor-pointer"
                >
                  <div className="aspect-video bg-gray-900 relative">
                    <img
                      src={`https://img.youtube.com/vi/${getYouTubeId(track.youtube_url)}/maxresdefault.jpg`}
                      alt={track.track_title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = `https://img.youtube.com/vi/${getYouTubeId(
                          track.youtube_url
                        )}/hqdefault.jpg`;
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-white line-clamp-2 mb-2">{track.track_title}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-6 h-6 rounded-full bg-gray-700 overflow-hidden flex-shrink-0">
                        {track.photo_url ? (
                          <img src={track.photo_url} alt={track.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs">👤</div>
                        )}
                      </div>
                      <span className="truncate">{track.name}</span>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      {new Date(track.approved_at || track.created_at).toLocaleDateString("he-IL")}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {pastTracks.length > 8 && (
              <div className="text-center mt-8">
                <button className="btn-secondary px-8 py-3 rounded-lg font-medium">
                  הצג עוד טראקים
                </button>
              </div>
            )}
          </section>
        )}

        <footer className="border-t border-gray-800 mt-16">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="text-center">
              <Link href="/" className="text-gray-400 hover:text-gray-300 transition">
                חזרה לדף הבית
              </Link>
              <div className="text-sm text-gray-500 mt-4">© 2025 יוצאים לטראק</div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

// Server-side props
export async function getServerSideProps() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn("⚠️ Supabase env vars not configured");
    return {
      props: {
        currentTrack: null,
        pastTracks: [],
      },
    };
  }

  try {
    const { createClient } = require("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data: currentTrack, error: currentError } = await supabase
      .from("track_of_the_week_submissions")
      .select("*")
      .eq("is_approved", true)
      .order("approved_at", { ascending: false })
      .limit(1)
      .single();

    if (currentError) {
      console.error("Current track error:", currentError);
    }

    const { data: pastTracks, error: pastError } = await supabase
      .from("track_of_the_week_submissions")
      .select("*")
      .eq("is_approved", true)
      .order("approved_at", { ascending: false })
      .range(1, 12);

    if (pastError) {
      console.error("Past tracks error:", pastError);
    }

    return {
      props: {
        currentTrack: currentTrack || null,
        pastTracks: pastTracks || [],
      },
    };
  } catch (error: any) {
    console.error("❌ Error fetching track data:", error);
    return {
      props: {
        currentTrack: null,
        pastTracks: [],
      },
    };
  }
}

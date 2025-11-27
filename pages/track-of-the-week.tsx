// pages/track-of-the-week.tsx - REDESIGNED with Featured Artist aesthetic
import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from '@supabase/supabase-js';
import Navigation from "../components/Navigation";
import SEO from "@/components/SEO";
import GoogleLoginButton from "../components/GoogleLoginButton";
import { getGoogleUserInfo } from "../lib/googleAuthHelpers";
import type { User } from '@supabase/supabase-js';
import { FaFire, FaHeart, FaPlay } from 'react-icons/fa';
import { GiSunglasses } from 'react-icons/gi';
import { BsEmojiDizzy } from 'react-icons/bs';

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
  const [scrollY, setScrollY] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
    
    // Parallax scroll effect
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    
    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Handle OAuth callback
    const handleOAuthCallback = async () => {
      const url = window.location.href;
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const queryParams = new URLSearchParams(window.location.search);

      if (hashParams.get('access_token') || queryParams.get('code')) {
        console.log('🔐 Handling OAuth callback...');
        const { data, error } = await supabase.auth.exchangeCodeForSession(url);
        if (error) {
          console.error('OAuth callback error:', error);
        } else {
          console.log('✅ OAuth callback successful:', data);
        }
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    // Check for authenticated user
    const checkUser = async () => {
      await handleOAuthCallback();
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user ?? null;
      
      setUser(user);
      if (user) {
        const userInfo = getGoogleUserInfo(user);
        if (userInfo) {
          setUserName(userInfo.name);
          setUserPhoto(userInfo.photoUrl);
        }
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
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
      // Fetch reactions
      fetch(`/api/track-reaction?trackId=${currentTrack.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.reactions) {
            setReactions(data.reactions);
          }
        })
        .catch(err => console.error('Failed to load reactions:', err));

      // Fetch comments
      fetch(`/api/track-comment-public?trackId=${currentTrack.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.comments) {
            setComments(data.comments);
          }
        })
        .catch(err => console.error('Failed to load comments:', err));

      // Check if user already reacted
      const userReaction = localStorage.getItem(`track_reaction_${currentTrack.id}`);
      if (userReaction) {
        setSelectedReaction(userReaction);
      }
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      authListener.subscription.unsubscribe();
    };
  }, [currentTrack]);

  const handleReaction = async (reactionType: keyof typeof reactions) => {
    if (!currentTrack || selectedReaction) return;

    setSelectedReaction(reactionType);
    const newReactions = { ...reactions, [reactionType]: reactions[reactionType] + 1 };
    setReactions(newReactions);
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

      if (!response.ok) throw new Error("Failed to save reaction");
      const data = await response.json();
      if (data.reactions) {
        setReactions(data.reactions);
      }
    } catch (error) {
      console.error("Error saving reaction:", error);
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

      if (!response.ok) throw new Error("Failed to save comment");

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
        body: JSON.stringify({ commentId, adminKey }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete comment");
      }

      setComments(comments.filter((c) => c.id !== commentId));
      alert("התגובה נמחקה בהצלחה");
    } catch (error: any) {
      console.error("Error deleting comment:", error);
      alert(error.message === "Unauthorized" ? "מפתח אדמין שגוי" : "שגיאה במחיקת התגובה");
    }
  };

  const handlePlayClick = () => {
    setIsPlaying(true);
    const videoPlayer = document.getElementById('video-player');
    if (videoPlayer) {
      videoPlayer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  if (!currentTrack) {
    return (
      <>
        <SEO
          title="הטראק השבועי של הקהילה"
          description="מידי שבוע, טראק חדש נבחר על ידי הקהילה שלנו"
          url="https://tracktrip.co.il/track-of-the-week"
        />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
          <Navigation currentPage="track-of-the-week" />
          <div className="max-w-4xl mx-auto px-6 py-20 text-center">
            <h1 className="text-4xl font-bold mb-6 text-white">הטראק השבועי של הקהילה</h1>
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

      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        
        .glass-card {
          background: rgba(17, 24, 39, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(139, 92, 246, 0.2);
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white relative overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-600/30 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />
        </div>

        <Navigation currentPage="track-of-the-week" />

        {/* Hero Section with Vinyl Record */}
        <section className="relative z-10 max-w-7xl mx-auto px-6 py-12 md:py-20">
          {/* Badge */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 backdrop-blur-sm">
              <span className="text-2xl">💧</span>
              <span className="font-bold text-purple-300">הטראק השבועי של הקהילה</span>
            </div>
          </div>

          {/* Spinning Vinyl with Submitter Photo */}
          <div 
            className="relative mx-auto mb-12"
            style={{ 
              transform: `translateY(${scrollY * 0.3}px)`,
              maxWidth: '500px'
            }}
          >
            <div className="relative w-72 h-72 md:w-80 md:h-80 mx-auto group">
              {/* Vinyl Record */}
              <div className="absolute inset-0 rounded-full bg-black border-8 border-gray-800 shadow-2xl animate-spin-slow group-hover:animate-spin">
                {/* Grooves */}
                <div className="absolute inset-4 rounded-full border-2 border-gray-700 opacity-30" />
                <div className="absolute inset-8 rounded-full border-2 border-gray-700 opacity-30" />
                <div className="absolute inset-12 rounded-full border-2 border-gray-700 opacity-30" />
                
                {/* Center Label with Submitter Photo */}
                <div className="absolute inset-20 rounded-full overflow-hidden border-4 border-cyan-500 shadow-2xl shadow-cyan-500/50">
                  {currentTrack.photo_url ? (
                    <img 
                      src={currentTrack.photo_url} 
                      alt={currentTrack.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-5xl">
                      👤
                    </div>
                  )}
                </div>
              </div>

              {/* Glow effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-600 to-purple-600 blur-3xl opacity-30 group-hover:opacity-50 transition-opacity" />
              
              {/* Play button overlay */}
              <button
                onClick={handlePlayClick}
                className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${isPlaying ? 'opacity-100' : ''}`}
              >
                <div className="w-20 h-20 rounded-full bg-cyan-600 hover:bg-cyan-500 flex items-center justify-center shadow-lg transition-all hover:scale-110">
                  <FaPlay className="text-white text-2xl ml-1" />
                </div>
              </button>
            </div>
          </div>

          {/* Track Title */}
          <div className="text-center mb-8 animate-float">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight">
              {currentTrack.track_title}
            </h1>
            <p className="text-xl text-gray-300 mb-2">נבחר על ידי</p>
            <p className="text-2xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text">
              {currentTrack.name}
            </p>
          </div>

          {/* Submitter's Message */}
          <div className="max-w-2xl mx-auto glass-card rounded-3xl p-8 mb-12 border-2 border-purple-500/30">
            <h3 className="text-lg font-bold text-purple-300 mb-4 flex items-center gap-2 justify-center">
              <span>💭</span>
              <span>למה הטראק הזה?</span>
            </h3>
            <p className="text-gray-200 leading-relaxed text-center text-lg">
              {currentTrack.description}
            </p>
          </div>
        </section>

        {/* Video Player & Reactions */}
        <section className="relative z-10 max-w-7xl mx-auto px-6 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left - Video */}
            <div className="lg:col-span-2">
              <div id="video-player" className="glass-card rounded-2xl overflow-hidden mb-8 border-2 border-purple-500/30">
                <div className="aspect-video bg-black">
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
              <div className="glass-card rounded-2xl p-6 mb-8 border-2 border-purple-500/30">
                <h3 className="text-xl font-bold mb-6 text-center">איך הטראק? 🎧</h3>
                <div className="grid grid-cols-4 gap-4">
                  <button
                    onClick={() => handleReaction('fire')}
                    disabled={!!selectedReaction}
                    className={`glass-card p-6 rounded-2xl transition-all group hover:scale-105 ${
                      selectedReaction === 'fire'
                        ? 'ring-4 ring-orange-500 scale-105 bg-orange-500/20'
                        : selectedReaction
                        ? 'opacity-40'
                        : 'hover:bg-orange-500/10'
                    }`}
                  >
                    <div className="text-4xl mb-3 group-hover:scale-125 transition-transform"><FaFire className="mx-auto text-orange-500" /></div>
                    <div className="text-xs text-gray-400 mb-2">אש</div>
                    <div className="text-2xl font-bold text-orange-400">{reactions.fire}</div>
                  </button>

                  <button
                    onClick={() => handleReaction('mind_blown')}
                    disabled={!!selectedReaction}
                    className={`glass-card p-6 rounded-2xl transition-all group hover:scale-105 ${
                      selectedReaction === 'mind_blown'
                        ? 'ring-4 ring-yellow-500 scale-105 bg-yellow-500/20'
                        : selectedReaction
                        ? 'opacity-40'
                        : 'hover:bg-yellow-500/10'
                    }`}
                  >
                    <div className="text-4xl mb-3 group-hover:scale-125 transition-transform"><BsEmojiDizzy className="mx-auto text-yellow-500" /></div>
                    <div className="text-xs text-gray-400 mb-2">מפוצץ</div>
                    <div className="text-2xl font-bold text-yellow-400">{reactions.mind_blown}</div>
                  </button>

                  <button
                    onClick={() => handleReaction('cool')}
                    disabled={!!selectedReaction}
                    className={`glass-card p-6 rounded-2xl transition-all group hover:scale-105 ${
                      selectedReaction === 'cool'
                        ? 'ring-4 ring-cyan-500 scale-105 bg-cyan-500/20'
                        : selectedReaction
                        ? 'opacity-40'
                        : 'hover:bg-cyan-500/10'
                    }`}
                  >
                    <div className="text-4xl mb-3 group-hover:scale-125 transition-transform"><GiSunglasses className="mx-auto text-cyan-500" /></div>
                    <div className="text-xs text-gray-400 mb-2">סבבה</div>
                    <div className="text-2xl font-bold text-cyan-400">{reactions.cool}</div>
                  </button>

                  <button
                    onClick={() => handleReaction('not_feeling_it')}
                    disabled={!!selectedReaction}
                    className={`glass-card p-6 rounded-2xl transition-all group hover:scale-105 ${
                      selectedReaction === 'not_feeling_it'
                        ? 'ring-4 ring-gray-500 scale-105 bg-gray-500/20'
                        : selectedReaction
                        ? 'opacity-40'
                        : 'hover:bg-gray-500/10'
                    }`}
                  >
                    <div className="text-4xl mb-3 group-hover:scale-125 transition-transform">😐</div>
                    <div className="text-xs text-gray-400 mb-2">לא עפתי</div>
                    <div className="text-2xl font-bold text-gray-400">{reactions.not_feeling_it}</div>
                  </button>
                </div>
              </div>

              {/* Comments */}
              <div className="glass-card rounded-2xl p-6 border-2 border-purple-500/30" id="comments-section">
                <h3 className="text-xl font-bold mb-6">תגובות ({comments.length})</h3>
                
                {!user ? (
                  <div className="mb-8 text-center bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-2xl p-8 border-2 border-purple-500/30">
                    <div className="text-4xl mb-4">🔐</div>
                    <p className="text-white mb-6 font-bold text-lg">התחברו כדי להוסיף תגובה</p>
                    <GoogleLoginButton />
                  </div>
                ) : (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4 glass-card rounded-xl p-4 border border-purple-500/30">
                      <div className="flex items-center gap-3">
                        {userPhoto && (
                          <img 
                            src={userPhoto} 
                            alt={userName}
                            className="w-12 h-12 rounded-full border-2 border-purple-500"
                          />
                        )}
                        <span className="text-white font-bold">{userName}</span>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="text-sm px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-100 transition border border-red-500/30"
                      >
                        התנתק
                      </button>
                    </div>

                    <form onSubmit={handleCommentSubmit} className="space-y-4">
                      <textarea
                        placeholder="מה דעתך על הטראק?"
                        value={newComment.text}
                        onChange={(e) => setNewComment({ text: e.target.value })}
                        className="w-full glass-card border-2 border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none min-h-[120px] resize-none"
                        maxLength={500}
                      />
                      <button
                        type="submit"
                        disabled={!newComment.text.trim() || isSubmitting}
                        className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 px-6 py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                      >
                        {isSubmitting ? "שולח..." : "שלח תגובה ✨"}
                      </button>
                    </form>
                  </div>
                )}

                <div className="space-y-4 mt-6">
                  {comments.length === 0 ? (
                    <p className="text-gray-500 text-center py-12">אין תגובות עדיין. היו הראשונים! 🎵</p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="glass-card rounded-xl p-4 border border-purple-500/20 group hover:border-purple-500/40 transition-all">
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
                              <div className="font-bold text-purple-400">{comment.name}</div>
                              <div className="flex items-center gap-2">
                                <div className="text-xs text-gray-500">
                                  {new Date(comment.timestamp).toLocaleDateString("he-IL")}
                                </div>
                                <button
                                  onClick={() => handleDeleteComment(comment.id)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20"
                                  title="מחק תגובה"
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

            {/* Right - Actions */}
            <div className="space-y-6">
              <div className="glass-card rounded-2xl p-6 border-2 border-cyan-500/30 text-center">
                <div className="text-4xl mb-4">📤</div>
                <h3 className="text-lg font-bold mb-4">שתפו את הטראק!</h3>
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
                  className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 px-6 py-4 rounded-xl font-bold transition-all transform hover:scale-105"
                >
                  שתפו עם החברים 🎧
                </button>
              </div>

              <div className="glass-card rounded-2xl p-6 border-2 border-purple-500/30 text-center">
                <div className="text-4xl mb-4">🎵</div>
                <h3 className="text-lg font-bold mb-2">יש לכם טראק מושלם?</h3>
                <p className="text-sm text-gray-400 mb-4">שלחו אותו והוא יכול להיות הבא!</p>
                <Link href="/submit-track" className="block w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 px-6 py-4 rounded-xl font-bold transition-all transform hover:scale-105">
                  הגישו טראק ✨
                </Link>
              </div>

              <div className="glass-card rounded-2xl p-6 border-2 border-gray-700/30 text-center">
                <div className="text-4xl mb-4">📺</div>
                <a
                  href={currentTrack.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-red-600 hover:bg-red-500 px-6 py-4 rounded-xl font-bold transition-all transform hover:scale-105"
                >
                  צפו ב-YouTube
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Previous Tracks */}
        {pastTracks.length > 0 && (
          <section className="relative z-10 max-w-7xl mx-auto px-6 py-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                הטראקים השבועיים הקודמים
              </h2>
              <p className="text-gray-400">גלו עוד בחירות מדהימות מהקהילה</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {pastTracks.slice(0, 8).map((track) => (
                <div
                  key={track.id}
                  className="glass-card rounded-2xl overflow-hidden border-2 border-purple-500/20 hover:border-purple-500/50 transition-all group cursor-pointer transform hover:scale-105"
                >
                  <div className="relative aspect-video bg-black">
                    <img
                      src={`https://img.youtube.com/vi/${getYouTubeId(track.youtube_url)}/maxresdefault.jpg`}
                      alt={track.track_title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = `https://img.youtube.com/vi/${getYouTubeId(track.youtube_url)}/hqdefault.jpg`;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute inset-0 bg-purple-600/0 group-hover:bg-purple-600/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <FaPlay className="text-white text-4xl" />
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-white line-clamp-2 mb-3 group-hover:text-purple-300 transition-colors">
                      {track.track_title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 overflow-hidden flex-shrink-0">
                        {track.photo_url ? (
                          <img src={track.photo_url} alt={track.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sm">👤</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-400 truncate">{track.name}</p>
                        <p className="text-xs text-gray-600">
                          {new Date(track.approved_at || track.created_at).toLocaleDateString("he-IL")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <footer className="relative z-10 border-t border-gray-800 mt-16">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="text-center">
              <Link href="/" className="text-gray-400 hover:text-gray-300 transition">
                חזרה לדף הבית
              </Link>
              <div className="text-sm text-gray-600 mt-4">© 2025 יוצאים לטראק</div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

// Server-side props (unchanged)
export async function getServerSideProps() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
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

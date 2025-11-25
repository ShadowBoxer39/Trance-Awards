// pages/featured-artist.tsx - WITH GOOGLE AUTH
import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from '@supabase/supabase-js';
import Navigation from "../components/Navigation";
import SEO from "@/components/SEO";
import GoogleLoginButton from "../components/GoogleLoginButton";
import { getGoogleUserInfo } from "../lib/googleAuthHelpers";
import type { User } from '@supabase/supabase-js';

interface FeaturedArtist {
  id: number;
  stage_name: string;
  full_name: string;
  bio: string;
  photo_url: string;
  genre: string;
  instagram_url?: string;
  facebook_url?: string;
  soundcloud_url?: string;
  spotify_url?: string;
  youtube_url?: string;
  featured_at: string;
  reactions?: {
    fire: number;
    mind_blown: number;
    cool: number;
    heart: number;
  };
  comments?: Array<{
    id: string;
    name: string;
    text: string;
    timestamp: string;
    user_photo_url?: string;
  }>;
}

export default function FeaturedArtistPage({
  artist,
}: {
  artist: FeaturedArtist | null;
}) {
  const [reactions, setReactions] = useState({
    fire: 0,
    mind_blown: 0,
    cool: 0,
    heart: 0,
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
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const queryParams = new URLSearchParams(window.location.search);
      
      if (hashParams.get('access_token') || queryParams.get('code')) {
        console.log('🔐 Handling OAuth callback...');
        
        const { data, error } = await supabase.auth.getSession();
        
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

    if (artist) {
      // Fetch reactions
      fetch(`/api/artist-reaction?artistId=${artist.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.reactions) {
            setReactions(data.reactions);
          }
        })
        .catch(err => console.error('Failed to load reactions:', err));

      // Fetch comments
      fetch(`/api/artist-comment-public?artistId=${artist.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.comments) {
            setComments(data.comments);
          }
        })
        .catch(err => console.error('Failed to load comments:', err));

      // Check if user already reacted
      const userReaction = localStorage.getItem(`artist_reaction_${artist.id}`);
      if (userReaction) {
        setSelectedReaction(userReaction);
      }
    }

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [artist]);

  const handleReaction = async (reactionType: keyof typeof reactions) => {
    if (!artist || selectedReaction) return;

    setSelectedReaction(reactionType);
    const newReactions = { ...reactions, [reactionType]: reactions[reactionType] + 1 };
    setReactions(newReactions);

    localStorage.setItem(`artist_reaction_${artist.id}`, reactionType);

    try {
      const response = await fetch("/api/artist-reaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artistId: artist.id,
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
      setSelectedReaction(null);
      setReactions(reactions);
      localStorage.removeItem(`artist_reaction_${artist.id}`);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('יש להתחבר כדי להוסיף תגובה');
      return;
    }
    
    if (!artist || !newComment.text.trim() || isSubmitting) return;

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
      const response = await fetch("/api/artist-comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artist_id: artist.id,
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
      const response = await fetch("/api/artist-comment", {
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
    heart: { emoji: "❤️", label: "אהבה" },
  };

  if (!artist) {
    return (
      <>
        <SEO
          title="האמן המומלץ"
          description="גלו אמנים צעירים מוכשרים בסצנת הטראנס הישראלית"
          url="https://tracktrip.co.il/featured-artist"
        />
        <div className="trance-backdrop min-h-screen">
          <Navigation currentPage="young-artists" />
          <div className="max-w-4xl mx-auto px-6 py-20 text-center">
            <h1 className="text-4xl font-bold mb-6">האמן המומלץ</h1>
            <p className="text-gray-400 mb-8">אין אמן מומלץ כרגע. בקרו שוב בקרוב!</p>
            <Link href="/young-artists" className="btn-primary px-6 py-3 rounded-lg inline-block">
              לדף אמנים צעירים
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title={`${artist.stage_name} - האמן המומלץ`}
        description={`הכירו את ${artist.stage_name} - ${artist.bio.substring(0, 150)}`}
        url="https://tracktrip.co.il/featured-artist"
      />
      <Head>
        <title>{artist.stage_name} - האמן שאתם צריכים להכיר</title>
      </Head>

      <div className="trance-backdrop min-h-screen text-gray-100">
        <Navigation currentPage="young-artists" />

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-purple-900/30 via-cyan-900/30 to-pink-900/30">
          <div className="absolute inset-0 bg-[url('/images/grid.svg')] opacity-10" />
          <div className="max-w-6xl mx-auto px-6 py-12 md:py-16 relative z-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 mb-4">
                <span className="text-2xl">⭐</span>
                <span className="text-sm font-medium text-purple-300">האמן שאתם חייבים להכיר</span>
              </div>
              
              <h1 className="text-3xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                {artist.stage_name}
              </h1>
              <p className="text-gray-400 text-sm md:text-base">{artist.genre}</p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="max-w-6xl mx-auto px-6 py-8 md:py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Artist Info & Reactions */}
            <div className="lg:col-span-2 space-y-6">
              {/* Artist Photo & Bio */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex flex-col md:flex-row gap-6 mb-6">
                  <div className="w-48 h-48 rounded-xl overflow-hidden bg-gray-800 mx-auto md:mx-0 flex-shrink-0">
                    {artist.photo_url ? (
                      <img
                        src={artist.photo_url}
                        alt={artist.stage_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl text-gray-600">
                        🎵
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">{artist.full_name}</h2>
                    <p className="text-gray-300 leading-relaxed">{artist.bio}</p>
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex flex-wrap gap-3">
                  {artist.instagram_url && (
                    <a
                      href={artist.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      <span>📸</span> Instagram
                    </a>
                  )}
                  {artist.facebook_url && (
                    <a
                      href={artist.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      <span>👥</span> Facebook
                    </a>
                  )}
                  {artist.soundcloud_url && (
                    <a
                      href={artist.soundcloud_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      <span>🎧</span> SoundCloud
                    </a>
                  )}
                  {artist.spotify_url && (
                    <a
                      href={artist.spotify_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      <span>🎵</span> Spotify
                    </a>
                  )}
                  {artist.youtube_url && (
                    <a
                      href={artist.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      <span>📺</span> YouTube
                    </a>
                  )}
                </div>
              </div>

              {/* Reactions */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4">מה דעתכם על האמן?</h3>
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
                        placeholder="מה דעתך על האמן?"
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

            {/* Right Column - Call to Action */}
            <div className="space-y-6">
              <div className="glass-card rounded-2xl p-6 text-center bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border-2 border-purple-500/20">
                <span className="text-4xl mb-3 block">🎤</span>
                <h3 className="text-lg font-bold mb-2">אתם אמנים צעירים?</h3>
                <p className="text-sm text-gray-400 mb-4">הצטרפו לתוכנית והופיעו בפודקאסט!</p>
                <Link href="/young-artists" className="btn-primary px-6 py-3 rounded-lg inline-block font-medium">
                  לדף אמנים צעירים
                </Link>
              </div>
            </div>
          </div>
        </section>

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
        artist: null,
      },
    };
  }

  try {
    const { createClient } = require("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Fetch the most recently featured artist
    const { data: artist, error } = await supabase
      .from("featured_artists")
      .select("*")
      .order("featured_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error("Featured artist error:", error);
    }

    return {
      props: {
        artist: artist || null,
      },
    };
  } catch (error: any) {
    console.error("❌ Error fetching featured artist:", error);
    return {
      props: {
        artist: null,
      },
    };
  }
}

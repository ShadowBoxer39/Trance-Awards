// pages/artist/[slug].tsx
import { GetServerSideProps } from 'next';
import { createClient } from "@supabase/supabase-js";
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import GoogleLoginButton from '@/components/GoogleLoginButton';
import { FaInstagram, FaSoundcloud, FaSpotify, FaFire, FaHeart, FaPlay, FaArrowRight } from 'react-icons/fa';
import { GiSunglasses } from 'react-icons/gi';
import { BsEmojiDizzy } from 'react-icons/bs';

interface FeaturedArtist {
  id: number;
  artist_id: string;
  name: string;
  stage_name: string;
  bio: string;
  profile_photo_url: string;
  soundcloud_track_url: string;
  instagram_url?: string;
  soundcloud_profile_url?: string;
  spotify_url?: string;
  featured_at: string;
}

interface Comment {
  id: number | string;
  user_id: string;
  content?: string;
  text?: string;
  name?: string;
  created_at?: string;
  timestamp?: string;
  user_photo_url?: string;
  profiles?: {
    display_name: string;
  } | null;
}

interface PageProps {
  artist: FeaturedArtist | null;
  otherArtists: FeaturedArtist[];
  isCurrentFeatured: boolean;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ArtistPage({ artist, otherArtists, isCurrentFeatured }: PageProps) {
  const [user, setUser] = useState<any>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [reactions, setReactions] = useState<{ [key: string]: number }>({
    fire: 0,
    cool: 0,
    heart: 0,
    mind_blown: 0
  });
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userName, setUserName] = useState('');
  const [userPhoto, setUserPhoto] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const url = window.location.href;
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const queryParams = new URLSearchParams(window.location.search);

      if (hashParams.get('access_token') || queryParams.get('code')) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(url);
        
        if (!error) {
          const scrollToComments = () => {
            const commentsSection = document.getElementById('comments-section');
            if (commentsSection) {
              commentsSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
              setTimeout(scrollToComments, 300);
            }
          };
          setTimeout(scrollToComments, 1000);
        }
        
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    const checkUser = async () => {
      await handleOAuthCallback();
      
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user ?? null;
      
      setUser(user);
      
      if (user) {
        const { getGoogleUserInfo } = await import('../../lib/googleAuthHelpers');
        const userInfo = getGoogleUserInfo(user);
        if (userInfo) {
          setUserName(userInfo.name);
          setUserPhoto(userInfo.photoUrl);
        }
      }
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { getGoogleUserInfo } = await import('../../lib/googleAuthHelpers');
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
      fetchComments();
      fetchReactions();
      
      const userReaction = localStorage.getItem(`artist_reaction_${artist.artist_id}`);
      if (userReaction) {
        setUserReaction(userReaction);
      }
    }

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [artist]);

  const handleReaction = async (reactionType: string) => {
    if (!artist || userReaction) return;

    setUserReaction(reactionType);
    const newReactions = { ...reactions, [reactionType]: reactions[reactionType] + 1 };
    setReactions(newReactions);

    localStorage.setItem(`artist_reaction_${artist.artist_id}`, reactionType);

    try {
      const response = await fetch("/api/artist-reaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artistId: artist.artist_id,
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
      setUserReaction(null);
      setReactions(reactions);
      localStorage.removeItem(`artist_reaction_${artist.artist_id}`);
    }
  };

  const fetchComments = async () => {
    if (!artist) return;

    try {
      const response = await fetch(`/api/artist-comments-public?artistId=${artist.artist_id}`);
      const data = await response.json();
      if (data.comments) {
        setComments(data.comments);
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const fetchReactions = async () => {
    if (!artist) return;

    try {
      const response = await fetch(`/api/artist-reaction?artistId=${artist.artist_id}`);
      const data = await response.json();
      if (data.reactions) {
        setReactions(data.reactions);
      }
    } catch (error) {
      console.error('Failed to load reactions:', error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('יש להתחבר כדי להוסיף תגובה');
      return;
    }
    
    if (!artist || !newComment.trim() || submitting) return;

    setSubmitting(true);

    try {
      const response = await fetch("/api/artist-comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artist_id: artist.artist_id,
          name: userName,
          text: newComment.trim(),
          user_id: user.id,
          user_photo_url: userPhoto,
        }),
      });

      if (!response.ok) throw new Error("Failed to save comment");

      const data = await response.json();
      setComments([data.comment, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error("Error saving comment:", error);
      alert("שגיאה בשמירת התגובה");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
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

      setComments(comments.filter((c) => c.id.toString() !== commentId));
      alert("התגובה נמחקה בהצלחה");
    } catch (error: any) {
      console.error("Error deleting comment:", error);
      alert(error.message === "Unauthorized" ? "מפתח אדמין שגוי" : "שגיאה במחיקת התגובה");
    }
  };

  const reactionButtons = [
    { type: 'fire', icon: FaFire, emoji: '🔥', label: 'אש', color: 'from-orange-500 to-red-500', glow: 'shadow-orange-500/50' },
    { type: 'cool', icon: GiSunglasses, emoji: '😎', label: 'וואלה סבבה', color: 'from-blue-500 to-cyan-500', glow: 'shadow-blue-500/50' },
    { type: 'heart', icon: FaHeart, emoji: '❤️', label: 'אהבתי', color: 'from-pink-500 to-red-500', glow: 'shadow-pink-500/50' },
    { type: 'mind_blown', icon: BsEmojiDizzy, emoji: '🤯', label: 'מפוצץ את המוח', color: 'from-purple-500 to-pink-500', glow: 'shadow-purple-500/50' }
  ];

  if (!artist) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Navigation currentPage="featured-artist" />
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">אמן לא נמצא</h1>
          <p className="text-gray-400 mb-6">האמן שחיפשת לא קיים במערכת</p>
          <Link href="/featured-artist" className="btn-primary px-6 py-3 rounded-lg">
            לכל האמנים
          </Link>
        </div>
      </div>
    );
  }

  const featuredDate = new Date(artist.featured_at).toLocaleDateString('he-IL', {
    year: 'numeric',
    month: 'long'
  });

  return (
    <>
      <Head>
        <title>{artist.stage_name} | יוצאים לטראק</title>
        <meta name="description" content={`${artist.stage_name} - ${artist.bio.substring(0, 150)}...`} />
        <meta property="og:title" content={`${artist.stage_name} | יוצאים לטראק`} />
        <meta property="og:description" content={artist.bio.substring(0, 150)} />
        <meta property="og:image" content={artist.profile_photo_url} />
      </Head>

     <div dir="rtl" className="min-h-screen bg-black text-white relative">
        {/* Animated Background */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <Navigation currentPage="featured-artist" />

        {/* Back Button & Featured Badge */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 pt-24">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
            <Link 
              href="/featured-artist" 
              className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition"
            >
              <FaArrowRight className="text-sm" />
              <span>כל האמנים</span>
            </Link>
            
            {isCurrentFeatured && (
              <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 text-white text-sm font-bold px-6 py-2 rounded-full shadow-lg shadow-purple-500/50 animate-pulse">
                ⭐ האמן המומלץ הנוכחי ⭐
              </div>
            )}
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative min-h-[70vh] flex items-center justify-center px-4" style={{ transform: `translateY(${scrollY * 0.3}px)` }}>
          <div className="relative z-10 text-center max-w-5xl mx-auto">
            
            {/* Artist Photo */}
            <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto mb-8 group">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
              
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-gray-900 to-black border-4 border-gray-700" />
              
              <div className="absolute inset-8 rounded-full overflow-hidden border-4 border-purple-600 shadow-2xl shadow-purple-500/50 group-hover:scale-105 transition-transform duration-500">
                <img
                  src={artist.profile_photo_url}
                  alt={artist.stage_name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div 
                onClick={() => {
                  setIsPlaying(true);
                  const musicPlayer = document.getElementById('music-player');
                  if (musicPlayer) {
                    musicPlayer.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }}
                className="absolute inset-0 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-2xl backdrop-blur-sm transform hover:scale-110 transition-transform">
                  <FaPlay className="text-black text-xl ml-1" />
                </div>
              </div>
            </div>

            {/* Artist Name */}
            <h1 className="text-5xl md:text-7xl font-black mb-4 relative">
              <span className="absolute inset-0 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent blur-sm opacity-50">
                {artist.stage_name}
              </span>
              <span className="relative bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                {artist.stage_name}
              </span>
            </h1>
            
            <p className="text-xl text-gray-400 mb-4 font-light tracking-wide">{artist.name}</p>
            
            <p className="text-sm text-purple-300 mb-8">
              הוצג ביוצאים לטראק • {featuredDate}
            </p>

            {/* Social Links */}
            <div className="flex justify-center gap-4 mb-12">
              {artist.instagram_url && (
                <a
                  href={artist.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative w-14 h-14"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl transform group-hover:rotate-180 transition-transform duration-500 shadow-lg shadow-purple-500/50" />
                  <div className="relative w-full h-full flex items-center justify-center">
                    <FaInstagram className="text-white text-xl relative z-10" />
                  </div>
                </a>
              )}
              {artist.soundcloud_profile_url && (
                <a
                  href={artist.soundcloud_profile_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative w-14 h-14"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl transform group-hover:rotate-180 transition-transform duration-500 shadow-lg shadow-orange-500/50" />
                  <div className="relative w-full h-full flex items-center justify-center">
                    <FaSoundcloud className="text-white text-xl relative z-10" />
                  </div>
                </a>
              )}
              {artist.spotify_url && (
                <a
                  href={artist.spotify_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative w-14 h-14"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl transform group-hover:rotate-180 transition-transform duration-500 shadow-lg shadow-green-500/50" />
                  <div className="relative w-full h-full flex items-center justify-center">
                    <FaSpotify className="text-white text-xl relative z-10" />
                  </div>
                </a>
              )}
            </div>

            {/* Scroll Indicator */}
            <div className="animate-bounce">
              <svg className="w-8 h-8 mx-auto text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 pb-20">
          
          {/* About Section */}
          <div className="mb-16">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 rounded-3xl blur-lg opacity-25 group-hover:opacity-50 transition duration-500" />
              <div className="relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl rounded-3xl p-12 border border-gray-800">
                <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  הכירו את {artist.stage_name}
                </h2>
                <p className="text-xl text-gray-300 leading-relaxed">{artist.bio}</p>
              </div>
            </div>
          </div>

          {/* Music Player */}
          <div id="music-player" className="mb-16">
            <div className="relative group">
              <div className={`absolute -inset-1 bg-gradient-to-r from-orange-600 to-pink-600 rounded-3xl blur-lg opacity-25 group-hover:opacity-50 transition duration-500 ${isPlaying ? 'animate-pulse' : ''}`} />
              <div className="relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl rounded-3xl p-8 border border-gray-800">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center ${isPlaying ? 'animate-pulse' : ''}`}>
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">שמעו את המוזיקה</h3>
                    <p className="text-gray-400">הטראק המומלץ {isPlaying && '🎵'}</p>
                  </div>
                </div>
                <iframe
                  width="100%"
                  height="166"
                  scrolling="no"
                  frameBorder="no"
                  allow="autoplay"
                  src={artist.soundcloud_track_url}
                  className="rounded-xl"
                  onLoad={() => setIsPlaying(false)}
                />
              </div>
            </div>
          </div>

          {/* Reactions */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              מה אתם חושבים?
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {reactionButtons.map(({ type, icon: Icon, emoji, label, color, glow }) => (
                <button
                  key={type}
                  onClick={() => handleReaction(type)}
                  disabled={!!userReaction}
                  className={`relative group ${
                    userReaction === type ? 'scale-105' : userReaction ? 'opacity-60' : 'hover:scale-105'
                  } transition-all duration-300`}
                >
                  <div className={`absolute -inset-2 bg-gradient-to-br ${color} rounded-2xl blur-xl opacity-0 ${
                    userReaction === type ? 'opacity-75' : 'group-hover:opacity-50'
                  } transition duration-300`} />
                  <div className={`relative bg-gradient-to-br from-gray-900 to-black backdrop-blur-xl rounded-2xl p-6 border-2 ${
                    userReaction === type
                      ? `border-white ${glow} shadow-2xl`
                      : 'border-gray-800'
                  }`}>
                    <div className="text-4xl mb-2">{emoji}</div>
                    <div className="text-2xl font-black text-white mb-1">{reactions[type as keyof typeof reactions]}</div>
                    <div className="text-xs text-gray-400">{label}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div id="comments-section" className="max-w-4xl mx-auto mb-16">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-3xl blur-lg opacity-25 group-hover:opacity-50 transition duration-500" />
              <div className="relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl rounded-3xl p-8 border border-gray-800">
                <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  תגובות ({comments.length})
                </h3>

                {!user ? (
                  <div className="mb-8 text-center bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-2xl p-8 border-2 border-purple-500/30">
                    <div className="text-4xl mb-4">🔐</div>
                    <p className="text-white text-lg mb-6 font-medium">התחברו כדי להוסיף תגובה</p>
                    <div className="flex justify-center">
                      <GoogleLoginButton />
                    </div>
                  </div>
                ) : (
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-6 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-2xl p-4 border-2 border-purple-500/30">
                      <div className="flex items-center gap-4">
                        {userPhoto && (
                          <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full blur-sm" />
                            <img 
                              src={userPhoto} 
                              alt={userName}
                              className="relative w-10 h-10 rounded-full border-2 border-white"
                            />
                          </div>
                        )}
                        <span className="text-white font-bold">{userName}</span>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="text-white hover:text-gray-200 text-sm font-medium transition px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/50"
                      >
                        התנתק
                      </button>
                    </div>

                    <form onSubmit={handleCommentSubmit} className="space-y-4">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="שתפו את המחשבות שלכם..."
                        rows={3}
                        maxLength={500}
                        className="w-full px-6 py-4 bg-black/50 border-2 border-gray-800 focus:border-purple-500 rounded-2xl focus:outline-none resize-none text-white placeholder-gray-500 transition-colors"
                      />
                      <button
                        type="submit"
                        disabled={!newComment.trim() || submitting}
                        className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold py-3 px-8 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-purple-500/50"
                      >
                        {submitting ? 'שולח...' : 'שלח תגובה'}
                      </button>
                    </form>
                  </div>
                )}

                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">אין תגובות עדיין. היו הראשונים!</p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="bg-black/30 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-colors group">
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
                              <span className="font-bold text-purple-400">
                                {comment.name || 'משתמש'}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">
                                  {new Date(comment.timestamp || comment.created_at || '').toLocaleDateString('he-IL')}
                                </span>
                                <button
                                  onClick={() => handleDeleteComment(comment.id.toString())}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20"
                                  title="מחק תגובה (דרוש מפתח אדמין)"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                            <p className="text-gray-300 leading-relaxed">{comment.text || comment.content}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Other Artists */}
          {otherArtists.length > 0 && (
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                הכירו עוד אמנים
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {otherArtists.slice(0, 4).map((otherArtist) => (
                  <Link
                    key={otherArtist.id}
                    href={`/artist/${otherArtist.artist_id}`}
                    className="group"
                  >
                    <div className="relative">
                      <div className="absolute -inset-1 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-2xl blur-lg opacity-0 group-hover:opacity-50 transition duration-300" />
                      <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden border border-gray-800 group-hover:border-gray-600 transition-colors">
                        <div className="aspect-square">
                          <img
                            src={otherArtist.profile_photo_url}
                            alt={otherArtist.stage_name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div className="p-4 bg-gradient-to-t from-black/90 to-transparent absolute bottom-0 left-0 right-0">
                          <h3 className="font-bold text-lg text-white">{otherArtist.stage_name}</h3>
                          <p className="text-sm text-gray-400">{otherArtist.name}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="text-center mt-8">
                <Link
                  href="/featured-artist"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg hover:shadow-purple-500/50"
                >
                  כל האמנים
                  <FaArrowRight className="rotate-180" />
                </Link>
              </div>
            </div>
          )}
        </div>

        <style jsx>{`
          @keyframes gradient-x {
            0%, 100% {
              background-size: 200% 200%;
              background-position: left center;
            }
            50% {
              background-size: 200% 200%;
              background-position: right center;
            }
          }
        `}</style>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const slug = params?.slug as string;

  const supabaseServer = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch the requested artist
  const { data: artist } = await supabaseServer
    .from('featured_artists')
    .select('*')
    .eq('artist_id', slug?.toLowerCase())
    .single();

  if (!artist) {
    return {
      notFound: true,
    };
  }

  // Fetch the most recent featured artist to check if this is the current one
  const { data: currentFeatured } = await supabaseServer
    .from('featured_artists')
    .select('artist_id')
    .order('featured_at', { ascending: false })
    .limit(1)
    .single();

  const isCurrentFeatured = currentFeatured?.artist_id === artist.artist_id;

  // Fetch other artists (excluding current one)
  const { data: otherArtists } = await supabaseServer
    .from('featured_artists')
    .select('*')
    .neq('artist_id', slug?.toLowerCase())
    .order('featured_at', { ascending: false })
    .limit(4);

  return {
    props: {
      artist,
      otherArtists: otherArtists || [],
      isCurrentFeatured,
    },
  };
};

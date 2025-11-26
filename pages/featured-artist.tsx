import { GetServerSideProps } from 'next';
import { createClient } from "@supabase/supabase-js";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Navigation from '@/components/Navigation';
import { FaInstagram, FaSoundcloud, FaSpotify, FaFire, FaHeart, FaPlay } from 'react-icons/fa';
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
  id: number;
  user_id: string;
  content: string;
  created_at: string;
  profiles: {
    display_name: string;
  } | null;
}

interface PageProps {
  artist: FeaturedArtist | null;
  previousArtists: FeaturedArtist[];
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function FeaturedArtistPage({ artist, previousArtists }: PageProps) {
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

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    checkUser();
    if (artist) {
      fetchComments();
      fetchReactions();
    }
  }, [artist]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchComments = async () => {
    if (!artist) return;

    const { data, error } = await supabase
      .from('featured_artist_comments')
      .select('id, user_id, content, created_at, profiles!inner(display_name)')
      .eq('artist_id', artist.artist_id)
      .order('created_at', { ascending: false });

    if (data) {
      setComments(data as any);
    }
  };

  const fetchReactions = async () => {
    if (!artist) return;

    const { data, error } = await supabase
      .from('featured_artist_reactions')
      .select('reaction_type, user_id')
      .eq('artist_id', artist.artist_id);

    if (data) {
      const counts = {
        fire: data.filter(r => r.reaction_type === 'fire').length,
        cool: data.filter(r => r.reaction_type === 'cool').length,
        heart: data.filter(r => r.reaction_type === 'heart').length,
        mind_blown: data.filter(r => r.reaction_type === 'mind_blown').length
      };
      setReactions(counts);

      if (user) {
        const userReactionData = data.find(r => r.user_id === user.id);
        if (userReactionData) {
          setUserReaction(userReactionData.reaction_type);
        }
      }
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || !artist) return;

    setSubmitting(true);

    const { error } = await supabase
      .from('featured_artist_comments')
      .insert([{
        artist_id: artist.artist_id,
        user_id: user.id,
        content: newComment.trim()
      }]);

    if (!error) {
      setNewComment('');
      fetchComments();
    } else {
      alert('שגיאה בשליחת התגובה');
    }

    setSubmitting(false);
  };

  const handleReaction = async (reactionType: string) => {
    if (!user || !artist) {
      alert('יש להתחבר כדי להגיב');
      return;
    }

    if (userReaction === reactionType) {
      await supabase
        .from('featured_artist_reactions')
        .delete()
        .eq('artist_id', artist.artist_id)
        .eq('user_id', user.id);
      
      setUserReaction(null);
    } else {
      await supabase
        .from('featured_artist_reactions')
        .upsert({
          artist_id: artist.artist_id,
          user_id: user.id,
          reaction_type: reactionType
        }, {
          onConflict: 'artist_id,user_id'
        });
      
      setUserReaction(reactionType);
    }

    fetchReactions();
  };

  const reactionButtons = [
    { type: 'fire', icon: FaFire, label: 'אש', color: 'from-orange-500 to-red-500', glow: 'shadow-orange-500/50' },
    { type: 'cool', icon: GiSunglasses, label: 'מגניב', color: 'from-blue-500 to-cyan-500', glow: 'shadow-blue-500/50' },
    { type: 'heart', icon: FaHeart, label: 'אהבה', color: 'from-pink-500 to-red-500', glow: 'shadow-pink-500/50' },
    { type: 'mind_blown', icon: BsEmojiDizzy, label: 'מפוצץ', color: 'from-purple-500 to-pink-500', glow: 'shadow-purple-500/50' }
  ];

  if (!artist) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Navigation currentPage="featured-artist" />
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">אין אמן מוצג כרגע</h1>
          <p className="text-gray-400">חזור בקרוב לגלות את האמן הבא!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Navigation */}
      <div className="relative z-50">
        <Navigation currentPage="featured-artist" />
      </div>

      {/* Hero Section - Parallax Effect */}
      <div className="relative min-h-screen flex items-center justify-center px-4" style={{ transform: `translateY(${scrollY * 0.5}px)` }}>
        <div className="relative z-10 text-center max-w-5xl mx-auto">
          
          {/* Animated Badge */}
          <div className="mb-8 inline-block animate-bounce">
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 text-white text-sm font-bold px-8 py-3 rounded-full shadow-lg shadow-purple-500/50 animate-gradient-x">
              ⭐ האמן המוצג של השבוע ⭐
            </div>
          </div>

          {/* Spinning Vinyl Record Effect */}
          <div className="relative w-80 h-80 mx-auto mb-8 group">
            {/* Outer glow ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
            
            {/* Vinyl Record Background */}
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-gray-900 to-black border-4 border-gray-700 group-hover:animate-spin-slow" />
            
            {/* Record grooves */}
            <div className="absolute inset-8 rounded-full border-2 border-gray-800 opacity-30" />
            <div className="absolute inset-12 rounded-full border-2 border-gray-800 opacity-30" />
            <div className="absolute inset-16 rounded-full border-2 border-gray-800 opacity-30" />
            
            {/* Artist Photo - Center Label */}
            <div className="absolute inset-20 rounded-full overflow-hidden border-4 border-purple-600 shadow-2xl shadow-purple-500/50 group-hover:scale-110 transition-transform duration-500">
              <Image
                src={artist.profile_photo_url}
                alt={artist.stage_name}
                fill
                className="object-cover"
              />
            </div>

            {/* Play Button Overlay */}
            <div 
              onClick={() => setIsPlaying(!isPlaying)}
              className="absolute inset-0 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-2xl backdrop-blur-sm transform hover:scale-110 transition-transform">
                <FaPlay className="text-black text-2xl ml-1" />
              </div>
            </div>
          </div>

          {/* Artist Name - Glitch Effect */}
          <h1 className="text-7xl md:text-8xl font-black mb-4 relative">
            <span className="absolute inset-0 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent blur-sm opacity-50">
              {artist.stage_name}
            </span>
            <span className="relative bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent animate-gradient-x">
              {artist.stage_name}
            </span>
          </h1>
          
          <p className="text-2xl text-gray-400 mb-12 font-light tracking-wide">{artist.name}</p>

          {/* Social Links - Card Flip Style */}
          <div className="flex justify-center gap-6 mb-16">
            {artist.instagram_url && (
              <a
                href={artist.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative w-16 h-16"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl transform group-hover:rotate-180 transition-transform duration-500 shadow-lg shadow-purple-500/50" />
                <div className="relative w-full h-full flex items-center justify-center">
                  <FaInstagram className="text-white text-2xl relative z-10" />
                </div>
              </a>
            )}
            {artist.soundcloud_profile_url && (
              <a
                href={artist.soundcloud_profile_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative w-16 h-16"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl transform group-hover:rotate-180 transition-transform duration-500 shadow-lg shadow-orange-500/50" />
                <div className="relative w-full h-full flex items-center justify-center">
                  <FaSoundcloud className="text-white text-2xl relative z-10" />
                </div>
              </a>
            )}
            {artist.spotify_url && (
              <a
                href={artist.spotify_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative w-16 h-16"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl transform group-hover:rotate-180 transition-transform duration-500 shadow-lg shadow-green-500/50" />
                <div className="relative w-full h-full flex items-center justify-center">
                  <FaSpotify className="text-white text-2xl relative z-10" />
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
        
        {/* About Section - Story Card */}
        <div className="mb-16">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 rounded-3xl blur-lg opacity-25 group-hover:opacity-50 transition duration-500" />
            <div className="relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl rounded-3xl p-12 border border-gray-800">
              <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                הכירו את {artist.stage_name}
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed">{artist.bio}</p>
            </div>
          </div>
        </div>

        {/* Music Player - Floating Card */}
        <div className="mb-16">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-pink-600 rounded-3xl blur-lg opacity-25 group-hover:opacity-50 transition duration-500" />
            <div className="relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl rounded-3xl p-8 border border-gray-800">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center animate-pulse">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">שמעו את המוזיקה</h3>
                  <p className="text-gray-400">הטראק המומלץ</p>
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
              />
            </div>
          </div>
        </div>

        {/* Reactions - Neon Style */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            מה אתם חושבים?
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {reactionButtons.map(({ type, icon: Icon, label, color, glow }) => (
              <button
                key={type}
                onClick={() => handleReaction(type)}
                className={`relative group ${
                  userReaction === type ? 'scale-110' : 'hover:scale-105'
                } transition-all duration-300`}
              >
                <div className={`absolute -inset-2 bg-gradient-to-br ${color} rounded-2xl blur-xl opacity-0 ${
                  userReaction === type ? 'opacity-75' : 'group-hover:opacity-50'
                } transition duration-300`} />
                <div className={`relative bg-gradient-to-br from-gray-900 to-black backdrop-blur-xl rounded-2xl p-8 border-2 ${
                  userReaction === type
                    ? `border-white ${glow} shadow-2xl`
                    : 'border-gray-800'
                }`}>
                  <Icon className={`mx-auto text-5xl mb-3 bg-gradient-to-br ${color} bg-clip-text text-transparent`} />
                  <div className="text-3xl font-black text-white mb-1">{reactions[type as keyof typeof reactions]}</div>
                  <div className="text-sm text-gray-400">{label}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Comments */}
        <div className="max-w-4xl mx-auto">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-3xl blur-lg opacity-25 group-hover:opacity-50 transition duration-500" />
            <div className="relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl rounded-3xl p-8 border border-gray-800">
              <h3 className="text-3xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                תגובות ({comments.length})
              </h3>

              {user ? (
                <form onSubmit={handleCommentSubmit} className="mb-8">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="שתפו את המחשבות שלכם..."
                    rows={4}
                    className="w-full px-6 py-4 bg-black/50 border-2 border-gray-800 focus:border-purple-500 rounded-2xl focus:outline-none resize-none text-white placeholder-gray-500 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!newComment.trim() || submitting}
                    className="mt-4 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold py-4 px-8 rounded-xl disabled:opacity-50 transition-all shadow-lg hover:shadow-purple-500/50"
                  >
                    {submitting ? 'שולח...' : 'שלח תגובה'}
                  </button>
                </form>
              ) : (
                <div className="mb-8 p-6 bg-purple-500/10 rounded-2xl border-2 border-purple-500/30 text-center">
                  <p className="text-purple-300 font-medium">התחבר כדי להגיב</p>
                </div>
              )}

              <div className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-gray-500 text-center py-12">אין תגובות עדיין. היו הראשונים!</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="bg-black/30 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-bold text-purple-400">
                          {comment.profiles?.display_name || 'משתמש'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(comment.created_at).toLocaleDateString('he-IL')}
                        </span>
                      </div>
                      <p className="text-gray-300 leading-relaxed">{comment.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Previous Artists - Horizontal Scroll */}
      {previousArtists.length > 0 && (
        <div className="relative z-10 py-20 px-4">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            אמנים מוצגים קודמים
          </h2>
          
          <div className="flex gap-6 overflow-x-auto pb-8 px-4 scrollbar-hide max-w-7xl mx-auto">
            {previousArtists.map((prevArtist) => (
              <div
                key={prevArtist.id}
                className="flex-shrink-0 w-64 group cursor-pointer"
              >
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-2xl blur-lg opacity-0 group-hover:opacity-50 transition duration-300" />
                  <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden border border-gray-800 group-hover:border-gray-600 transition-colors">
                    <div className="relative w-full aspect-square">
                      <Image
                        src={prevArtist.profile_photo_url}
                        alt={prevArtist.stage_name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4 bg-gradient-to-t from-black/90 to-transparent absolute bottom-0 left-0 right-0">
                      <h3 className="font-bold text-xl mb-1 text-white">{prevArtist.stage_name}</h3>
                      <p className="text-sm text-gray-400 mb-2">{prevArtist.name}</p>
                      <p className="text-xs text-purple-400">
                        {new Date(prevArtist.featured_at).toLocaleDateString('he-IL', {
                          year: 'numeric',
                          month: 'short'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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

        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
        }

        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const supabaseServer = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: artist } = await supabaseServer
    .from('featured_artists')
    .select('*')
    .order('featured_at', { ascending: false })
    .limit(1)
    .single();

  const { data: previousArtists } = await supabaseServer
    .from('featured_artists')
    .select('*')
    .order('featured_at', { ascending: false })
    .range(1, 8);

  return {
    props: {
      artist: artist || null,
      previousArtists: previousArtists || []
    }
  };
};

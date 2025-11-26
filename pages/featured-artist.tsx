import { GetServerSideProps } from 'next';
import { createClient } from "@supabase/supabase-js";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaInstagram, FaSoundcloud, FaSpotify, FaFire, FaHeart } from 'react-icons/fa';
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
      .select(`
        id,
        user_id,
        content,
        created_at,
        profiles (display_name)
      `)
      .eq('artist_id', artist.artist_id)
      .order('created_at', { ascending: false });

    if (data) {
      setComments(data);
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
      // Remove reaction
      await supabase
        .from('featured_artist_reactions')
        .delete()
        .eq('artist_id', artist.artist_id)
        .eq('user_id', user.id);
      
      setUserReaction(null);
    } else {
      // Add or update reaction
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
    { type: 'fire', icon: FaFire, label: 'אש', color: 'text-orange-500' },
    { type: 'cool', icon: GiSunglasses, label: 'מגניב', color: 'text-blue-400' },
    { type: 'heart', icon: FaHeart, label: 'אהבה', color: 'text-red-500' },
    { type: 'mind_blown', icon: BsEmojiDizzy, label: 'מפוצץ מוח', color: 'text-purple-500' }
  ];

  if (!artist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">אין אמן מוצג כרגע</h1>
          <p className="text-purple-200">חזור בקרוב לגלות את האמן הבא!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
      {/* Hero Section */}
      <div className="relative py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold px-6 py-2 rounded-full mb-6">
            ✨ האמן המוצג השבוע
          </div>
          
          <div className="relative w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden border-4 border-purple-500 shadow-2xl">
            <Image
              src={artist.profile_photo_url}
              alt={artist.stage_name}
              fill
              className="object-cover"
            />
          </div>

          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
            {artist.stage_name}
          </h1>
          <p className="text-xl text-purple-200 mb-8">{artist.name}</p>

          {/* Social Links */}
          <div className="flex justify-center gap-4 mb-8">
            {artist.instagram_url && (
              <a
                href={artist.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-3 rounded-full transition-all"
              >
                <FaInstagram size={24} />
              </a>
            )}
            {artist.soundcloud_profile_url && (
              <a
                href={artist.soundcloud_profile_url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-3 rounded-full transition-all"
              >
                <FaSoundcloud size={24} />
              </a>
            )}
            {artist.spotify_url && (
              <a
                href={artist.spotify_url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-3 rounded-full transition-all"
              >
                <FaSpotify size={24} />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-16 max-w-4xl">
        {/* Bio */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 mb-8 border border-purple-500/30">
          <p className="text-lg leading-relaxed">{artist.bio}</p>
        </div>

        {/* SoundCloud Player */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 mb-8 border border-purple-500/30">
          <h2 className="text-2xl font-bold mb-4">🎵 השמע את המוזיקה</h2>
          <iframe
            width="100%"
            height="166"
            scrolling="no"
            frameBorder="no"
            allow="autoplay"
            src={artist.soundcloud_track_url}
            className="rounded-lg"
          />
        </div>

        {/* Reactions */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 mb-8 border border-purple-500/30">
          <h2 className="text-2xl font-bold mb-4">💫 מה אתם חושבים?</h2>
          <div className="flex flex-wrap gap-4 justify-center">
            {reactionButtons.map(({ type, icon: Icon, label, color }) => (
              <button
                key={type}
                onClick={() => handleReaction(type)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${
                  userReaction === type
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 scale-110'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                <Icon className={color} size={24} />
                <span className="font-semibold">{reactions[type as keyof typeof reactions]}</span>
                <span className="text-sm">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-purple-500/30">
          <h2 className="text-2xl font-bold mb-6">💬 תגובות</h2>

          {/* Comment Form */}
          {user ? (
            <form onSubmit={handleCommentSubmit} className="mb-8">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="שתפו את המחשבות שלכם..."
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-purple-500/30 rounded-lg focus:border-purple-500 focus:outline-none resize-none mb-3"
              />
              <button
                type="submit"
                disabled={!newComment.trim() || submitting}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-2 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {submitting ? 'שולח...' : 'שלח תגובה'}
              </button>
            </form>
          ) : (
            <div className="mb-8 p-4 bg-white/5 rounded-lg text-center">
              <p className="text-purple-200">התחבר כדי להגיב</p>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-purple-200 text-center py-8">אין תגובות עדיין. היו הראשונים!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="bg-white/5 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-purple-300">
                      {comment.profiles?.display_name || 'משתמש'}
                    </span>
                    <span className="text-sm text-purple-400">
                      {new Date(comment.created_at).toLocaleDateString('he-IL')}
                    </span>
                  </div>
                  <p className="text-white">{comment.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Previous Artists Section */}
      {previousArtists.length > 0 && (
        <div className="container mx-auto px-4 pb-16 max-w-6xl">
          <div className="bg-white/5 backdrop-blur-md rounded-lg p-8 border border-purple-500/30">
            <h2 className="text-3xl font-bold mb-8 text-center">אמנים מוצגים קודמים</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {previousArtists.map((prevArtist) => (
                <div
                  key={prevArtist.id}
                  className="bg-white/10 rounded-lg overflow-hidden hover:bg-white/20 transition-all border border-purple-500/20 hover:border-purple-500/50"
                >
                  <div className="relative w-full aspect-square">
                    <Image
                      src={prevArtist.profile_photo_url}
                      alt={prevArtist.stage_name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1">{prevArtist.stage_name}</h3>
                    <p className="text-sm text-purple-300 mb-2">{prevArtist.name}</p>
                    <p className="text-xs text-purple-400">
                      {new Date(prevArtist.featured_at).toLocaleDateString('he-IL', {
                        year: 'numeric',
                        month: 'short'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  // Fetch current artist (most recent)
  const { data: artist } = await supabase
    .from('featured_artists')
    .select('*')
    .order('featured_at', { ascending: false })
    .limit(1)
    .single();

  // Fetch previous artists (up to 8)
  const { data: previousArtists } = await supabase
    .from('featured_artists')
    .select('*')
    .order('featured_at', { ascending: false })
    .range(1, 8); // Skip first (current), get next 8

  return {
    props: {
      artist: artist || null,
      previousArtists: previousArtists || []
    }
  };
};

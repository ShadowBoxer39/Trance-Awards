import { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabaseClient';
import GoogleLoginButton from '../components/GoogleLoginButton';
import { getGoogleUserInfo } from '../lib/googleAuthHelpers';
import type { User } from '@supabase/supabase-js';

interface Track {
  id: number;
  track_name: string;
  artist_name: string;
  youtube_url: string;
  spotify_url: string | null;
  soundcloud_url: string | null;
  week_date: string;
}

interface Comment {
  id: number;
  name: string;
  text: string;
  created_at: string;
  user_id?: string;
  user_photo_url?: string;
}

interface Reaction {
  emoji: string;
  count: number;
}

export default function TrackOfTheWeek() {
  const [track, setTrack] = useState<Track | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState('');
  const [userPhoto, setUserPhoto] = useState<string | null>(null);

  const ADMIN_KEY = 'tracktrip2024';

  useEffect(() => {
    fetchTrackData();
    fetchComments();
    fetchReactions();
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

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      const userInfo = getGoogleUserInfo(user);
      if (userInfo) {
        setUserName(userInfo.name);
        setUserPhoto(userInfo.photoUrl);
      }
    }
  };

  const fetchTrackData = async () => {
    try {
      const { data, error } = await supabase
        .from('track_of_the_week')
        .select('*')
        .order('week_date', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      setTrack(data);
    } catch (error) {
      console.error('Error fetching track:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch('/api/track-comment-public');
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const fetchReactions = async () => {
    try {
      const response = await fetch('/api/track-reactions-public');
      const data = await response.json();
      setReactions(data);
    } catch (error) {
      console.error('Error fetching reactions:', error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('יש להתחבר כדי להוסיף תגובה');
      return;
    }

    if (!newComment.trim()) {
      alert('אנא כתוב תגובה');
      return;
    }

    try {
      const response = await fetch('/api/track-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          track_id: track?.id,
          name: userName,
          text: newComment,
          user_id: user.id,
          user_photo_url: userPhoto,
        }),
      });

      if (response.ok) {
        setNewComment('');
        fetchComments();
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('שגיאה בשליחת התגובה');
    }
  };

  const handleReaction = async (emoji: string) => {
    const reactionKey = `track_${track?.id}_${emoji}`;
    const hasReacted = localStorage.getItem(reactionKey);

    if (hasReacted) {
      alert('כבר הגבת עם אימוג\'י זה!');
      return;
    }

    try {
      const response = await fetch('/api/track-reaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          track_id: track?.id,
          emoji,
        }),
      });

      if (response.ok) {
        localStorage.setItem(reactionKey, 'true');
        fetchReactions();
      }
    } catch (error) {
      console.error('Error submitting reaction:', error);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    const key = prompt('הכנס מפתח מנהל למחיקה:');
    if (key !== ADMIN_KEY) {
      alert('מפתח שגוי');
      return;
    }

    try {
      const response = await fetch('/api/track-comment-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: commentId }),
      });

      if (response.ok) {
        fetchComments();
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserName('');
    setUserPhoto(null);
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.split('v=')[1]?.split('&')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-white text-2xl">טוען...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Track of the Week - יוצאים לטראק</title>
        <meta name="description" content="השיר הטראנסי של השבוע" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900">
        <Header />

        <main className="container mx-auto px-4 py-12" dir="rtl">
          <h1 className="text-5xl font-bold text-center mb-4 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            🎵 Track of the Week 🎵
          </h1>
          
          {track && (
            <div className="max-w-4xl mx-auto">
              {/* Track Info */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-8 border border-purple-500/30">
                <h2 className="text-3xl font-bold text-white mb-2">{track.track_name}</h2>
                <p className="text-xl text-purple-300 mb-6">{track.artist_name}</p>
                
                {/* YouTube Embed */}
                {track.youtube_url && (
                  <div className="aspect-video rounded-lg overflow-hidden mb-6">
                    <iframe
                      src={getYouTubeEmbedUrl(track.youtube_url)}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}

                {/* Streaming Links */}
                <div className="flex gap-4 justify-center flex-wrap">
                  {track.youtube_url && (
                    <a
                      href={track.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition"
                    >
                      YouTube
                    </a>
                  )}
                  {track.spotify_url && (
                    <a
                      href={track.spotify_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition"
                    >
                      Spotify
                    </a>
                  )}
                  {track.soundcloud_url && (
                    <a
                      href={track.soundcloud_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition"
                    >
                      SoundCloud
                    </a>
                  )}
                </div>
              </div>

              {/* Reactions */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 border border-purple-500/30">
                <h3 className="text-2xl font-bold text-white mb-4">מה דעתך על השיר?</h3>
                <div className="flex gap-4 justify-center flex-wrap">
                  {['🔥', '❤️', '😍', '🎉', '💯'].map((emoji) => {
                    const reaction = reactions.find((r) => r.emoji === emoji);
                    return (
                      <button
                        key={emoji}
                        onClick={() => handleReaction(emoji)}
                        className="bg-white/20 hover:bg-white/30 rounded-full p-4 transition text-4xl relative"
                      >
                        {emoji}
                        {reaction && reaction.count > 0 && (
                          <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-sm rounded-full w-6 h-6 flex items-center justify-center">
                            {reaction.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Comments Section */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-purple-500/30">
                <h3 className="text-2xl font-bold text-white mb-6">תגובות</h3>

                {/* Authentication Section */}
                {!user ? (
                  <div className="mb-8 text-center">
                    <p className="text-white mb-4">התחבר כדי להוסיף תגובה</p>
                    <GoogleLoginButton redirectTo="/track-of-the-week" />
                  </div>
                ) : (
                  <div className="mb-8">
                    {/* User Info & Logout */}
                    <div className="flex items-center justify-between mb-4">
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
                        className="text-purple-300 hover:text-purple-100 text-sm transition"
                      >
                        התנתק
                      </button>
                    </div>

                    {/* Comment Form */}
                    <form onSubmit={handleCommentSubmit} className="space-y-4">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="כתוב את התגובה שלך..."
                        className="w-full bg-white/20 text-white rounded-lg p-4 border border-purple-500/50 focus:border-purple-500 focus:outline-none placeholder-gray-400"
                        rows={4}
                      />
                      <button
                        type="submit"
                        className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-medium transition"
                      >
                        שלח תגובה
                      </button>
                    </form>
                  </div>
                )}

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">אין תגובות עדיין. היה הראשון!</p>
                  ) : (
                    comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="bg-white/10 rounded-lg p-4 border border-purple-500/30"
                      >
                        <div className="flex items-start gap-3">
                          {comment.user_photo_url && (
                            <img 
                              src={comment.user_photo_url} 
                              alt={comment.name}
                              className="w-10 h-10 rounded-full border-2 border-purple-500 flex-shrink-0"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-purple-300 font-medium">{comment.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-400 text-sm">
                                  {new Date(comment.created_at).toLocaleDateString('he-IL')}
                                </span>
                                <button
                                  onClick={() => handleDeleteComment(comment.id)}
                                  className="text-red-400 hover:text-red-300 text-sm transition"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                            <p className="text-white">{comment.text}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
}

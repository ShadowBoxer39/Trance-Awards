// pages/featured-artist.tsx - Dedicated page for featured young artist
import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";
import Navigation from "../components/Navigation";
import SEO from "@/components/SEO";

interface FeaturedArtist {
  id: string;
  name: string;
  stage_name: string;
  bio: string;
  profile_photo_url: string;
  track_url: string;
  instagram_url?: string;
  soundcloud_url?: string;
  spotify_url?: string;
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
  const [newComment, setNewComment] = useState({ name: "", text: "" });
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
    
    if (artist) {
      // Load reactions from API
      fetch(`/api/artist-reaction?artistId=${artist.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.reactions) {
            setReactions(data.reactions);
          }
        })
        .catch(err => console.error('Failed to load reactions:', err));

      // Load comments from API
      fetch(`/api/artist-comments-public?artistId=${artist.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.comments) {
            setComments(data.comments);
          }
        })
        .catch(err => console.error('Failed to load comments:', err));

      // Check if user already reacted (from localStorage)
      const userReaction = localStorage.getItem(`artist_reaction_${artist.id}`);
      if (userReaction) {
        setSelectedReaction(userReaction);
      }
    }
  }, [artist]);

  const handleReaction = async (reactionType: keyof typeof reactions) => {
    if (!artist || selectedReaction) return;

    // Optimistic update
    setSelectedReaction(reactionType);
    const newReactions = { ...reactions, [reactionType]: reactions[reactionType] + 1 };
    setReactions(newReactions);

    // Save to localStorage
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
      // Revert on error
      setSelectedReaction(null);
      setReactions(reactions);
      localStorage.removeItem(`artist_reaction_${artist.id}`);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artist || !newComment.name.trim() || !newComment.text.trim() || isSubmitting) return;

    setIsSubmitting(true);

    const comment = {
      id: Date.now().toString(),
      name: newComment.name.trim(),
      text: newComment.text.trim(),
      timestamp: new Date().toISOString(),
    };

    try {
      const response = await fetch("/api/artist-comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artistId: artist.id,
          comment,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save comment");
      }

      const data = await response.json();
      setComments([data.comment, ...comments]);
      setNewComment({ name: "", text: "" });
    } catch (error) {
      console.error("Error saving comment:", error);
      alert("שגיאה בשמירת התגובה");
    } finally {
      setIsSubmitting(false);
    }
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
    mind_blown: { emoji: "🤯", label: "מפוצץ" },
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
        <Navigation currentPage="featured-artist" />

        {/* Hero Section - Enhanced */}
        <section className="relative overflow-hidden bg-gradient-to-br from-purple-900/30 via-cyan-900/30 to-pink-900/30">
          <div className="absolute inset-0 bg-[url('/images/grid.svg')] opacity-10" />
          <div className="max-w-6xl mx-auto px-6 py-12 md:py-16 relative z-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 mb-4">
                <span className="text-2xl">🌟</span>
                <span className="text-sm font-medium text-purple-300">האמן שאתם צריכים להכיר</span>
              </div>
              
              <h1 className="text-3xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                {artist.stage_name}
              </h1>
              <p className="text-gray-400 text-sm md:text-base">{artist.name}</p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="max-w-6xl mx-auto px-6 py-8 md:py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Artist Profile + Track */}
            <div className="lg:col-span-2 space-y-6">
              {/* Large Artist Photo */}
              <div className="glass-card rounded-3xl overflow-hidden border-4 border-purple-500/50">
                <div className="aspect-square bg-gray-900">
                  <img
                    src={artist.profile_photo_url}
                    alt={artist.stage_name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* SoundCloud Embed */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span>🎵</span>
                  הטראק המוצג
                </h3>
                <div className="rounded-lg overflow-hidden">
                  <iframe
                    width="100%"
                    height="166"
                    scrolling="no"
                    style={{ border: "none" }}
                    allow="autoplay"
                    src={artist.track_url}
                  />
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
                      <div className="text-lg font-bold text-purple-400">
                        {reactions[type as keyof typeof reactions]}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Comments Section */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4">תגובות ({comments.length})</h3>

                {/* Comment Form */}
                <form onSubmit={handleCommentSubmit} className="mb-6">
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="השם שלך"
                      value={newComment.name}
                      onChange={(e) => setNewComment({ ...newComment, name: e.target.value })}
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                      maxLength={50}
                    />
                    <textarea
                      placeholder="מה דעתך על האמן?"
                      value={newComment.text}
                      onChange={(e) => setNewComment({ ...newComment, text: e.target.value })}
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none min-h-[100px] resize-none"
                      maxLength={500}
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
                              {new Date(comment.timestamp).toLocaleDateString("he-IL")}
                            </div>
                            {/* Delete button - only visible on hover */}
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20"
                              title="מחק תגובה (דרוש מפתח אדמין)"
                            >
                              🗑️ מחק
                            </button>
                          </div>
                        </div>
                        <p className="text-gray-300">{comment.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Enhanced Artist Info */}
            <div className="space-y-6">
              {/* Artist Bio Card - HUGE & PROMINENT */}
              <div className="glass-card rounded-3xl p-8 border-4 border-purple-500/50 bg-gradient-to-br from-purple-500/20 via-transparent to-cyan-500/20 shadow-2xl shadow-purple-500/30">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 mb-4">
                    <span className="text-xl">✨</span>
                    <span className="text-sm font-bold text-white uppercase tracking-wider">
                      אמן השבוע
                    </span>
                  </div>
                </div>

                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    {artist.stage_name}
                  </h2>
                  <p className="text-purple-300 text-sm font-medium mb-4">
                    {artist.name}
                  </p>
                </div>

                {/* Bio */}
                <div className="bg-black/40 rounded-2xl p-6 mb-8 border-2 border-purple-500/30 backdrop-blur-sm">
                  <h4 className="text-base font-bold text-purple-300 mb-3 flex items-center gap-2">
                    <span>💭</span>
                    על האמן
                  </h4>
                  <p className="text-gray-200 leading-relaxed text-base">
                    {artist.bio}
                  </p>
                </div>

                {/* Social Links - Enhanced */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-gray-400">עקבו אחריו</h4>
                  <div className="flex flex-col gap-3">
                    {artist.instagram_url && (
                      <a
                        href={artist.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-105"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                        Instagram
                      </a>
                    )}
                    {artist.soundcloud_url && (
                      <a
                        href={artist.soundcloud_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                        </svg>
                        SoundCloud
                      </a>
                    )}
                    {artist.spotify_url && (
                      <a
                        href={artist.spotify_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                        </svg>
                        Spotify
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Apply CTA */}
              <div className="glass-card rounded-2xl p-6 text-center bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border-2 border-cyan-500/20">
                <span className="text-4xl mb-3 block">🎤</span>
                <h3 className="text-lg font-bold mb-2">אתם אמנים צעירים?</h3>
                <p className="text-sm text-gray-400 mb-4">הגישו מועמדות להופיע בתכנית!</p>
                <Link href="/young-artists" className="btn-primary px-6 py-3 rounded-lg inline-block font-medium">
                  הגישו מועמדות
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
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
  // For now, return Kanok as featured artist
  // Later this can be dynamic from database
  const artist: FeaturedArtist = {
    id: "kanok",
    name: "טל רנדליך",
    stage_name: "Kanok",
    bio: "טל קאנוק הוא אמן שכשאתה שומע אותו אתה מרגיש שהוא פורט לך על מיתרי הרגש. יש משהו בצלילים שהוא מייצר שמצליח ללטף אותך ולגרום לך להרגיש שאתה בידיים טובות. לכו תשמעו את המוזיקה שלו, אתם לא תצטערו.",
    profile_photo_url: "/images/kanok.png",
    track_url: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/kanok_music/kanok-light-beam&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=false",
    instagram_url: "https://www.instagram.com/kanok_music/",
    soundcloud_url: "https://soundcloud.com/kanok_music",
    spotify_url: "https://open.spotify.com/artist/3gayXKIE0S2wgeaSigcwIC?si=MOMSUPgpS6mjB8T2Qu8dww",
    featured_at: new Date().toISOString(),
    reactions: {
      fire: 0,
      mind_blown: 0,
      cool: 0,
      heart: 0,
    },
    comments: [],
  };

  return {
    props: {
      artist,
    },
  };
}

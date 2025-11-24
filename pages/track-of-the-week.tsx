// pages/track-of-the-week.tsx - ENHANCED VERSION
import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";
import Navigation from "../components/Navigation";
import SEO from "@/components/SEO";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
  view_count?: number;
  submission_count?: number;
}

interface Reaction {
  id: number;
  track_id: number;
  reaction_type: string;
  count: number;
}

interface Comment {
  id: number;
  track_id: number;
  user_name: string;
  comment_text: string;
  created_at: string;
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
  const [reactions, setReactions] = useState<{ [key: string]: number }>({
    fire: 0,
    heart: 0,
    music: 0,
  });
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState({ name: "", text: "" });
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
    if (currentTrack) {
      loadReactions();
      loadComments();
    }
  }, [currentTrack]);

  const loadReactions = async () => {
    if (!currentTrack) return;
    
    const { data, error } = await supabase
      .from("track_reactions")
      .select("*")
      .eq("track_id", currentTrack.id);

    if (data) {
      const reactionCounts: { [key: string]: number } = {
        fire: 0,
        heart: 0,
        music: 0,
      };
      data.forEach((r: Reaction) => {
        reactionCounts[r.reaction_type] = r.count;
      });
      setReactions(reactionCounts);
    }
  };

  const loadComments = async () => {
    if (!currentTrack) return;
    
    const { data, error } = await supabase
      .from("track_comments")
      .select("*")
      .eq("track_id", currentTrack.id)
      .order("created_at", { ascending: false });

    if (data) {
      setComments(data);
    }
  };

  const handleReaction = async (type: string) => {
    if (!currentTrack || selectedReaction === type) return;

    setSelectedReaction(type);
    const newCount = reactions[type] + 1;
    setReactions({ ...reactions, [type]: newCount });

    // Update in database
    const { data, error } = await supabase
      .from("track_reactions")
      .upsert({
        track_id: currentTrack.id,
        reaction_type: type,
        count: newCount,
      });

    // Store in localStorage to prevent multiple reactions
    localStorage.setItem(`reacted_${currentTrack.id}`, type);
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTrack || !newComment.name.trim() || !newComment.text.trim()) return;

    const { data, error } = await supabase.from("track_comments").insert({
      track_id: currentTrack.id,
      user_name: newComment.name,
      comment_text: newComment.text,
    });

    if (!error) {
      setNewComment({ name: "", text: "" });
      loadComments();
    }
  };

  const reactionEmojis = {
    fire: "🔥",
    heart: "❤️",
    music: "🎵",
  };

  if (!currentTrack) {
    return (
      <>
        <SEO
          title="הטראק השבועי של הקהילה"
          description="מידי שבוע, טראק חדש נבחר על ידי הקהילה שלנו"
          url="https://yourdomain.com/track-of-the-week"
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
        url="https://yourdomain.com/track-of-the-week"
      />
      <Head>
        <title>{currentTrack.track_title} - הטראק השבועי של הקהילה</title>
      </Head>

      <div className="trance-backdrop min-h-screen text-gray-100">
        <Navigation currentPage="track-of-the-week" />

        {/* Hero Section with Gradient Background */}
        <section className="relative overflow-hidden bg-gradient-to-br from-purple-900/30 via-cyan-900/30 to-pink-900/30">
          <div className="absolute inset-0 bg-[url('/images/grid.svg')] opacity-10" />
          <div className="max-w-6xl mx-auto px-6 py-12 md:py-16 relative z-10">
            <div className="text-center mb-8">
              {/* Badge */}
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
            {/* Left Column - Video & Stats */}
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

              {/* Reactions Bar */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4">מה אתם חושבים על הטראק?</h3>
                <div className="flex gap-4 justify-center md:justify-start">
                  {Object.entries(reactionEmojis).map(([type, emoji]) => (
                    <button
                      key={type}
                      onClick={() => handleReaction(type)}
                      disabled={selectedReaction !== null}
                      className={`flex flex-col items-center gap-2 px-6 py-4 rounded-xl transition-all ${
                        selectedReaction === type
                          ? "bg-purple-500/30 scale-110"
                          : "bg-white/5 hover:bg-white/10 hover:scale-105"
                      } ${selectedReaction && selectedReaction !== type ? "opacity-50" : ""}`}
                    >
                      <span className="text-3xl">{emoji}</span>
                      <span className="text-2xl font-bold text-white">{reactions[type]}</span>
                    </button>
                  ))}
                </div>
                {selectedReaction && (
                  <p className="text-center text-sm text-gray-400 mt-4">תודה על התגובה שלך! 💜</p>
                )}
              </div>

              {/* Comments Section */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <span>💬</span>
                  תגובות ({comments.length})
                </h3>

                {/* Comment Form */}
                <form onSubmit={submitComment} className="mb-8">
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="השם שלך"
                      value={newComment.name}
                      onChange={(e) => setNewComment({ ...newComment, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
                      required
                    />
                    <textarea
                      placeholder="מה דעתך על הטראק הזה?"
                      value={newComment.text}
                      onChange={(e) => setNewComment({ ...newComment, text: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition resize-none"
                      rows={3}
                      required
                    />
                    <button type="submit" className="btn-primary px-6 py-3 rounded-lg font-medium">
                      שליחת תגובה
                    </button>
                  </div>
                </form>

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">היו הראשונים להגיב! 🎵</p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                            <span className="text-lg">👤</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-white">{comment.user_name}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(comment.created_at).toLocaleDateString("he-IL")}
                              </span>
                            </div>
                            <p className="text-gray-300 leading-relaxed">{comment.comment_text}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Submitter Info & Stats */}
            <div className="space-y-6">
              {/* Submitter Card */}
              <div className="glass-card rounded-2xl p-6 border-2 border-purple-500/30">
                <div className="text-center mb-4">
                  <span className="text-sm font-semibold text-purple-400 uppercase tracking-wide">
                    נבחר על ידי
                  </span>
                </div>

                <div className="flex flex-col items-center mb-6">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-purple-500/50 bg-gray-700 mb-4 ring-4 ring-purple-500/20">
                    {currentTrack.photo_url ? (
                      <img
                        src={currentTrack.photo_url}
                        alt={currentTrack.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl text-gray-500">
                        👤
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white">{currentTrack.name}</h3>
                  {currentTrack.submission_count && currentTrack.submission_count > 1 && (
                    <span className="text-xs text-purple-400 mt-1">
                      הגשה מספר {currentTrack.submission_count} 🌟
                    </span>
                  )}
                </div>

                <div className="bg-black/30 rounded-lg p-4 mb-6">
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">למה הטראק הזה?</h4>
                  <p className="text-gray-300 leading-relaxed text-sm">{currentTrack.description}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-purple-500/10 rounded-lg p-3 text-center border border-purple-500/20">
                    <div className="text-2xl font-bold text-purple-400">
                      {currentTrack.view_count || 0}
                    </div>
                    <div className="text-xs text-gray-400">צפיות</div>
                  </div>
                  <div className="bg-cyan-500/10 rounded-lg p-3 text-center border border-cyan-500/20">
                    <div className="text-2xl font-bold text-cyan-400">{comments.length}</div>
                    <div className="text-xs text-gray-400">תגובות</div>
                  </div>
                </div>

                {/* Share Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      const text = `🎵 ${currentTrack.track_title}\nהטראק השבועי של קהילת יוצאים לטראק!\n${window.location.href}`;
                      if (navigator.share) {
                        navigator.share({ text });
                      } else {
                        navigator.clipboard.writeText(text);
                        alert("הקישור הועתק!");
                      }
                    }}
                    className="w-full btn-secondary px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2"
                  >
                    <span>📤</span>
                    שתפו את הטראק
                  </button>
                  <a
                    href={currentTrack.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full btn-secondary px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                    צפו ב-YouTube
                  </a>
                </div>
              </div>

              {/* Submit Your Track CTA */}
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

            {/* Carousel/Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {pastTracks.slice(0, 8).map((track) => (
                <div
                  key={track.id}
                  className="glass-card rounded-xl overflow-hidden hover:scale-105 transition-transform group cursor-pointer"
                >
                  {/* Thumbnail */}
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

                  {/* Info */}
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
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Get current approved track
    const { data: currentTrack, error: currentError } = await supabase
      .from("track_of_the_week_submissions")
      .select("*")
      .eq("is_approved", true)
      .order("approved_at", { ascending: false })
      .limit(1)
      .single();

    // Get past tracks (last 12)
    const { data: pastTracks, error: pastError } = await supabase
      .from("track_of_the_week_submissions")
      .select("*")
      .eq("is_approved", true)
      .order("approved_at", { ascending: false })
      .range(1, 12);

    return {
      props: {
        currentTrack: currentTrack || null,
        pastTracks: pastTracks || [],
      },
    };
  } catch (error) {
    console.error("Error fetching track data:", error);
    return {
      props: {
        currentTrack: null,
        pastTracks: [],
      },
    };
  }
}

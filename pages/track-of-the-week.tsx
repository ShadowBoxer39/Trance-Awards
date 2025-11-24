// pages/track-of-the-week.tsx - WORKS WITH EXISTING DATABASE
// This version works with your current database structure
// No migration needed!

import Head from "next/head";
import Link from "next/link";
import { useEffect } from "react";
import Navigation from "../components/Navigation";
import SEO from "@/components/SEO";

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
  useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
  }, []);

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
            {/* Left Column - Video */}
            <div className="lg:col-span-2">
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
            </div>

            {/* Right Column - Submitter Info */}
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
                </div>

                <div className="bg-black/30 rounded-lg p-4 mb-6">
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">למה הטראק הזה?</h4>
                  <p className="text-gray-300 leading-relaxed text-sm">{currentTrack.description}</p>
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

            {/* Grid */}
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

// Server-side props - WORKS WITH EXISTING DATABASE
export async function getServerSideProps() {
  // Check if Supabase env vars are available
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

    // Get current approved track - using only existing columns
    const { data: currentTrack, error: currentError } = await supabase
      .from("track_of_the_week_submissions")
      .select("id, name, photo_url, track_title, youtube_url, description, created_at, approved_at, is_approved")
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (currentError) {
      console.error("Current track error:", currentError);
    }

    // Get past tracks - using only existing columns
    const { data: pastTracks, error: pastError } = await supabase
      .from("track_of_the_week_submissions")
      .select("id, name, photo_url, track_title, youtube_url, description, created_at, approved_at, is_approved")
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
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

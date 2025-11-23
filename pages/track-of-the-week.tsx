// pages/track-of-the-week.tsx

import React from 'react';
import { GetStaticProps } from 'next';
import Image from 'next/image';
import Link from 'next/link';

// NOTE: Adjusted import to match your 'lib/supabaseServer.ts' default export
import supabase from '../lib/supabaseServer';
import Navigation from '../components/Navigation';
import SEO from '../components/SEO';

// --- Typescript Interface for our Data ---
interface TrackSubmission {
  id: number;
  name: string;
  photo_url: string | null;
  track_title: string;
  youtube_url: string;
  description: string;
  created_at: string; // ISO date string
}

interface TrackPageProps {
  track: TrackSubmission | null;
  error: string | null;
}

// Helper function to extract YouTube video ID from various URLs
const getYouTubeVideoId = (url: string): string | null => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};


const TrackOfTheWeekPage: React.FC<TrackPageProps> = ({ track, error }) => {
  // Set page direction to RTL (Hebrew)
  React.useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Navigation currentPage="track-of-the-week" />
        <main className="container mx-auto p-6 text-center pt-20">
          <h1 className="text-4xl font-bold text-red-500 mb-4">שגיאת טעינה</h1>
          <p className="text-gray-400">לא ניתן היה לטעון את 'הטרק השבועי'. {error}</p>
        </main>
      </div>
    );
  }

  const videoId = track ? getYouTubeVideoId(track.youtube_url) : null;

  return (
    <div className="min-h-screen trance-backdrop text-gray-100">
      {/* currentPage is a new prop we'll need to add to Navigation.tsx later */}
      <SEO 
        title="הטרק השבועי"
        description={track ? `הטרק השבועי של הקהילה: ${track.track_title} - נבחר על ידי ${track.name}` : "הטרק השבועי שנבחר על ידי קהילת הוואטסאפ שלנו."}
      />
      <Navigation currentPage="track-of-the-week" />

      <main className="max-w-7xl mx-auto px-6 pt-16 pb-16">
        <h1 className="text-4xl md:text-5xl font-semibold text-center text-gradient mb-12">
          🔥 הטרק השבועי של הקהילה
        </h1>

        <div className="max-w-4xl mx-auto">
          {track && videoId ? (
            <div className="glass-card rounded-2xl p-6 md:p-8">
              {/* YouTube Embed */}
              <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden mb-8 shadow-xl">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=0`}
                  title={track.track_title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>

              {/* Track and Selector Info */}
              <h2 className="text-3xl font-bold mb-2 text-white">
                {track.track_title}
              </h2>
              <div className="flex items-center gap-4 border-b border-gray-700/50 pb-4 mb-6">
                <div className="text-gray-400 text-sm">
                  נבחר ב: {new Date(track.created_at).toLocaleDateString('he-IL')}
                </div>
                <a
                  href={track.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 transition text-sm flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  <span>האזינו ב־YouTube</span>
                </a>
              </div>
              
              {/* Selector Details */}
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-full md:w-1/3 flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-purple-500/50 mb-3 bg-gray-700">
                    {track.photo_url ? (
                      <Image
                        src={track.photo_url}
                        alt={`Photo of ${track.name}`}
                        width={96}
                        height={96}
                        objectFit="cover"
                        className="w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl text-gray-500">
                        👤
                      </div>
                    )}
                  </div>
                  <p className="text-lg font-semibold text-purple-400">
                    {track.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    מקהילת הוואטסאפ
                  </p>
                </div>

                {/* Description */}
                <div className="w-full md:w-2/3">
                  <h3 className="text-xl font-semibold mb-3 text-white border-b border-gray-700 pb-2">
                    למה דווקא הטרק הזה?
                  </h3>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                    {track.description}
                  </p>
                </div>
              </div>

            </div>
          ) : (
            <div className="glass-card rounded-2xl p-8 text-center">
              <p className="text-2xl font-semibold text-gray-400">
                אין עדיין 'טרק שבועי' מאושר.
              </p>
              <p className="text-lg text-gray-500 mt-2">
                אתם מוזמנים להגיש המלצה משלכם!
              </p>
              <Link
                href="/submit-track"
                className="btn-primary px-6 py-3 rounded-lg font-medium inline-block mt-6"
              >
                הגישו טרק עכשיו
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export const getStaticProps: GetStaticProps<TrackPageProps> = async () => {
  try {
    // 1. Fetch the single approved track submission
    const { data, error } = await supabase
      .from('track_of_the_week_submissions')
      .select('*')
      .eq('is_approved', true) // Filter for the approved track
      .order('created_at', { ascending: false }) // Get the most recently approved
      .limit(1)
      .single(); // Expect only one result

    if (error && error.code !== 'PGRST116') { // PGRST116 is the code for "zero rows returned"
      console.error('Supabase fetch error:', error);
      return {
        props: {
          track: null,
          error: `שגיאת מסד נתונים: ${error.message}`,
        },
        revalidate: 60, // Re-try fetching in 60 seconds if there's a database error
      };
    }

    const track = data as TrackSubmission || null;

    return {
      props: {
        track: track,
        error: null,
      },
      // Revalidate the page (check for new approved track) every 5 minutes
      revalidate: 300, 
    };
  } catch (e: any) {
    console.error('getStaticProps execution error:', e);
    return {
      props: {
        track: null,
        error: `שגיאה בשרת: ${e.message}`,
      },
      revalidate: 60,
    };
  }
};

export default TrackOfTheWeekPage;

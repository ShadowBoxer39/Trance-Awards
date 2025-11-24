// pages/track-of-the-week.tsx - FINAL ENHANCED DESIGN

import React from 'react';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import supabase from '../lib/supabaseServer';
import Navigation from '../components/Navigation';
import SEO from '../components/SEO';

interface TrackSubmission {
  id: number;
  name: string;
  photo_url: string | null;
  track_title: string;
  youtube_url: string;
  description: string;
  created_at: string;
}

interface TrackPageProps {
  track: TrackSubmission | null;
  error: string | null;
}

const getYouTubeVideoId = (url: string): string | null => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

export default function TrackOfTheWeekPage({ track, error }: TrackPageProps) {
  React.useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
  }, []);

  const videoId = track ? getYouTubeVideoId(track.youtube_url) : null;
  const isVideoAvailable = track && videoId;

  if (error) {
    return (
      <div className="min-h-screen trance-backdrop text-white">
        <Navigation currentPage="track-of-the-week" />
        <main className="container mx-auto p-6 text-center pt-20">
          <h1 className="text-4xl font-bold text-red-500 mb-4">שגיאת טעינה</h1>
          <p className="text-gray-400">לא ניתן היה לטעון את הטראק השבועי. {error}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen trance-backdrop text-gray-100">
      <SEO 
        title="הטראק השבועי"
        description={track ? `הטראק השבועי של הקהילה: ${track.track_title} - נבחר על ידי ${track.name}` : "הטראק השבועי שנבחר על ידי קהילת הוואטסאפ שלנו."}
      />
      <Navigation currentPage="track-of-the-week" />

      <main className="max-w-7xl mx-auto px-6 pt-16 pb-16">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-semibold text-center text-gradient">
            🔥 הטראק השבועי של הקהילה
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mt-2">
            מדי שבוע - טראק חדש נבחר על ידי הקהילה!
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {isVideoAvailable ? (
            <div className="glass-card rounded-2xl p-6 md:p-10 shadow-2xl">
              
              {/* VIDEO EMBED */}
              <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden mb-8 shadow-2xl">
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

              {/* TRACK TITLE AND ARTIST */}
              <div className="text-center mb-10">
                <h2 className="text-4xl md:text-5xl font-bold mb-2 text-white">
                  {track.track_title}
                </h2>
                <p className="text-xl text-green-400 font-medium">
                  {track.name}
                </p>
              </div>


              <div className="grid md:grid-cols-2 gap-8 items-start">
                
                {/* LEFT COLUMN: DESCRIPTION */}
                <div className="bg-black/20 rounded-xl p-6 border border-white/10">
                  <h3 className="text-2xl font-semibold mb-3 text-cyan-400">
                    למה הטראק הזה?
                  </h3>
                  <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-line">
                    {track.description}
                  </p>
                </div>
                
                {/* RIGHT COLUMN: SUBMITTER & CTA */}
                <div className="space-y-6">
                  
                  {/* Submitter Card */}
                  <div className="glass rounded-xl p-4 text-center">
                    <h4 className="text-sm font-medium text-white/60 mb-2">נבחר על ידי:</h4>
                    <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-purple-500/50 bg-gray-700 mx-auto mb-3">
                      {track.photo_url ? (
                        <img
                          src={track.photo_url}
                          alt={`Photo of ${track.name}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                             // Fallback to emoji if image fails
                             e.currentTarget.style.display = 'none';
                             const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                             if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl text-gray-500">
                          👤
                        </div>
                      )}
                    </div>
                    <p className="text-xl font-bold text-purple-400">{track.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(track.created_at).toLocaleDateString('he-IL')}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <a
                      href={track.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full btn-primary px-8 py-4 rounded-lg text-lg font-medium flex items-center justify-center gap-2"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      <span>האזינו ב־YouTube</span>
                    </a>
                    
                    <Link
                      href="/submit-track"
                      className="w-full btn-secondary px-8 py-4 rounded-lg text-lg font-medium text-center"
                    >
                      הגישו טראק משלכם!
                    </Link>
                  </div>
                </div>
                
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-12 text-center">
              <div className="text-6xl mb-6">🎵</div>
              <p className="text-2xl font-semibold text-gray-400 mb-4">
                אין עדיין טראק שבועי מאושר
              </p>
              <p className="text-lg text-gray-500 mb-8">
                אתם מוזמנים להגיש המלצה משלכם!
              </p>
              <Link
                href="/submit-track"
                className="btn-primary px-8 py-4 rounded-lg font-medium text-lg inline-block"
              >
                הגישו טראק עכשיו
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<TrackPageProps> = async () => {
  try {
    const supabase = require('../lib/supabaseServer').default;
    const { data, error } = await supabase
      .from('track_of_the_week_submissions')
      .select('*')
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Supabase fetch error:', error);
      return {
        props: {
          track: null,
          error: `שגיאת מסד נתונים: ${error.message}`,
        },
      };
    }

    const track = data as TrackSubmission || null;

    return {
      props: {
        track: track,
        error: null,
      },
    };
  } catch (e: any) {
    console.error('getServerSideProps execution error:', e);
    return {
      props: {
        track: null,
        error: `שגיאה בשרת: ${e.message}`,
      },
    };
  }
};

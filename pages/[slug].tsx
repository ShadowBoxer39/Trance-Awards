// pages/[slug].tsx - Artist Profile Page
import Head from "next/head";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { createClient } from "@supabase/supabase-js";
import Navigation from "../components/Navigation";

// ==========================================
// TYPES
// ==========================================

interface Artist {
  id: number;
  slug: string;
  name: string;
  stage_name: string;
  bio: string;
  profile_photo_url: string | null;
  cover_photo_url: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  soundcloud_url: string | null;
  spotify_url: string | null;
  youtube_url: string | null;
  tiktok_url: string | null;
  twitter_url: string | null;
  website_url: string | null;
  genre: string | null;
  country: string | null;
  city: string | null;
  total_episodes: number;
}

interface Episode {
  id: number;
  youtube_video_id: string;
  episode_number: number | null;
  title: string;
  clean_title: string;
  description: string;
  thumbnail_url: string;
  published_at: string;
  duration: number | null;
  view_count: number | null;
  is_special: boolean;
  role: string;
}

interface ArtistPageProps {
  artist: Artist;
  episodes: Episode[];
}

// ==========================================
// COMPONENT
// ==========================================

export default function ArtistPage({ artist, episodes }: ArtistPageProps) {
  const displayName = artist.stage_name || artist.name;

  return (
    <>
      <Head>
        <title>{displayName} - יוצאים לטראק</title>
        <meta
          name="description"
          content={`כל הפרקים עם ${displayName}. ${artist.bio || ""}`}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/images/logo.png" />
        
        {/* Open Graph / Social Media */}
        <meta property="og:title" content={`${displayName} - יוצאים לטראק`} />
        <meta property="og:description" content={artist.bio || `כל הפרקים עם ${displayName}`} />
        {artist.profile_photo_url && (
          <meta property="og:image" content={artist.profile_photo_url} />
        )}
        <meta property="og:type" content="profile" />
      </Head>

      <div className="trance-backdrop min-h-screen text-gray-100">
        <Navigation currentPage="artists" />

        {/* Cover Photo */}
        {artist.cover_photo_url && (
          <div className="relative w-full h-64 md:h-80 overflow-hidden">
            <img
              src={artist.cover_photo_url}
              alt={`${displayName} cover`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black"></div>
          </div>
        )}

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 -mt-20 relative z-10">
          <div className="glass-card rounded-2xl p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              
              {/* Profile Photo */}
              <div className="relative">
                {artist.profile_photo_url ? (
                  <img
                    src={artist.profile_photo_url}
                    alt={displayName}
                    className="w-40 h-40 md:w-48 md:h-48 rounded-full object-cover border-4 border-purple-500/50 shadow-2xl"
                  />
                ) : (
                  <div className="w-40 h-40 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center border-4 border-purple-500/50 shadow-2xl">
                    <span className="text-6xl font-bold text-white">
                      {displayName.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              {/* Artist Info */}
              <div className="flex-1 text-center md:text-right">
                {/* Name */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3">
                  <span className="gradient-text">{displayName}</span>
                </h1>

                {/* Real Name (if different) */}
                {artist.stage_name && artist.name !== artist.stage_name && (
                  <p className="text-xl text-gray-400 mb-4">{artist.name}</p>
                )}

                {/* Genre & Location */}
                <div className="flex flex-wrap justify-center md:justify-end gap-3 mb-6">
                  {artist.genre && (
                    <span className="px-4 py-2 bg-purple-600/30 rounded-full text-sm">
                      {artist.genre}
                    </span>
                  )}
                  {artist.city && artist.country && (
                    <span className="px-4 py-2 bg-cyan-600/30 rounded-full text-sm">
                      {artist.city}, {artist.country}
                    </span>
                  )}
                </div>

                {/* Bio */}
                {artist.bio && (
                  <p className="text-lg text-gray-300 leading-relaxed mb-6 max-w-3xl mx-auto md:mx-0">
                    {artist.bio}
                  </p>
                )}

                {/* Social Links */}
                <div className="flex flex-wrap justify-center md:justify-end gap-3">
                  {artist.instagram_url && (
                    <a
                      href={artist.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary p-3 rounded-lg hover:scale-110 transition-transform"
                      aria-label="Instagram"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </a>
                  )}

                  {artist.facebook_url && (
                    <a
                      href={artist.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary p-3 rounded-lg hover:scale-110 transition-transform"
                      aria-label="Facebook"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                  )}

                  {artist.soundcloud_url && (
                    <a
                      href={artist.soundcloud_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary p-3 rounded-lg hover:scale-110 transition-transform"
                      aria-label="SoundCloud"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7 17.939h-1v-8.068c.308-.231.639-.429 1-.566v8.634zm3 0h1v-9.224c-.229.265-.443.548-.621.857l-.379-.184v8.551zm-2 0h1v-8.848c-.508-.079-.623-.05-1-.01v8.858zm-4 0h1v-7.02c-.312.458-.555.971-.692 1.535l-.308-.182v5.667zm-3-5.25c-.606.547-1 1.354-1 2.268 0 .914.394 1.721 1 2.268v-4.536zm18.879-.671c-.204-2.837-2.404-5.079-5.117-5.079-1.022 0-1.964.328-2.762.877v10.123h9.089c1.607 0 2.911-1.393 2.911-3.106 0-2.233-2.168-3.772-4.121-2.815zm-16.879-.027c-.302-.024-.526-.03-1 .122v5.689c.446.143.636.138 1 .138v-5.949z"/>
                      </svg>
                    </a>
                  )}

                  {artist.spotify_url && (
                    <a
                      href={artist.spotify_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary p-3 rounded-lg hover:scale-110 transition-transform"
                      aria-label="Spotify"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                      </svg>
                    </a>
                  )}

                  {artist.youtube_url && (
                    <a
                      href={artist.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary p-3 rounded-lg hover:scale-110 transition-transform"
                      aria-label="YouTube"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </a>
                  )}

                  {artist.website_url && (
                    <a
                      href={artist.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary p-3 rounded-lg hover:scale-110 transition-transform"
                      aria-label="Website"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Episodes Section */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              פרקים עם <span className="gradient-text">{displayName}</span>
            </h2>
            <p className="text-gray-400 text-lg">
              {artist.total_episodes} {artist.total_episodes === 1 ? "פרק" : "פרקים"}
            </p>
          </div>

          {episodes.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🎵</div>
              <p className="text-xl text-gray-400">אין פרקים זמינים כרגע</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {episodes.map((episode) => (
                <a
                  key={episode.id}
                  href={`https://www.youtube.com/watch?v=${episode.youtube_video_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-card rounded-xl overflow-hidden hover:scale-105 transition-transform group"
                >
                  {/* Thumbnail */}
                  <div className="aspect-video bg-gray-800 relative overflow-hidden">
                    <img
                      src={episode.thumbnail_url}
                      alt={episode.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                    
                    {/* Episode Number Badge */}
                    {episode.episode_number && (
                      <div className="absolute top-3 right-3 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        #{episode.episode_number}
                      </div>
                    )}

                    {/* Special Badge */}
                    {episode.is_special && (
                      <div className="absolute top-3 left-3 bg-cyan-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        מיוחד
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="text-base font-semibold mb-2 line-clamp-2 group-hover:text-purple-400 transition">
                      {episode.clean_title || episode.title}
                    </h3>
                    
                    {/* Role Badge */}
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                      <span className="px-2 py-1 bg-purple-600/30 rounded">
                        {episode.role}
                      </span>
                      <span>
                        {new Date(episode.published_at).toLocaleDateString('he-IL')}
                      </span>
                    </div>

                    {/* Stats */}
                    {episode.view_count && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                        </svg>
                        <span>{episode.view_count.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>

        {/* Back to Episodes */}
        <section className="max-w-7xl mx-auto px-6 pb-16">
          <Link href="/episodes">
            <span className="btn-secondary px-8 py-4 rounded-lg font-medium text-lg inline-flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              חזרה לכל הפרקים
            </span>
          </Link>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-800 mt-16">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
              <div>© 2025 יוצאים לטראק</div>
              <div className="flex gap-6">
                <Link href="/" className="hover:text-gray-300 transition">בית</Link>
                <Link href="/episodes" className="hover:text-gray-300 transition">פרקים</Link>
                <Link href="/track-of-the-week" className="hover:text-gray-300 transition">טראק השבוע</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

// ==========================================
// SERVER-SIDE DATA FETCHING
// ==========================================

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const slug = params?.slug as string;

  // Reserved slugs that should not be artist pages
  const reservedSlugs = [
    'episodes',
    'admin',
    'track-of-the-week',
    'about',
    'api',
    'young-artists',
    '_next',
    'images',
    'favicon.ico',
  ];

  if (reservedSlugs.includes(slug)) {
    return { notFound: true };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Fetch artist
    const { data: artist, error: artistError } = await supabase
      .from('artists')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (artistError || !artist) {
      return { notFound: true };
    }

    // Fetch artist's episodes
    const { data: episodesData, error: episodesError } = await supabase
      .from('artist_episodes')
      .select(`
        role,
        episode_id,
        episodes (
          id,
          youtube_video_id,
          episode_number,
          title,
          clean_title,
          description,
          thumbnail_url,
          published_at,
          duration,
          view_count,
          is_special
        )
      `)
      .eq('artist_id', artist.id)
      .order('episode_id', { ascending: true });

    if (episodesError) {
      console.error('Error fetching episodes:', episodesError);
    }

    // Transform episodes data
    const episodes = (episodesData || []).map((item: any) => ({
      ...item.episodes,
      role: item.role,
    }));

    return {
      props: {
        artist,
        episodes,
      },
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return { notFound: true };
  }
};

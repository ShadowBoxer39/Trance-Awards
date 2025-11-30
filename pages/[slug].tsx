// pages/[slug].tsx - Music-Focused Artist Page
import React from "react";
import Head from "next/head";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { createClient } from "@supabase/supabase-js";
import Navigation from "../components/Navigation";
import { getArtistProfile, getArtistTopTracks } from "../lib/spotify";
import { 
  FaInstagram, 
  FaFacebook, 
  FaSoundcloud, 
  FaSpotify, 
  FaYoutube, 
  FaGlobe,
  FaPlay,
  FaExternalLinkAlt
} from 'react-icons/fa';

// ==========================================
// TYPES
// ==========================================

interface FestivalSet {
  title: string;
  youtube_id: string;
  thumbnail: string;
  festival: string;
  year: string;
  location: string;
}

interface Artist {
  id: number;
  slug: string;
  name: string;
  stage_name: string;
  short_bio: string;
  profile_photo_url: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  soundcloud_url: string | null;
  soundcloud_profile_url: string | null;
  spotify_url: string | null;
  youtube_url: string | null;
  website_url: string | null;
  genre: string | null;
  spotify_artist_id: string | null;
  instagram_reels: string[];
  festival_sets: FestivalSet[];
  primary_color: string;
}

interface Episode {
  id: number;
  youtube_video_id: string;
  episode_number: number | null;
  title: string;
  clean_title: string;
  thumbnail_url: string;
  published_at: string;
  view_count: number | null;
}

interface SpotifyTrack {
  name: string;
  album: {
    name: string;
    images: { url: string }[];
    release_date: string;
  };
  external_urls: {
    spotify: string;
  };
  preview_url: string | null;
}

interface ArtistPageProps {
  artist: Artist;
  episode: Episode | null;
  spotifyTracks: SpotifyTrack[];
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function ArtistPage({ artist, episode, spotifyTracks }: ArtistPageProps) {
  const displayName = artist.stage_name || artist.name;

  const socialLinks = [
    { icon: FaInstagram, url: artist.instagram_url, label: 'Instagram', color: 'hover:text-pink-400' },
    { icon: FaSoundcloud, url: artist.soundcloud_url, label: 'SoundCloud', color: 'hover:text-orange-400' },
    { icon: FaSpotify, url: artist.spotify_url, label: 'Spotify', color: 'hover:text-green-400' },
    { icon: FaYoutube, url: artist.youtube_url, label: 'YouTube', color: 'hover:text-red-400' },
    { icon: FaFacebook, url: artist.facebook_url, label: 'Facebook', color: 'hover:text-blue-400' },
    { icon: FaGlobe, url: artist.website_url, label: 'Website', color: 'hover:text-purple-400' },
  ].filter(link => link.url);

  return (
    <>
      <Head>
        <title>{displayName} - יוצאים לטראק</title>
        <meta name="description" content={artist.short_bio || `${displayName} - Israeli Trance Artist`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/images/logo.png" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0f0514] to-[#0a0a0a] text-white">
        {/* Navigation */}
        <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
          <Navigation currentPage="episodes" />
        </div>

        {/* Compact Hero */}
        <section className="relative py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Profile Photo */}
              <div className="relative flex-shrink-0">
                <div className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-purple-500/50 shadow-2xl shadow-purple-500/20">
                  {artist.profile_photo_url ? (
                    <img
                      src={artist.profile_photo_url}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center">
                      <span className="text-6xl font-bold">{displayName[0]}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-right">
                <h1 className="text-5xl md:text-6xl font-black mb-3 bg-gradient-to-l from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  {displayName}
                </h1>
                {artist.genre && (
                  <div className="mb-4">
                    <span className="inline-block px-4 py-1.5 bg-purple-500/20 border border-purple-500/50 rounded-full text-purple-300 text-sm font-semibold">
                      {artist.genre}
                    </span>
                  </div>
                )}
                {artist.short_bio && (
                  <p className="text-gray-300 text-lg mb-6 max-w-2xl mx-auto md:mx-0">
                    {artist.short_bio}
                  </p>
                )}

                {/* Social Links - Horizontal */}
                {socialLinks.length > 0 && (
                  <div className="flex flex-wrap justify-center md:justify-end gap-4">
                    {socialLinks.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-gray-400 ${link.color} transition-colors`}
                        title={link.label}
                      >
                        <link.icon className="text-2xl" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Main Content - 2 Column Layout on Desktop */}
        <section className="py-8 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* LEFT COLUMN - MUSIC */}
              <div className="space-y-8">
                
                {/* SoundCloud Player */}
                {artist.soundcloud_profile_url && (
                  <div className="card-glass">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                      <FaSoundcloud className="text-orange-500 text-3xl" />
                      <span className="gradient-text">Latest Tracks</span>
                    </h2>
                    <div className="rounded-xl overflow-hidden">
                      <iframe
                        width="100%"
                        height="450"
                        scrolling="no"
                        frameBorder="no"
                        allow="autoplay"
                        src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(artist.soundcloud_profile_url)}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true`}
                      />
                    </div>
                  </div>
                )}

                {/* Spotify Tracks */}
                {spotifyTracks.length > 0 && (
                  <div className="card-glass">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                      <FaSpotify className="text-green-500 text-3xl" />
                      <span className="gradient-text">Latest Releases</span>
                    </h2>
                    <div className="space-y-3">
                      {spotifyTracks.slice(0, 5).map((track, index) => (
                        <a
                          key={index}
                          href={track.external_urls.spotify}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all group"
                        >
                          <img
                            src={track.album.images[0]?.url}
                            alt={track.album.name}
                            className="w-16 h-16 rounded-md"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-white truncate group-hover:text-green-400 transition-colors">
                              {track.name}
                            </div>
                            <div className="text-sm text-gray-400 truncate">
                              {track.album.name}
                            </div>
                          </div>
                          <FaExternalLinkAlt className="text-gray-400 group-hover:text-green-400 transition-colors" />
                        </a>
                      ))}
                    </div>
                    {artist.spotify_url && (
                      <div className="mt-4">
                        <a
                          href={artist.spotify_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary w-full"
                        >
                          <FaSpotify className="text-xl" />
                          <span>View Full Discography on Spotify</span>
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Quick Listen Buttons */}
                <div className="card-glass">
                  <h3 className="text-xl font-bold mb-4 text-gray-300">Listen Now</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {artist.spotify_url && (
                      <a
                        href={artist.spotify_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary"
                      >
                        <FaSpotify className="text-xl" />
                        <span>Spotify</span>
                      </a>
                    )}
                    {artist.soundcloud_url && (
                      <a
                        href={artist.soundcloud_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary"
                      >
                        <FaSoundcloud className="text-xl" />
                        <span>SoundCloud</span>
                      </a>
                    )}
                    {artist.youtube_url && (
                      <a
                        href={artist.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary"
                      >
                        <FaYoutube className="text-xl" />
                        <span>YouTube</span>
                      </a>
                    )}
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN - VISUAL CONTENT */}
              <div className="space-y-8">

                {/* Festival Sets - MUST SHOW if available */}
                {artist.festival_sets && artist.festival_sets.length > 0 && (
                  <div className="card-glass">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                      <FaPlay className="text-red-500 text-2xl" />
                      <span className="gradient-text">Festival Sets</span>
                    </h2>
                    <div className="space-y-4">
                      {artist.festival_sets.map((set, index) => (
                        <div key={index} className="group">
                          <a
                            href={`https://www.youtube.com/watch?v=${set.youtube_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block relative rounded-xl overflow-hidden"
                          >
                            <img
                              src={set.thumbnail}
                              alt={set.title}
                              className="w-full aspect-video object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                                <FaPlay className="text-white text-2xl ml-1" />
                              </div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                              <div className="font-bold text-white mb-1">{set.title}</div>
                              <div className="text-sm text-gray-300">
                                {set.festival} • {set.year} • {set.location}
                              </div>
                            </div>
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Track Trip Episode */}
                {episode && (
                  <div className="card-glass">
                    <h2 className="text-2xl font-bold mb-4 gradient-text">
                      פרק ב-Track Trip
                    </h2>
                    <a
                      href={`https://www.youtube.com/watch?v=${episode.youtube_video_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group"
                    >
                      <div className="relative rounded-xl overflow-hidden mb-4">
                        <img
                          src={episode.thumbnail_url}
                          alt={episode.title}
                          className="w-full aspect-video object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
                            <FaPlay className="text-white text-2xl ml-1" />
                          </div>
                        </div>
                        {episode.episode_number && (
                          <div className="absolute top-4 right-4 bg-purple-600 px-3 py-1 rounded-full font-bold">
                            #{episode.episode_number}
                          </div>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors mb-2">
                        {episode.clean_title || episode.title}
                      </h3>
                      <div className="text-gray-400 text-sm">
                        {new Date(episode.published_at).toLocaleDateString('he-IL')}
                        {episode.view_count && ` • ${episode.view_count.toLocaleString()} צפיות`}
                      </div>
                    </a>
                  </div>
                )}

                {/* Instagram Reels - Horizontal Grid */}
                {artist.instagram_reels && artist.instagram_reels.length > 0 && (
                  <div className="card-glass">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                      <FaInstagram className="text-pink-500 text-3xl" />
                      <span className="gradient-text">Instagram</span>
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {artist.instagram_reels.slice(0, 4).map((reelUrl, index) => (
                        <div key={index} className="rounded-xl overflow-hidden">
                          <iframe
                            src={`${reelUrl}embed`}
                            className="w-full h-[500px]"
                            frameBorder="0"
                            scrolling="no"
                            allowTransparency={true}
                            allow="encrypted-media"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

            </div>
          </div>
        </section>

        {/* Back Link */}
        <section className="py-12 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <Link href="/episodes">
              <span className="inline-block px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 rounded-full transition-all cursor-pointer">
                ← חזרה לכל הפרקים
              </span>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-black/50">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-gray-400 text-sm">
              <div>© 2025 יוצאים לטראק</div>
              <div className="flex gap-6">
                <Link href="/" className="hover:text-white transition">בית</Link>
                <Link href="/episodes" className="hover:text-white transition">פרקים</Link>
                <Link href="/track-of-the-week" className="hover:text-white transition">טראק השבוע</Link>
              </div>
            </div>
          </div>
        </footer>

        {/* Styles */}
        <style jsx>{`
          .card-glass {
            background: rgba(17, 24, 39, 0.6);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 1.5rem;
            padding: 2rem;
            transition: all 0.3s;
          }

          .card-glass:hover {
            border-color: rgba(147, 51, 234, 0.3);
            box-shadow: 0 10px 40px rgba(147, 51, 234, 0.1);
          }

          .gradient-text {
            background: linear-gradient(90deg, #a78bfa, #ec4899, #06b6d4);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          .btn-primary {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            padding: 1rem 2rem;
            background: linear-gradient(135deg, #8b5cf6, #06b6d4);
            border-radius: 9999px;
            font-weight: 700;
            transition: all 0.3s;
            box-shadow: 0 4px 20px rgba(139, 92, 246, 0.3);
          }

          .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 30px rgba(139, 92, 246, 0.5);
          }

          .btn-secondary {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            padding: 0.875rem 1.5rem;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 9999px;
            font-weight: 600;
            transition: all 0.3s;
          }

          .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: rgba(147, 51, 234, 0.5);
            transform: translateY(-2px);
          }
        `}</style>
      </div>
    </>
  );
}

// ==========================================
// SERVER-SIDE DATA FETCHING
// ==========================================

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const slug = params?.slug as string;

  const reservedSlugs = [
    'episodes', 'admin', 'track-of-the-week', 'about', 'api',
    'young-artists', '_next', 'images', 'favicon.ico',
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

    // Fetch first episode (most artists have only one)
    const { data: episodesData } = await supabase
      .from('artist_episodes')
      .select(`
        episodes (
          id, youtube_video_id, episode_number, title, clean_title,
          thumbnail_url, published_at, view_count
        )
      `)
      .eq('artist_id', artist.id)
      .order('episode_id', { ascending: false })
      .limit(1)
      .single();

    const episode = episodesData?.episodes || null;

    // Fetch Spotify tracks
    let spotifyTracks: SpotifyTrack[] = [];
    let spotifyProfileImage = null;

    if (artist.spotify_artist_id) {
      try {
        const [profile, tracks] = await Promise.all([
          getArtistProfile(artist.spotify_artist_id),
          getArtistTopTracks(artist.spotify_artist_id)
        ]);

        if (profile) {
          spotifyProfileImage = profile.image;
        }

        if (tracks && Array.isArray(tracks)) {
          spotifyTracks = tracks;
        }
      } catch (error) {
        console.error('Spotify API error:', error);
      }
    }

    const artistWithData = {
      ...artist,
      profile_photo_url: spotifyProfileImage || artist.profile_photo_url,
      festival_sets: artist.festival_sets || [],
      instagram_reels: artist.instagram_reels || [],
    };

    return {
      props: {
        artist: artistWithData,
        episode,
        spotifyTracks,
      },
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return { notFound: true };
  }
};

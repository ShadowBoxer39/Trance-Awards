// pages/[slug].tsx - THE NEW PREMIUM ARTIST HUB

import React, { useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { createClient } from "@supabase/supabase-js";
import Navigation from "../components/Navigation";
import { getArtistProfile, getArtistTopTracks, getArtistDiscography } from "../lib/spotify";
import { 
  FaInstagram, 
  FaFacebook, 
  FaSoundcloud, 
  FaSpotify, 
  FaYoutube, 
  FaGlobe,
  FaPlay,
  FaMusic,
  FaCompactDisc,
  FaStar,
  FaBroadcastTower
} from 'react-icons/fa';

// ==========================================
// TYPES (Reusing existing structures)
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
  id: string;
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
  duration: number;
}

interface SpotifyDiscographyItem {
    id: string;
    name: string;
    releaseDate: string;
    type: 'album' | 'single';
    coverImage: string;
    spotifyUrl: string;
    totalTracks: number;
}

interface ArtistPageProps {
  artist: Artist;
  episode: Episode | null;
  spotifyTopTracks: SpotifyTrack[];
  spotifyDiscography: SpotifyDiscographyItem[];
  spotifyProfile: { followers: number, popularity: number } | null;
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function ArtistPage({ 
  artist, 
  episode, 
  spotifyTopTracks, 
  spotifyDiscography,
  spotifyProfile
}: ArtistPageProps) {
  
  const displayName = artist.stage_name || artist.name;
  const accentColor = artist.primary_color || '#8b5cf6'; // Default Purple
  
  // Custom CSS variable for dynamic styling
  const dynamicStyle = { 
    '--accent-color': accentColor,
  } as React.CSSProperties;

  const socialLinks = [
    { icon: FaInstagram, url: artist.instagram_url, label: 'Instagram', color: 'text-pink-400', hover: 'hover:text-pink-300' },
    { icon: FaSoundcloud, url: artist.soundcloud_profile_url, label: 'SoundCloud', color: 'text-orange-400', hover: 'hover:text-orange-300' },
    { icon: FaSpotify, url: artist.spotify_url, label: 'Spotify', color: 'text-green-400', hover: 'hover:text-green-300' },
    { icon: FaYoutube, url: artist.youtube_url, label: 'YouTube', color: 'text-red-400', hover: 'hover:text-red-300' },
    { icon: FaFacebook, url: artist.facebook_url, label: 'Facebook', color: 'text-blue-400', hover: 'hover:text-blue-300' },
    { icon: FaGlobe, url: artist.website_url, label: 'Website', color: 'text-purple-400', hover: 'hover:text-purple-300' },
  ].filter(link => link.url);

  // Use the global useEffect for RTL from _app.tsx or local if needed
  useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
  }, []);
  
  // --- Custom Style Block for Dynamic Accent ---
  const customStyles = `
    .trance-backdrop {
      background: radial-gradient(circle at top right, color-mix(in srgb, var(--accent-color) 15%, transparent) 40%),
                  radial-gradient(circle at bottom left, rgba(17, 24, 39, 0.8), transparent 60%),
                  #0f0f1a;
      transition: all 0.5s ease-out;
    }
    .hero-glow {
      box-shadow: 0 0 40px 10px color-mix(in srgb, var(--accent-color) 40%, transparent);
      border-color: var(--accent-color);
    }
    .card-glass-accent {
      border-left: 5px solid var(--accent-color);
      box-shadow: 0 4px 15px -5px color-mix(in srgb, var(--accent-color) 20%, transparent);
      transition: all 0.3s ease;
    }
    .card-glass-accent:hover {
      border-color: color-mix(in srgb, var(--accent-color) 80%, #ffffff);
      transform: translateY(-3px) scale(1.01);
      box-shadow: 0 15px 30px -5px color-mix(in srgb, var(--accent-color) 30%, transparent);
    }
    .text-accent-dynamic {
        color: var(--accent-color);
    }
    .border-accent-dynamic {
        border-color: var(--accent-color);
    }
    .btn-live-set:hover {
        box-shadow: 0 0 15px 0px rgba(255, 0, 0, 0.5);
    }
  `;
  // --- End Custom Style Block ---


  return (
    <>
      <Head>
        <title>{displayName} - יוצאים לטראק</title>
        <meta name="description" content={artist.short_bio || `${displayName} - אמן טראנס ישראלי`} />
      </Head>
      
      {/* Dynamic Style injection */}
      <style jsx global>{customStyles}</style>

      <div className="min-h-screen trance-backdrop text-white" style={dynamicStyle}>
        
        <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
          <Navigation currentPage="episodes" />
        </div>

        {/* HERO SECTION - HIGH IMPACT & STATS */}
        <section className="relative py-16 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto z-10 relative">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
              
              {/* Profile Photo */}
              <div className="relative flex-shrink-0 order-1">
                <div className="w-56 h-56 md:w-64 md:h-64 rounded-full overflow-hidden border-4 hero-glow transition-all duration-500">
                  {artist.profile_photo_url ? (
                    <img
                      src={artist.profile_photo_url}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center">
                      <span className="text-8xl font-black">{displayName[0]}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Info & Title */}
              <div className="flex-1 text-center md:text-right order-2">
                <span className="inline-block px-4 py-1.5 bg-white/10 border border-white/20 rounded-full text-white/70 text-sm font-semibold mb-3">
                  {artist.genre || 'Psytrance'}
                </span>
                
                <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black mb-3 gradient-hero-text">
                  {displayName}
                </h1>
                
                <p className="text-gray-300 text-xl lg:text-2xl mb-6 max-w-2xl mx-auto md:mx-0 font-light leading-relaxed">
                  {artist.short_bio || "אמן טראנס ישראלי פורץ דרך, מפיק סאונד ייחודי המשלב אנרגיה גבוהה עם עומק מלודי."}
                </p>

                {/* Spotify Stats & Socials */}
                <div className="flex flex-wrap justify-center md:justify-end gap-6 pt-4 border-t border-white/10">
                    
                    {/* Social Links */}
                    <div className="flex flex-wrap justify-center md:justify-end gap-4">
                        {socialLinks.map((link, index) => (
                        <a
                            key={index}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-3xl transition-colors ${link.color} ${link.hover}`}
                            title={link.label}
                        >
                            <link.icon />
                        </a>
                        ))}
                    </div>

                    {/* Spotify Stats (if available) */}
                    {spotifyProfile && (
                        <div className="flex gap-6 text-right border-r border-white/10 pr-6">
                            <div>
                                <div className="text-3xl font-bold text-cyan-400 tabular-nums">{spotifyProfile.followers.toLocaleString()}</div>
                                <div className="text-xs text-gray-400">עוקבים (Spotify)</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-cyan-400 tabular-nums">{spotifyProfile.popularity}</div>
                                <div className="text-xs text-gray-400">פופולריות (100)</div>
                            </div>
                        </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MAIN CONTENT - 2 COLUMN GRID */}
        <section className="py-8 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* COLUMN 1: VIDEO MEDIA CENTER (Sets & Episodes) */}
              <div className="lg:col-span-1 space-y-8">
                
                <h2 className="text-3xl font-black mb-6 flex items-center gap-3 text-red-500">
                    <FaBroadcastTower className="text-4xl" />
                    <span className="text-white">Media Center</span>
                </h2>

                {/* Festival Sets - HIGHLIGHTED */}
                {artist.festival_sets && artist.festival_sets.length > 0 && (
                  <div className="glass-card p-6 rounded-2xl">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-400">
                        <FaStar className="text-2xl" />
                        הסטים הכי חזקים מיוטיוב
                    </h3>
                    <div className="space-y-4">
                      {artist.festival_sets.slice(0, 3).map((set, index) => (
                        <a
                          key={index}
                          href={`https://www.youtube.com/watch?v=${set.youtube_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block relative rounded-xl overflow-hidden group transition-all hover-shadow btn-live-set"
                        >
                          <img
                            src={set.thumbnail}
                            alt={set.title}
                            className="w-full aspect-video object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-4">
                            <div>
                              <div className="font-bold text-white mb-1">{set.title}</div>
                              <div className="text-sm text-gray-300">
                                {set.festival} • {set.year}
                              </div>
                            </div>
                            <FaPlay className="text-red-500 text-3xl ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Track Trip Episode */}
                {episode && (
                  <div className="glass-card p-6 rounded-2xl card-glass-accent">
                    <h3 className="text-xl font-bold mb-4 text-purple-400 flex items-center gap-2">
                        <FaYoutube className="text-2xl" />
                        ראיון מלא ב-Track Trip
                    </h3>
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
                        <div className="absolute top-4 right-4 bg-purple-600 px-3 py-1 rounded-full font-bold">
                          #{episode.episode_number || 'N/A'}
                        </div>
                        <FaPlay className="absolute inset-0 m-auto w-16 h-16 text-white bg-black/50 rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <h4 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors mb-2">
                        {episode.clean_title || episode.title}
                      </h4>
                      <div className="text-gray-400 text-sm">
                        {new Date(episode.published_at).toLocaleDateString('he-IL')}
                        {episode.view_count && ` • ${episode.view_count.toLocaleString()} צפיות`}
                      </div>
                    </a>
                  </div>
                )}
              </div>

              {/* COLUMN 2: MUSIC HUB (Spotify & SoundCloud) */}
              <div className="lg:col-span-1 space-y-8">
                  
                <h2 className="text-3xl font-black mb-6 flex items-center gap-3 text-green-500">
                    <FaMusic className="text-4xl" />
                    <span className="text-white">Music Hub</span>
                </h2>

                {/* Spotify Top Tracks */}
                {spotifyTopTracks.length > 0 && (
                  <div className="glass-card p-6 rounded-2xl">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-green-400">
                        <FaSpotify className="text-2xl" />
                        הכי מושמעים ב-Spotify
                    </h3>
                    <div className="space-y-4">
                      {spotifyTopTracks.map((track, index) => (
                        <a
                          key={track.id}
                          href={track.external_urls.spotify}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all group card-glass-accent"
                        >
                            <span className="text-2xl font-bold text-accent-dynamic">{index + 1}.</span>
                          <img
                            src={track.album.images[0]?.url}
                            alt={track.album.name}
                            className="w-12 h-12 rounded-md flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-white truncate group-hover:text-green-400 transition-colors">
                              {track.name}
                            </div>
                            <div className="text-xs text-gray-400 truncate">
                              {track.album.name}
                            </div>
                          </div>
                          <FaPlay className="text-green-400 flex-shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* SoundCloud Player Embed (Highlight) */}
                {artist.soundcloud_profile_url && (
                    <div className="glass-card p-6 rounded-2xl">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-orange-400">
                            <FaSoundcloud className="text-2xl" />
                            השמעה מהירה
                        </h3>
                        <div className="rounded-xl overflow-hidden border border-orange-400/30 shadow-lg shadow-orange-500/10">
                            <iframe
                                width="100%"
                                height="250"
                                scrolling="no"
                                frameBorder="no"
                                allow="autoplay"
                                src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(artist.soundcloud_profile_url)}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true`}
                            />
                        </div>
                    </div>
                )}
                
                {/* Full Discography List */}
                {spotifyDiscography.length > 0 && (
                  <div className="glass-card p-6 rounded-2xl">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white/80">
                      <FaCompactDisc className="text-2xl text-cyan-400" />
                      דיסקוגרפיה
                    </h3>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                        {spotifyDiscography.slice(0, 10).map((album, index) => (
                            <a
                                key={index}
                                href={album.spotifyUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition border border-white/5 hover:border-cyan-400/30"
                            >
                                <img
                                    src={album.coverImage}
                                    alt={album.name}
                                    className="w-12 h-12 rounded-sm flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-white truncate">{album.name}</div>
                                    <div className="text-xs text-gray-400">{album.type === 'album' ? 'אלבום' : 'סינגל'} • {new Date(album.releaseDate).getFullYear()}</div>
                                </div>
                                <span className="text-xs text-cyan-400 font-semibold">{album.totalTracks} טרקים</span>
                            </a>
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
              <span className="inline-block px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-accent-dynamic rounded-full transition-all cursor-pointer">
                ← חזרה לכל הפרקים
              </span>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-black/50 mt-16">
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
      </div>
    </>
  );
}

// ==========================================
// SERVER-SIDE DATA FETCHING (Updated to fetch all Spotify data)
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
    // 1. Fetch artist
    const { data: artist, error: artistError } = await supabase
      .from('artists')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (artistError || !artist) {
      return { notFound: true };
    }

    // 2. Fetch episode (most recent)
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

    // 3. Fetch Spotify data (All required data)
    let spotifyTopTracks: SpotifyTrack[] = [];
    let spotifyDiscography: SpotifyDiscographyItem[] = [];
    let spotifyProfile: { followers: number, popularity: number } | null = null;
    let spotifyProfileImage = artist.profile_photo_url; 

    if (artist.spotify_artist_id) {
      try {
        const [profile, topTracks, discography] = await Promise.all([
          getArtistProfile(artist.spotify_artist_id),
          getArtistTopTracks(artist.spotify_artist_id),
          getArtistDiscography(artist.spotify_artist_id),
        ]);

        if (profile) {
          spotifyProfile = {
            followers: profile.followers,
            popularity: profile.popularity,
          };
          if (profile.image) {
              spotifyProfileImage = profile.image;
          }
        }

        if (topTracks && Array.isArray(topTracks)) {
          spotifyTopTracks = topTracks as SpotifyTrack[];
        }

        if (discography && Array.isArray(discography)) {
            // Deduplicate logic for cleaner display
            const uniqueDiscography = discography.filter((item, index, self) => 
                index === self.findIndex((t) => (
                    t.name === item.name && t.releaseDate === item.releaseDate
                ))
            );
            spotifyDiscography = uniqueDiscography as SpotifyDiscographyItem[];
        }

      } catch (error) {
        console.error('Spotify API error in SSR:', error);
      }
    }

    // 4. Finalize artist data
    const artistWithData = {
      ...artist,
      profile_photo_url: spotifyProfileImage,
      festival_sets: artist.festival_sets || [],
      instagram_reels: artist.instagram_reels || [],
    };

    return {
      props: {
        artist: artistWithData,
        episode,
        spotifyTopTracks,
        spotifyDiscography,
        spotifyProfile,
      },
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return { notFound: true };
  }
};

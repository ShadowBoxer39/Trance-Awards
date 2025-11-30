// pages/[slug].tsx - V12: ALL IMPROVEMENTS + FIXES

import React, { useEffect, useState } from "react";
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
  FaBroadcastTower,
  FaArrowRight,
  FaCalendarAlt,
  FaBriefcase,
  FaEnvelope, 
  FaExternalLinkAlt, 
  FaExclamationTriangle,
  FaPause,
  FaVolumeUp
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
  duration_min?: number; 
  views?: number; 
}

interface Achievement {
    icon: string;
    year: string;
    title: string;
    description: string;
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
  booking_company: string;
  record_label: string;
  achievements: Achievement[];
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
}

// ==========================================
// UTILITY COMPONENTS
// ==========================================

const LiveSetCard: React.FC<{ set: FestivalSet, isFeatured: boolean }> = ({ set, isFeatured }) => {
    const mockDuration = set.duration_min || 75;
    const mockViews = set.views || 42000;

    return (
        <a
            href={`https://www.youtube.com/watch?v=${set.youtube_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block relative rounded-xl overflow-hidden group transition-all glass-card-hover"
        >
            <div className="aspect-video bg-black relative">
                <img
                    src={set.thumbnail}
                    alt={set.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                <div className={`absolute top-0 left-0 p-3 ${isFeatured ? 'bg-red-600/90' : 'bg-black/70'} rounded-br-lg`}>
                    <span className={`text-xs font-bold uppercase ${isFeatured ? 'text-white' : 'text-yellow-400'}`}>
                        {isFeatured ? '🔴 LIVE SET' : '🎥 PERFORMANCE'}
                    </span>
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-4">
                    <div className="text-xl font-bold text-white mb-1">{set.title}</div>
                    <div className="text-sm text-gray-300 flex justify-between">
                        <span>{set.festival} • {set.year}</span>
                        <span className="flex items-center gap-2">
                            <span>{mockDuration} min</span> | <span>{mockViews.toLocaleString()} views</span>
                        </span>
                    </div>
                </div>
                
                <FaPlay className="absolute inset-0 m-auto w-16 h-16 text-white bg-red-600/80 rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
        </a>
    );
};

// Vinyl Record Animation Component
const VinylRecord: React.FC<{ isPlaying: boolean }> = ({ isPlaying }) => {
    return (
        <div className="relative w-16 h-16 flex-shrink-0">
            <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-orange-600 to-black border-4 border-orange-400/50 ${isPlaying ? 'animate-spin-slow' : ''}`}>
                <div className="absolute inset-4 rounded-full bg-black border-2 border-orange-300/30" />
                <div className="absolute inset-6 rounded-full bg-gradient-to-br from-orange-900 to-black" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-orange-200" />
            </div>
        </div>
    );
};

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function ArtistPage({ 
  artist, 
  episode, 
  spotifyTopTracks, 
  spotifyDiscography,
}: ArtistPageProps) {
  
  const displayName = artist.stage_name || artist.name;
  const accentColor = artist.primary_color || '#8b5cf6'; 
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  
  const dynamicStyle = { 
    '--accent-color': accentColor,
    '--spotify-color': '#1DB954',
    '--soundcloud-color': '#FF5500',
  } as React.CSSProperties;

  useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
  }, []);

  const handlePlayPreview = (previewUrl: string, trackId: string) => {
    if (currentlyPlaying === trackId && audioElement) {
      audioElement.pause();
      setCurrentlyPlaying(null);
      return;
    }

    if (audioElement) {
      audioElement.pause();
    }

    const audio = new Audio(previewUrl);
    audio.play();
    audio.onended = () => setCurrentlyPlaying(null);
    setAudioElement(audio);
    setCurrentlyPlaying(trackId);
  };
  
  const hasMediaContent = (artist.festival_sets?.length || 0) > 0 || episode !== null || (artist.instagram_reels?.length || 0) > 0;
  const hasSpotifyContent = spotifyTopTracks.length > 0 || spotifyDiscography.length > 0;
  const hasSoundCloudContent = artist.soundcloud_profile_url !== null;

  const firstMusicYear = artist.achievements?.find(a => a.year)?.year || '2018';
  const totalTracksOut = spotifyDiscography.filter(d => d.type === 'single' || d.type === 'album').length;
  const totalFestivals = artist.festival_sets?.length || 0;
  
  const socialLinks = [
    { icon: FaInstagram, url: artist.instagram_url, label: 'Instagram', color: 'text-pink-400', hover: 'hover:text-pink-300' },
    { icon: FaSoundcloud, url: artist.soundcloud_profile_url, label: 'SoundCloud', color: 'text-orange-400', hover: 'hover:text-orange-300' },
    { icon: FaSpotify, url: artist.spotify_url, label: 'Spotify', color: 'text-green-400', hover: 'hover:text-green-300' },
    { icon: FaYoutube, url: artist.youtube_url, label: 'YouTube', color: 'text-red-400', hover: 'hover:text-red-300' },
    { icon: FaFacebook, url: artist.facebook_url, label: 'Facebook', color: 'text-blue-400', hover: 'hover:text-blue-300' },
    { icon: FaGlobe, url: artist.website_url, label: 'Website', color: 'text-purple-400', hover: 'hover:text-purple-300' },
  ].filter(link => link.url);

  const customStyles = `
    @keyframes pulse-shadow {
      0% { box-shadow: 0 0 10px 0px color-mix(in srgb, var(--accent-color) 40%, transparent); }
      50% { box-shadow: 0 0 30px 8px color-mix(in srgb, var(--accent-color) 70%, transparent); }
      100% { box-shadow: 0 0 10px 0px color-mix(in srgb, var(--accent-color) 40%, transparent); }
    }
    @keyframes gradient-shift {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }
    @keyframes wave {
        0%, 100% { height: 100%; }
        25% { height: 20%; }
        50% { height: 60%; }
        75% { height: 40%; }
    }
    @keyframes orbit {
        0% { transform: translate(0, 0) rotate(0deg); opacity: 0.15; }
        50% { transform: translate(120px, 60px) rotate(180deg); opacity: 0.08; }
        100% { transform: translate(0, 0) rotate(360deg); opacity: 0.15; }
    }
    @keyframes spin-slow {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    @keyframes pulse-ring {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.6; transform: scale(1.05); }
    }
    .hero-glow {
      box-shadow: 0 0 40px 10px color-mix(in srgb, var(--accent-color) 50%, transparent);
      border-color: var(--accent-color);
      animation: pulse-shadow 3s infinite ease-in-out;
    }
    .hero-bg-gradient {
        background: linear-gradient(135deg, 
            color-mix(in srgb, var(--accent-color) 30%, transparent),
            rgba(0, 0, 0, 0.9),
            color-mix(in srgb, #ec4899 20%, transparent)
        );
        background-size: 200% 200%;
        animation: gradient-shift 15s ease infinite;
    }
    .text-spotify { color: var(--spotify-color); }
    .text-soundcloud { color: var(--soundcloud-color); }
    .glass-card-deep {
        background: rgba(10, 10, 20, 0.85);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        transition: all 0.3s;
    }
    .glass-card-hover:hover {
        border-color: var(--accent-color);
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
        transform: translateY(-3px);
    }
    .spotify-track-item:hover {
        background-color: rgba(29, 185, 84, 0.12);
        border-color: rgba(29, 185, 84, 0.3);
    }
    .waveform-bar {
        background: var(--spotify-color);
        animation: wave 1s ease-in-out infinite alternate;
    }
    .insta-gradient-border {
        border-image: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888, #8c26ab) 1;
        border-width: 2px;
        border-style: solid;
        box-shadow: 0 0 15px rgba(255, 90, 165, 0.4);
    }
    .gradient-hero-text {
      background: linear-gradient(90deg, var(--accent-color), #ec4899, #06b6d4);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .horizontal-scroll-container {
        display: flex;
        overflow-x: auto;
        overflow-y: hidden;
        gap: 1rem;
        padding-bottom: 20px;
        padding-right: 16px;
        scrollbar-width: thin;
        scrollbar-color: var(--accent-color) rgba(255, 255, 255, 0.1);
    }
    .horizontal-scroll-container::-webkit-scrollbar {
        height: 8px;
    }
    .horizontal-scroll-container::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 10px;
    }
    .horizontal-scroll-container::-webkit-scrollbar-thumb {
        background: var(--accent-color);
        border-radius: 10px;
    }
    .horizontal-scroll-container::-webkit-scrollbar-thumb:hover {
        background: color-mix(in srgb, var(--accent-color) 80%, white);
    }
    .album-item {
        flex-shrink: 0;
        width: 220px;
    }
    .album-cover-container {
        width: 200px; 
        height: 200px;
        position: relative;
        overflow: hidden;
    }
    .album-cover-container:hover .album-play-overlay {
        opacity: 1;
    }
    .album-play-overlay {
        opacity: 0;
        transition: opacity 0.3s;
    }
    .animated-orb {
        position: absolute;
        width: 400px;
        height: 400px;
        background: radial-gradient(circle, var(--accent-color) 5%, transparent 70%);
        opacity: 0.12;
        filter: blur(60px);
        animation: orbit 35s linear infinite alternate;
        z-index: 0;
        pointer-events: none;
    }
    #orb-1 { top: 10%; right: 5%; animation-delay: 0s; }
    #orb-2 { bottom: 5%; left: 10%; animation-delay: -17s; }
    .animate-spin-slow {
        animation: spin-slow 3s linear infinite;
    }
    .pulsing-dot {
        animation: pulse-ring 2s ease-in-out infinite;
    }
  `;

  return (
    <>
      <Head>
        <title>{displayName} - Music Hub | יוצאים לטראק</title>
        <meta name="description" content={artist.short_bio || `${displayName} - אמן טראנס ישראלי`} />
      </Head>
      
      <style jsx global>{customStyles}</style>

      <div className="min-h-screen trance-backdrop text-white relative" style={dynamicStyle}>
        
        <div id="orb-1" className="animated-orb" />
        <div id="orb-2" className="animated-orb" />

        <div className="sticky top-0 z-50 bg-black/90 backdrop-blur-2xl border-b border-white/20 shadow-2xl">
          <Navigation currentPage="episodes" />
        </div>

        {/* ENHANCED HERO */}
        <section className="relative py-20 px-6 overflow-hidden z-10 hero-bg-gradient">
          <div className="max-w-7xl mx-auto z-10 relative">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-12">
              
              <div className="relative flex-shrink-0 order-1">
                <div className="w-60 h-60 md:w-72 md:h-72 rounded-full overflow-hidden border-4 hero-glow transition-all duration-500">
                  {artist.profile_photo_url ? (
                    <img
                      src={artist.profile_photo_url}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center">
                      <span className="text-9xl font-black">{displayName[0]}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 text-center md:text-right order-2">
                <span className="inline-block px-5 py-2 bg-white/15 border border-white/30 rounded-full text-white/80 text-base font-bold mb-4 shadow-lg">
                  {artist.genre || 'Psytrance'}
                </span>
                
                <h1 className="text-7xl sm:text-8xl lg:text-9xl font-black mb-4 gradient-hero-text drop-shadow-2xl">
                  {displayName}
                </h1>
                
                <p className="text-gray-200 text-2xl lg:text-3xl mb-8 max-w-2xl mx-auto md:mx-0 font-light leading-relaxed">
                  {artist.short_bio || "אמן טראנס ישראלי פורץ דרך, מפיק סאונד ייחודי המשלב אנרגיה גבוהה עם עומק מלודי."}
                </p>

                <div className="flex flex-wrap justify-center md:justify-end gap-8 pt-6 border-t border-white/20">
                    
                    <div className="flex gap-3 text-right border-r border-white/20 pr-8">
                        <div className="text-4xl font-black text-cyan-300 tabular-nums">{totalTracksOut}</div>
                        <div className="text-sm text-gray-300">
                           <FaMusic className="inline w-4 h-4 text-cyan-300 mb-0.5" /> טרקים בחוץ
                        </div>
                    </div>
                    
                    <div className="flex gap-3 text-right border-r border-white/20 pr-8">
                        <div className="text-4xl font-black text-cyan-300 tabular-nums">{totalFestivals}</div>
                        <div className="text-sm text-gray-300">
                            <FaStar className="inline w-4 h-4 text-yellow-400 mb-0.5" /> פסטיבלים
                        </div>
                    </div>

                    <div className="flex gap-3 text-right">
                        <div className="text-4xl font-black text-cyan-300 tabular-nums">{firstMusicYear}</div>
                        <div className="text-sm text-gray-300">
                            <FaCalendarAlt className="inline w-4 h-4 text-cyan-300 mb-0.5" /> יוצר מאז
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap justify-center md:justify-end gap-5 mt-8">
                    {socialLinks.map((link, index) => (
                    <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-4xl transition-all duration-300 ${link.color} ${link.hover} hover:scale-110`}
                        title={link.label}
                    >
                        <link.icon />
                    </a>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MAIN CONTENT */}
        <section className="py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 pt-8">
              
              {/* MUSIC HUB COLUMN */}
              <div className="lg:col-span-1 space-y-8">
                  
                <h2 className="text-4xl font-black mb-6 flex items-center gap-4 text-green-400">
                    <FaMusic className="text-5xl" />
                    <span className="text-white">Music Hub</span>
                </h2>
                
                {/* BOOKING CARD - ENHANCED */}
                <div className="glass-card-deep p-7 rounded-2xl glass-card-hover border-l-4 border-green-400">
                    <h3 className="text-2xl font-bold mb-5 flex items-center gap-3 text-white">
                        <FaBriefcase className="text-3xl text-cyan-400" />
                        ייצוג מקצועי
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-gray-200">
                            <span className="text-base font-medium">בוקינג:</span>
                            <a href={`mailto:booking@${artist.slug}.com`} className="text-xl font-bold text-cyan-300 hover:text-white transition flex items-center gap-2">
                                {artist.booking_company || 'Sonic Booking'} <FaExternalLinkAlt className="w-4 h-4 opacity-70" />
                            </a>
                        </div>
                        <div className="flex justify-between items-center text-gray-200 border-t border-white/10 pt-4">
                            <span className="text-base font-medium">לייבל:</span>
                            <a href="#" className="text-xl font-bold text-cyan-300 hover:text-white transition flex items-center gap-2">
                                {artist.record_label || 'Shamanic Tales'} <FaExternalLinkAlt className="w-4 h-4 opacity-70" />
                            </a>
                        </div>
                        <a href={`mailto:booking@${artist.slug}.com`} className="w-full mt-5 rounded-xl px-5 py-3 flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-400 hover:to-cyan-400 transition-all font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105">
                             <FaEnvelope /> Book Performance
                        </a>
                    </div>
                </div>

                {/* SPOTIFY TOP TRACKS - ENHANCED WITH PREVIEW PLAY */}
                {spotifyTopTracks.length > 0 ? (
                  <div className="glass-card-deep p-7 rounded-2xl glass-card-hover border-l-4 border-spotify">
                    <h3 className="text-2xl font-bold mb-5 flex items-center gap-3 text-spotify">
                        <FaSpotify className="text-3xl" />
                        Top Tracks
                    </h3>
                    <div className="space-y-4">
                      {spotifyTopTracks.map((track, index) => (
                        <div
                          key={track.id}
                          className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 transition-all group spotify-track-item relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-0">
                                {Array.from({ length: 12 }).map((_, i) => (
                                    <div 
                                        key={i} 
                                        className="waveform-bar w-1 h-full mx-[1px] rounded-sm absolute bottom-0"
                                        style={{ 
                                            left: `${(i * 8)}%`,
                                            animationDelay: `${i * 0.1}s`,
                                            opacity: 0.7 
                                        }}
                                    />
                                ))}
                            </div>

                            <span className="text-3xl font-black text-spotify relative z-10">{index + 1}</span>
                          <img
                            src={track.album.images[0]?.url}
                            alt={track.album.name}
                            className="w-20 h-20 rounded-lg flex-shrink-0 shadow-xl relative z-10 group-hover:scale-105 transition-transform"
                          />
                          <div className="flex-1 min-w-0 text-right relative z-10">
                            <div className="font-bold text-xl text-white truncate group-hover:text-spotify transition-colors">
                              {track.name}
                            </div>
                            <div className="text-sm text-gray-300 truncate">
                              {new Date(track.album.release_date).getFullYear()} • {track.album.name}
                            </div>
                          </div>
                          {track.preview_url ? (
                            <button
                                onClick={() => handlePlayPreview(track.preview_url!, track.id)}
                                className="flex-shrink-0 w-12 h-12 rounded-full bg-green-500 hover:bg-green-400 flex items-center justify-center transition-all relative z-10 hover:scale-110 shadow-lg"
                            >
                                {currentlyPlaying === track.id ? 
                                    <FaPause className="text-white text-xl" /> : 
                                    <FaPlay className="text-white text-xl ml-1" />
                                }
                            </button>
                          ) : (
                            <a
                                href={track.external_urls.spotify}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-shrink-0 relative z-10"
                            >
                                <FaExternalLinkAlt className="text-green-400 hover:text-green-300 transition-colors text-xl" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                    <div className="glass-card-deep p-7 rounded-2xl border border-white/10 text-center text-gray-400">
                        <FaSpotify className="text-6xl mx-auto mb-4 text-spotify" />
                        <p className="text-lg">אין נתונים מ-Spotify</p>
                    </div>
                )}
                
                {/* SOUNDCLOUD PLAYER - ENHANCED WITH VINYL */}
                {hasSoundCloudContent ? (
                    <div className="glass-card-deep p-7 rounded-2xl glass-card-hover border-l-4 border-soundcloud">
                        <h3 className="text-2xl font-bold mb-5 flex items-center gap-3 text-soundcloud">
                            <VinylRecord isPlaying={true} />
                            <span className="relative flex items-center gap-2">
                                Now Playing
                                <div className="w-3 h-3 rounded-full bg-orange-400 pulsing-dot" />
                            </span>
                        </h3>
                        <div className="rounded-xl overflow-hidden border-2 border-soundcloud/40 shadow-2xl shadow-soundcloud/20">
                            <iframe
                                width="100%"
                                height="300"
                                scrolling="no"
                                frameBorder="no"
                                allow="autoplay"
                                src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(artist.soundcloud_profile_url || '')}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true`}
                            />
                        </div>
                        <div className="mt-4 flex items-center justify-center gap-2 text-orange-400 text-sm">
                            <FaVolumeUp className="animate-pulse" />
                            <span>Listen Live on SoundCloud</span>
                        </div>
                    </div>
                ) : (
                    <div className="glass-card-deep p-7 rounded-2xl border border-white/10 text-center text-gray-400">
                        <FaSoundcloud className="text-6xl mx-auto mb-4 text-soundcloud" />
                        <p className="text-lg">חסר קישור SoundCloud</p>
                    </div>
                )}
                
              </div>

              {/* MEDIA CENTER COLUMN */}
              <div className="lg:col-span-2 space-y-10">
                
                {/* DISCOGRAPHY - FIXED HORIZONTAL SCROLL */}
                {spotifyDiscography.length > 0 && (
                    <div className="glass-card-deep p-7 rounded-2xl">
                        <h2 className="text-4xl font-black mb-8 flex items-center gap-4 text-cyan-400">
                            <FaCompactDisc className="text-5xl" />
                            <span className="text-white">Discography</span>
                        </h2>
                        
                        <div className="horizontal-scroll-container">
                            {spotifyDiscography.slice(0, 10).map((album) => (
                                <div
                                    key={album.id}
                                    className="album-item"
                                >
                                    <a
                                        href={album.spotifyUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block p-3 rounded-xl hover:bg-white/5 transition border border-white/10 hover:border-cyan-400/50 group"
                                    >
                                        <div className="album-cover-container rounded-xl overflow-hidden mb-3 shadow-2xl">
                                            <img
                                                src={album.coverImage}
                                                alt={album.name}
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                            />
                                            <div className="album-play-overlay absolute inset-0 bg-black/70 flex items-center justify-center">
                                                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                                                    <FaPlay className="text-white text-2xl ml-1" />
                                                </div>
                                            </div>
                                            <div className="absolute top-3 left-3 bg-yellow-500 px-3 py-1 rounded-full text-sm font-bold text-black shadow-lg">
                                                {new Date(album.releaseDate).getFullYear()}
                                            </div>
                                        </div>

                                        <div className="text-lg font-bold text-white truncate group-hover:text-cyan-300 transition-colors">{album.name}</div>
                                        <div className="text-sm text-gray-400">{album.type === 'album' ? 'אלבום' : 'סינגל'} • {album.totalTracks} tracks</div>
                                    </a>
                                </div>
                            ))}
                        </div>
                        <Link href={artist.spotify_url || '#'} target="_blank" className="text-cyan-300 text-base mt-5 flex items-center justify-end gap-2 hover:underline hover:text-cyan-200 transition">
                            View Full Catalog <FaArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                )}

                <h2 className="text-4xl font-black mb-8 flex items-center gap-4 text-red-400">
                    <FaBroadcastTower className="text-5xl" />
                    <span className="text-white">Media Center</span>
                </h2>

                {/* VIDEO GRID - FESTIVAL SET + EPISODE */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {artist.festival_sets && artist.festival_sets.length > 0 && (
                        <div className="glass-card-deep p-7 rounded-2xl glass-card-hover">
                            <h3 className="text-2xl font-bold mb-5 flex items-center gap-3 text-yellow-400">
                                <FaStar className="text-3xl" />
                                Featured Live Set
                            </h3>
                            <LiveSetCard set={artist.festival_sets[0]} isFeatured={true} />
                        </div>
                    )}

                    {episode && (
                        <div className="glass-card-deep p-7 rounded-2xl glass-card-hover">
                            <h3 className="text-2xl font-bold mb-5 flex items-center gap-3 text-purple-400">
                                <FaYoutube className="text-3xl" />
                                Track Trip Interview
                            </h3>
                            <a
                                href={`https://www.youtube.com/watch?v=${episode.youtube_video_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block relative rounded-xl overflow-hidden group transition-all"
                            >
                                <div className="aspect-video bg-black relative">
                                    <img
                                        src={episode.thumbnail_url}
                                        alt={episode.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute top-4 right-4 bg-purple-600 px-4 py-2 rounded-full font-bold text-lg shadow-xl">
                                        #{episode.episode_number || 'N/A'}
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end p-5">
                                        <div className="font-bold text-xl text-white mb-2">{episode.clean_title || episode.title}</div>
                                        <div className="text-sm text-gray-200">
                                            {new Date(episode.published_at).toLocaleDateString('he-IL')} • {episode.view_count?.toLocaleString()} צפיות
                                        </div>
                                    </div>
                                    <FaPlay className="absolute inset-0 m-auto w-20 h-20 text-white bg-purple-600/90 rounded-full p-4 opacity-0 group-hover:opacity-100 transition-opacity shadow-2xl" />
                                </div>
                            </a>
                        </div>
                    )}
                </div>

                {/* MORE FESTIVAL SETS */}
                {artist.festival_sets && artist.festival_sets.length > 1 && (
                    <div className="glass-card-deep p-7 rounded-2xl">
                      <h3 className="text-2xl font-bold mb-5 flex items-center gap-3 text-red-400">
                          <FaPlay className="text-3xl" />
                          More Performances
                      </h3>
                      <div className="space-y-4">
                        {artist.festival_sets.slice(1).map((set, index) => (
                          <a
                            key={index}
                            href={`https://www.youtube.com/watch?v=${set.youtube_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-5 p-4 rounded-xl hover:bg-white/5 transition border border-white/10 hover:border-red-400/40 group"
                          >
                              <img
                                  src={set.thumbnail}
                                  alt={set.title}
                                  className="w-24 h-16 object-cover rounded-lg flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform"
                              />
                              <div className="flex-1 min-w-0">
                                  <div className="font-bold text-xl text-white truncate group-hover:text-red-300 transition-colors">{set.title}</div>
                                  <div className="text-sm text-gray-400">{set.festival} • {set.year} • {set.location}</div>
                              </div>
                              <FaYoutube className="text-red-500 flex-shrink-0 text-3xl" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* INSTAGRAM REELS - 3 COLUMNS */}
                  {artist.instagram_reels && artist.instagram_reels.length > 0 && (
                    <div className="glass-card-deep p-7 rounded-2xl">
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-pink-400">
                            <FaInstagram className="text-3xl" />
                            Instagram Highlights
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                            {artist.instagram_reels.slice(0, 6).map((reelUrl, index) => (
                                <div key={index} className="rounded-xl overflow-hidden shadow-2xl insta-gradient-border hover:scale-105 transition-transform">
                                    <iframe
                                        src={`${reelUrl.replace(/\/$/, '')}/embed`}
                                        className="w-full h-[400px]"
                                        frameBorder="0"
                                        scrolling="no"
                                        allowTransparency={true}
                                        allow="encrypted-media"
                                    />
                                </div>
                            ))}
                        </div>
                         <a href={artist.instagram_url || '#'} target="_blank" className="text-pink-300 text-base mt-6 flex items-center justify-end gap-2 hover:underline hover:text-pink-200 transition">
                            View More on Instagram <FaArrowRight className="w-4 h-4" />
                        </a>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </section>

        {/* ENHANCED FOOTER */}
        <footer className="border-t-2 border-white/20 bg-gradient-to-b from-black/80 to-black mt-20">
          <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-gray-300">
              <div className="flex items-center gap-3 text-lg">
                <FaBriefcase className="text-cyan-400 text-2xl" />
                <span>Management: {artist.name}</span>
              </div>
              <a href={`mailto:booking@${artist.slug}.com`} className="hover:text-white transition flex items-center gap-3 text-xl font-semibold">
                <FaEnvelope className="text-cyan-400 text-2xl" />
                booking@{artist.slug}.com
              </a>
              <div className="flex gap-8 text-base">
                <Link href="/" className="hover:text-white transition">בית</Link>
                <Link href="/episodes" className="hover:text-white transition">פרקים</Link>
                <Link href="/track-of-the-week" className="hover:text-white transition">טראק השבוע</Link>
              </div>
            </div>
            <div className="text-center text-gray-500 text-sm mt-6">
              © 2025 יוצאים לטראק • All Rights Reserved
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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { data: artist, error: artistError } = await supabase
      .from('artists')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (artistError || !artist) {
      return { notFound: true };
    }

    const { data: episodesData } = await supabase
      .from('artist_episodes')
      .select(`episodes (*)`)
      .eq('artist_id', artist.id)
      .order('episode_id', { ascending: false })
      .limit(1)
      .single();

    const episode = (episodesData?.episodes as Episode[])?.[0] || null; 

    let spotifyTopTracks: SpotifyTrack[] = [];
    let spotifyDiscography: SpotifyDiscographyItem[] = [];
    let spotifyProfileImage = artist.profile_photo_url; 

    if (artist.spotify_artist_id) {
      try {
        const [profile, topTracks, discography] = await Promise.all([
          getArtistProfile(artist.spotify_artist_id),
          getArtistTopTracks(artist.spotify_artist_id),
          getArtistDiscography(artist.spotify_artist_id),
        ]);

        if (profile?.image) {
            spotifyProfileImage = profile.image;
        }

        if (topTracks && Array.isArray(topTracks)) {
          spotifyTopTracks = topTracks as unknown as SpotifyTrack[];
        }

        if (discography && Array.isArray(discography)) {
            const uniqueDiscography = (discography as SpotifyDiscographyItem[]).filter((item, index, self) => 
                index === self.findIndex((t) => (
                    t.name === item.name && t.releaseDate === item.releaseDate
                ))
            );
            spotifyDiscography = uniqueDiscography;
        }

      } catch (error) {
        console.error('Spotify API error:', error);
      }
    }

    const artistWithData = {
      ...artist,
      profile_photo_url: spotifyProfileImage,
      festival_sets: (artist.festival_sets as FestivalSet[]) || [], 
      instagram_reels: artist.instagram_reels || [],
      booking_company: artist.booking_company || "Sonic Booking",
      record_label: artist.record_label || "Shamanic Tales",
      achievements: (artist.achievements as Achievement[]) || [],
    };

    return {
      props: {
        artist: artistWithData,
        episode,
        spotifyTopTracks,
        spotifyDiscography,
      },
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return { notFound: true };
  }
};

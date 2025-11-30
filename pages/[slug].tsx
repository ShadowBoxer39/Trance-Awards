// pages/[slug].tsx - V10: Final Polish, Aura & Complete Layout

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
  FaBroadcastTower,
  FaArrowRight,
  FaCalendarAlt,
  FaBriefcase,
  FaEnvelope, 
  FaWhatsapp, 
  FaExternalLinkAlt, 
  FaExclamationTriangle
} from 'react-icons/fa';

// ==========================================
// TYPES (Ensuring all data is correctly typed)
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
// UTILITY COMPONENTS (for cleaner JSX)
// ==========================================

const LiveSetCard: React.FC<{ set: FestivalSet, isFeatured: boolean }> = ({ set, isFeatured }) => {
    // MOCK DATA for visual effect:
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
                
                {/* LIVE BADGE / FEATURED BADGE */}
                <div className={`absolute top-0 left-0 p-3 ${isFeatured ? 'bg-red-600/90' : 'bg-black/70'} rounded-br-lg`}>
                    <span className={`text-xs font-bold uppercase ${isFeatured ? 'text-white' : 'text-yellow-400'}`}>
                        {isFeatured ? '🚨 LIVE SET' : '🎥 PERFORMANCE'}
                    </span>
                </div>
                
                {/* INFO OVERLAY */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-4">
                    <div className="text-xl font-bold text-white mb-1">{set.title}</div>
                    <div className="text-sm text-gray-300 flex justify-between">
                        <span>{set.festival} • {set.year}</span>
                        <span className="flex items-center gap-2">
                            <span>{mockDuration} min</span> | <span>{mockViews.toLocaleString()} views</span>
                        </span>
                    </div>
                </div>
                
                {/* PLAY BUTTON */}
                <FaPlay className="absolute inset-0 m-auto w-16 h-16 text-white bg-red-600/80 rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
        </a>
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
  
  const dynamicStyle = { 
    '--accent-color': accentColor,
    '--spotify-color': '#1DB954',
    '--soundcloud-color': '#FF5500',
  } as React.CSSProperties;

  useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
  }, []);
  
  const hasMediaContent = (artist.festival_sets?.length || 0) > 0 || episode !== null || (artist.instagram_reels?.length || 0) > 0;
  const hasSpotifyContent = spotifyTopTracks.length > 0 || spotifyDiscography.length > 0;
  const hasSoundCloudContent = artist.soundcloud_profile_url !== null;

  // --- 1. Custom Flattering Metrics ---
  const firstMusicYear = artist.achievements?.find(a => a.year)?.year || '2018';
  const totalTracksOut = spotifyDiscography.filter(d => d.type === 'single' || d.type === 'album').length;
  
  // --- 2. Social Links Definition ---
  const socialLinks = [
    { icon: FaInstagram, url: artist.instagram_url, label: 'Instagram', color: 'text-pink-400', hover: 'hover:text-pink-300' },
    { icon: FaSoundcloud, url: artist.soundcloud_profile_url, label: 'SoundCloud', color: 'text-orange-400', hover: 'hover:text-orange-300' },
    { icon: FaSpotify, url: artist.spotify_url, label: 'Spotify', color: 'text-green-400', hover: 'hover:text-green-300' },
    { icon: FaYoutube, url: artist.youtube_url, label: 'YouTube', color: 'text-red-400', hover: 'hover:text-red-300' },
    { icon: FaFacebook, url: artist.facebook_url, label: 'Facebook', color: 'text-blue-400', hover: 'hover:text-blue-300' },
    { icon: FaGlobe, url: artist.website_url, label: 'Website', color: 'text-purple-400', hover: 'hover:text-purple-300' },
  ].filter(link => link.url);


  // --- Custom Style Block for Dynamic Accent and Animation ---
  const customStyles = `
    @keyframes pulse-shadow {
      0% { box-shadow: 0 0 10px 0px color-mix(in srgb, var(--accent-color) 40%, transparent); }
      50% { box-shadow: 0 0 25px 5px color-mix(in srgb, var(--accent-color) 60%, transparent); }
      100% { box-shadow: 0 0 10px 0px color-mix(in srgb, var(--accent-color) 40%, transparent); }
    }
    @keyframes wave {
        0%, 100% { height: 100%; }
        25% { height: 20%; }
        50% { height: 60%; }
        75% { height: 40%; }
    }
    @keyframes orbit {
        0% { transform: translate(0, 0) rotate(0deg); opacity: 0.8; }
        50% { transform: translate(100px, 50px) rotate(180deg); opacity: 0.5; }
        100% { transform: translate(0, 0) rotate(360deg); opacity: 0.8; }
    }
    .hero-glow {
      box-shadow: 0 0 40px 10px color-mix(in srgb, var(--accent-color) 40%, transparent);
      border-color: var(--accent-color);
      animation: pulse-shadow 4s infinite ease-in-out;
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
        box-shadow: 0 5px 25px rgba(0, 0, 0, 0.4);
        transform: translateY(-2px);
    }
    .spotify-track-item:hover {
        background-color: rgba(29, 185, 84, 0.1);
    }
    .waveform-bar {
        background: var(--spotify-color);
        animation: wave 1s ease-in-out infinite alternate;
    }
    .insta-gradient-border {
        border-image: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888, #8c26ab) 1;
        border-width: 2px;
        border-style: solid;
        box-shadow: 0 0 10px rgba(255, 90, 165, 0.3);
    }
    .gradient-hero-text {
      background: linear-gradient(90deg, var(--accent-color), #ec4899, #06b6d4);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: gradient-x 3s ease infinite; 
    }
    .horizontal-scroll-container {
        overflow-x: auto;
        white-space: nowrap;
        padding-bottom: 20px;
        scrollbar-width: none;
        -ms-overflow-style: none;
        margin-left: -16px; 
        padding-left: 16px;
    }
    .horizontal-scroll-container::-webkit-scrollbar {
        display: none;
    }
    .album-cover-container {
        width: 200px; /* ~200px */
        height: 200px;
    }
    /* Background Animation Orbs (New) */
    .animated-orb {
        position: absolute;
        width: 300px;
        height: 300px;
        background: radial-gradient(circle, var(--accent-color) 3%, transparent 70%);
        opacity: 0.1;
        filter: blur(50px);
        animation: orbit 30s linear infinite alternate;
        z-index: 0;
        pointer-events: none;
    }
    #orb-1 { top: 10%; right: 5%; animation-delay: 0s; }
    #orb-2 { bottom: 5%; left: 10%; animation-delay: -15s; }
  `;

  return (
    <>
      <Head>
        <title>{displayName} - Music Hub</title>
        <meta name="description" content={artist.short_bio || `${displayName} - אמן טראנס ישראלי`} />
      </Head>
      
      {/* Dynamic Style injection */}
      <style jsx global>{customStyles}</style>

      <div className="min-h-screen trance-backdrop text-white relative" style={dynamicStyle}>
        
        {/* Animated Background Orbs */}
        <div id="orb-1" className="animated-orb" />
        <div id="orb-2" className="animated-orb" />

        <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
          <Navigation currentPage="episodes" />
        </div>

        {/* HERO SECTION - HIGH IMPACT & FLATERING STATS */}
        <section className="relative py-16 px-6 overflow-hidden z-10">
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

                {/* --- Custom Flattering Stats --- */}
                <div className="flex flex-wrap justify-center md:justify-end gap-6 pt-4 border-t border-white/10">
                    
                    {/* Tracks Out */}
                    <div className="flex gap-2 text-right border-r border-white/10 pr-6">
                        <div className="text-3xl font-bold text-cyan-400 tabular-nums">{totalTracksOut}</div>
                        <div className="text-xs text-gray-400">
                           <FaMusic className="inline w-3 h-3 text-cyan-400 mb-0.5" /> טרקים בחוץ
                        </div>
                    </div>
                    
                    {/* Years Active */}
                    <div className="flex gap-2 text-right border-r border-white/10 pr-6">
                        <div className="text-3xl font-bold text-cyan-400 tabular-nums">{firstMusicYear}</div>
                        <div className="text-xs text-gray-400">
                            <FaCalendarAlt className="inline w-3 h-3 text-cyan-400 mb-0.5" /> יוצר מאז
                        </div>
                    </div>

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
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MAIN CONTENT - MUSIC HUB & MEDIA CENTER */}
        <section className="py-8 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8">
              
              {/* COLUMN 1: MUSIC HUB (Spotify & SoundCloud) - 1/3 WIDTH */}
              <div className="lg:col-span-1 space-y-8">
                  
                <h2 className="text-3xl font-black mb-6 flex items-center gap-3 text-green-500">
                    <FaMusic className="text-4xl" />
                    <span className="text-white">Music Hub</span>
                </h2>
                
                {/* --- BOOKING / LABEL CARD (Clickable) --- */}
                <div className="glass-card-deep p-6 rounded-2xl glass-music-card glass-card-hover">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                        <FaBriefcase className="text-2xl text-cyan-400" />
                        ייצוג
                    </h3>
                    <div className="space-y-3">
                        {/* Booking Company */}
                        <div className="flex justify-between items-center text-gray-300">
                            <span className="text-sm font-medium">בוקינג (ניהול הופעות):</span>
                            <a href={`https://${artist.booking_company || 'sonic-booking.co'}.com`} target="_blank" className="text-lg font-bold text-cyan-400 hover:text-white transition flex items-center gap-2">
                                {artist.booking_company || 'Sonic Booking'} <FaExternalLinkAlt className="w-3 h-3 opacity-70" />
                            </a>
                        </div>
                        {/* Record Label */}
                        <div className="flex justify-between items-center text-gray-300 border-t border-white/10 pt-3">
                            <span className="text-sm font-medium">לייבל:</span>
                            <a href={`https://${artist.record_label || 'shamanictales'}.com`} target="_blank" className="text-lg font-bold text-cyan-400 hover:text-white transition flex items-center gap-2">
                                {artist.record_label || 'Shamanic Tales'} <FaExternalLinkAlt className="w-3 h-3 opacity-70" />
                            </a>
                        </div>
                        {/* CTA Button */}
                        <a href="mailto:booking@nevo.com" className="w-full mt-4 btn-primary rounded-lg px-4 py-2 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-cyan-500 hover:scale-[1.02] transition-transform">
                             <FaEnvelope /> Book Now
                        </a>
                    </div>
                </div>

                {/* Spotify Top Tracks (Top 5) - Visual Upgrade */}
                {spotifyTopTracks.length > 0 ? (
                  <div className="glass-card-deep p-6 rounded-2xl glass-music-card glass-card-hover">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-spotify">
                        <FaSpotify className="text-2xl" />
                        הכי מושמעים ב-Spotify
                    </h3>
                    <div className="space-y-3">
                      {spotifyTopTracks.map((track, index) => (
                        <a
                          key={track.id}
                          href={track.external_urls.spotify}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-4 p-3 rounded-lg bg-white/5 border border-white/5 transition-all group spotify-track-item relative overflow-hidden"
                        >
                            {/* Waveform Mock (CSS Animation) */}
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

                            <span className="text-2xl font-bold text-spotify relative z-10">{index + 1}.</span>
                          <img
                            src={track.album.images[0]?.url}
                            alt={track.album.name}
                            className="w-16 h-16 rounded-md flex-shrink-0 shadow-lg relative z-10"
                          />
                          <div className="flex-1 min-w-0 text-right relative z-10">
                            <div className="font-bold text-lg text-white truncate group-hover:text-spotify transition-colors">
                              {track.name}
                            </div>
                            <div className="text-xs text-gray-400 truncate">
                              {new Date(track.album.release_date).getFullYear()} • {track.album.name}
                            </div>
                          </div>
                          <FaPlay className="text-green-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity relative z-10" />
                        </a>
                      ))}
                    </div>
                  </div>
                ) : (
                    <div className="glass-card-deep p-6 rounded-2xl border border-white/10 text-center text-gray-400">
                        <FaSpotify className="text-5xl mx-auto mb-3 text-spotify" />
                        <p>אין נתוני טרקים עדכניים מ-Spotify</p>
                    </div>
                )}
                
                {/* SoundCloud Player Embed (Highlight) - Better Framing */}
                {hasSoundCloudContent ? (
                    <div className="glass-card-deep p-6 rounded-2xl glass-media-card glass-card-hover">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-soundcloud">
                            <FaSoundcloud className="text-2xl" />
                            <span className="relative">
                                השמעה מהירה
                                <div className="absolute top-0 right-full w-2 h-2 rounded-full bg-orange-400 animate-pulse ml-2" />
                            </span>
                        </h3>
                        <div className="rounded-xl overflow-hidden border border-soundcloud/30 shadow-lg shadow-soundcloud/10">
                            <iframe
                                width="100%"
                                height="250"
                                scrolling="no"
                                frameBorder="no"
                                allow="autoplay"
                                src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(artist.soundcloud_profile_url || '')}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true`}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="glass-card-deep p-6 rounded-2xl border border-white/10 text-center text-gray-400">
                        <FaSoundcloud className="text-5xl mx-auto mb-3 text-soundcloud" />
                        <p>חסר קישור תקין ל-Soundcloud Profile</p>
                    </div>
                )}
                
              </div>

              {/* COLUMN 2: MEDIA CENTER & DISCOGRAPHY - 2/3 WIDTH */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* --- DISCOGRAPHY (Horizontal Scroll - Fixes Ugly Scroll) --- */}
                {spotifyDiscography.length > 0 && (
                    <div className="glass-card-deep p-6 rounded-2xl">
                        <h2 className="text-3xl font-black mb-6 flex items-center gap-3 text-cyan-500">
                            <FaCompactDisc className="text-4xl" />
                            <span className="text-white">דיסקוגרפיה (Albums & Singles)</span>
                        </h2>
                        
                        <div className="horizontal-scroll-container">
                            {spotifyDiscography.slice(0, 8).map((album, index) => ( // Limited to 8 for cleaner scroll
                                <a
                                    key={album.id}
                                    href={album.spotifyUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block w-52 h-auto p-2 m-2 rounded-lg hover:bg-white/5 transition border border-white/10 hover:border-cyan-400/50 group"
                                    style={{ whiteSpace: 'normal' }}
                                >
                                    <div className="relative album-cover-container w-full">
                                        <img
                                            src={album.coverImage}
                                            alt={album.name}
                                            className="w-full h-full object-cover rounded-md mb-2 shadow-lg transition-transform duration-300 group-hover:scale-[1.03]"
                                        />
                                         <div className="absolute top-2 left-2 bg-yellow-600 px-2 py-0.5 rounded-full text-xs font-bold text-black">
                                            {new Date(album.releaseDate).getFullYear()}
                                        </div>
                                    </div>

                                    <div className="text-xl font-bold text-white truncate">{album.name}</div>
                                    <div className="text-sm text-gray-400">{album.type === 'album' ? 'אלבום' : 'סינגל'}</div>
                                </a>
                            ))}
                        </div>
                        <Link href={artist.spotify_url || '#'} target="_blank" className="text-cyan-400 text-sm mt-3 flex items-center justify-end gap-1 hover:underline">
                            צפה בכל הקטלוג ב-Spotify <FaArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                )}


                <h2 className="text-3xl font-black mb-6 flex items-center gap-3 text-red-500">
                    <FaBroadcastTower className="text-4xl" />
                    <span className="text-white">Media Center</span>
                </h2>

                {/* --- VIDEO HIGHLIGHTS (Best Set AND Episode) --- */}
                
                {/* 1. BEST LIVE SET CARD */}
                {artist.festival_sets && artist.festival_sets.length > 0 && (
                    <div className="glass-card-deep p-6 rounded-2xl glass-card-hover">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-400">
                            <FaStar className="text-3xl text-yellow-400" />
                            הסט החי המומלץ
                        </h3>
                        <LiveSetCard set={artist.festival_sets[0]} isFeatured={true} />
                    </div>
                )}

                {/* 2. TRACK TRIP EPISODE CARD */}
                {episode && (
                    <div className="glass-card-deep p-6 rounded-2xl glass-card-hover">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-purple-400">
                            <FaYoutube className="text-2xl" />
                            ראיון מלא ב-Track Trip
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
                                <div className="absolute top-4 right-4 bg-purple-600 px-3 py-1 rounded-full font-bold">
                                    #{episode.episode_number || 'N/A'}
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-4">
                                    <div className="font-bold text-white mb-1">{episode.clean_title || episode.title}</div>
                                    <div className="text-sm text-gray-300">
                                        {new Date(episode.published_at).toLocaleDateString('he-IL')}
                                    </div>
                                </div>
                                <FaPlay className="absolute inset-0 m-auto w-16 h-16 text-white bg-purple-600/80 rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </a>
                    </div>
                )}
                
                {/* 3. REMAINING SETS (LIST) */}
                {artist.festival_sets && artist.festival_sets.length > 1 && (
                    <div className="glass-card-deep p-6 rounded-2xl">
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-400">
                          <FaPlay className="text-2xl" />
                          הופעות נוספות
                      </h3>
                      <div className="space-y-3">
                        {artist.festival_sets.slice(1).map((set, index) => (
                          <a
                            key={index}
                            href={`https://www.youtube.com/watch?v=${set.youtube_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition border border-white/5 hover:border-red-400/30"
                          >
                              <img
                                  src={set.thumbnail}
                                  alt={set.title}
                                  className="w-16 h-12 object-cover rounded-md flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-lg text-white truncate">{set.title}</div>
                                  <div className="text-xs text-gray-400">{set.festival} • {set.year}</div>
                              </div>
                              <FaYoutube className="text-red-500 flex-shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* NEW: INSTAGRAM REELS SECTION */}
                  {artist.instagram_reels && artist.instagram_reels.length > 0 && (
                    <div className="glass-card-deep p-6 rounded-2xl">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-pink-400">
                            <FaInstagram className="text-2xl" />
                            רגעים נבחרים (Instagram Reels)
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {artist.instagram_reels.slice(0, 6).map((reelUrl, index) => (
                                <div key={index} className="rounded-xl overflow-hidden shadow-lg insta-gradient-border">
                                    <iframe
                                        src={`${reelUrl.replace(/\/$/, '')}/embed`}
                                        className="w-full h-[350px]"
                                        frameBorder="0"
                                        scrolling="no"
                                        allowTransparency={true}
                                        allow="encrypted-media"
                                    />
                                </div>
                            ))}
                        </div>
                         <a href={artist.instagram_url || '#'} target="_blank" className="text-pink-400 text-sm mt-3 flex items-center justify-end gap-1 hover:underline">
                            צפה בעוד ב-Instagram <FaArrowRight className="w-3 h-3" />
                        </a>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </section>

        {/* Footer - Artist Specific Contact */}
        <footer className="border-t border-white/10 bg-black/50 mt-16">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-gray-400 text-sm">
              <div className="flex items-center gap-2">
                <FaBriefcase className="text-cyan-400" />
                <span>פניות לניהול: {artist.name}</span>
              </div>
              <a href="mailto:booking@nevo.com" className="hover:text-white transition flex items-center gap-2">
                <FaEnvelope className="text-white/70" />
                booking@nevo.com
              </a>
              <div className="flex gap-6 mt-4 md:mt-0">
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
// SERVER-SIDE DATA FETCHING 
// ==========================================

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const slug = params?.slug as string;
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
      .select(`episodes (*)`)
      .eq('artist_id', artist.id)
      .order('episode_id', { ascending: false })
      .limit(1)
      .single();

    const episode = (episodesData?.episodes as Episode[])?.[0] || null; 

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
        console.error('Spotify API error in SSR:', error);
      }
    }

    // 4. Finalize artist data
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

// pages/[slug].tsx - V15: Embedded Video + Clean Representation + Spotify Player

import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { createClient } from "@supabase/supabase-js";
import Navigation from "../components/Navigation";
import {
  getArtistProfile,
  getArtistTopTracks,
  getArtistDiscography,
} from "../lib/spotify";
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
  FaVolumeUp,
} from "react-icons/fa";

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

  // NEW: clean representation fields
  booking_name: string | null;
  booking_email: string | null;
  booking_website: string | null;
  label_name: string | null;
  label_website: string | null;

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
  type: "album" | "single";
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
// MAIN COMPONENT
// ==========================================

export default function ArtistPage({
  artist,
  episode,
  spotifyTopTracks,
  spotifyDiscography,
}: ArtistPageProps) {
  const displayName = artist.stage_name || artist.name;
  const accentColor = artist.primary_color || "#8b5cf6";

  const [activeTrackId, setActiveTrackId] = useState<string | null>(
    spotifyTopTracks[0]?.id ?? null
  );

  const dynamicStyle = {
    "--accent-color": accentColor,
    "--spotify-color": "#1DB954",
    "--soundcloud-color": "#FF5500",
  } as React.CSSProperties;

  useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
  }, []);

  const hasSpotifyContent =
    spotifyTopTracks.length > 0 || spotifyDiscography.length > 0;
  const hasSoundCloudContent = artist.soundcloud_profile_url !== null;

  // --- 1. Flattering metrics ---
  const firstMusicYear =
    artist.achievements?.find((a) => a.year)?.year || "2018";
  const totalTracksOut = spotifyDiscography.filter(
    (d) => d.type === "single" || d.type === "album"
  ).length;
  const totalFestivals = artist.festival_sets?.length || 0;

  // --- 2. Social Links ---
  const socialLinks = [
    {
      icon: FaInstagram,
      url: artist.instagram_url,
      label: "Instagram",
      color: "text-pink-400",
      hover: "hover:text-pink-300",
    },
    {
      icon: FaSoundcloud,
      url: artist.soundcloud_profile_url,
      label: "SoundCloud",
      color: "text-orange-400",
      hover: "hover:text-orange-300",
    },
    {
      icon: FaSpotify,
      url: artist.spotify_url,
      label: "Spotify",
      color: "text-green-400",
      hover: "hover:text-green-300",
    },
    {
      icon: FaYoutube,
      url: artist.youtube_url,
      label: "YouTube",
      color: "text-red-400",
      hover: "hover:text-red-300",
    },
    {
      icon: FaFacebook,
      url: artist.facebook_url,
      label: "Facebook",
      color: "text-blue-400",
      hover: "hover:text-blue-300",
    },
    {
      icon: FaGlobe,
      url: artist.website_url,
      label: "Website",
      color: "text-purple-400",
      hover: "hover:text-purple-300",
    },
  ].filter((link) => link.url);

  // --- 3. Representation data ---
  const primaryContactEmail =
    artist.booking_email || `booking@${artist.slug}.com`;

  // --- 4. Custom styles ---
  const customStyles = `
    @keyframes pulse-shadow {
      0% { box-shadow: 0 0 10px 0px color-mix(in srgb, var(--accent-color) 40%, transparent); }
      50% { box-shadow: 0 0 30px 8px color-mix(in srgb, var(--accent-color) 70%, transparent); }
      100% { box-shadow: 0 0 10px 0px color-mix(in srgb, var(--accent-color) 40%, transparent); }
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
    .hero-glow {
      box-shadow: 0 0 40px 10px color-mix(in srgb, var(--accent-color) 40%, transparent);
      border-color: var(--accent-color);
      animation: pulse-shadow 3s infinite ease-in-out;
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
      box-shadow: 0 0 10px rgba(255, 90, 165, 0.3);
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
      scrollbar-width: none;
      -ms-overflow-style: none;
      margin-left: -16px;
      padding-left: 16px;
    }
    .horizontal-scroll-container::-webkit-scrollbar {
      height: 0;
      display: none;
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
    .logo-glow {
      box-shadow: 0 0 10px color-mix(in srgb, var(--accent-color) 60%, transparent);
    }
  `;

  const mainFestivalSet = artist.festival_sets?.[0];

  return (
    <>
      <Head>
        <title>{displayName} - Music Hub | יוצאים לטראק</title>
        <meta
          name="description"
          content={
            artist.short_bio ||
            `${displayName} - אמן טראנס ישראלי פורץ דרך, מפיק סאונד ייחודי המשלב אנרגיה גבוהה עם עומק מלודי.`
          }
        />
      </Head>

      {/* Dynamic Style injection */}
      <style jsx global>
        {customStyles}
      </style>

      <div
        className="min-h-screen trance-backdrop text-white relative"
        style={dynamicStyle}
      >
        {/* Animated Background Orbs */}
        <div id="orb-1" className="animated-orb" />
        <div id="orb-2" className="animated-orb" />

        <div className="sticky top-0 z-50 bg-black/90 backdrop-blur-2xl border-b border-white/20 shadow-2xl">
          <Navigation currentPage="episodes" />
        </div>

        {/* HERO SECTION */}
        <section className="relative py-20 px-6 overflow-hidden z-10 hero-bg-gradient">
          {/* Animated particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${15 + Math.random() * 10}s`,
                }}
              />
            ))}
          </div>

          <div className="max-w-7xl mx-auto z-10 relative">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-12">
              {/* Profile Photo */}
              <div className="relative flex-shrink-0 order-1 group">
                <div className="absolute inset-0 animate-spin-very-slow">
                  <div
                    className="absolute inset-0 rounded-full border-2 border-dashed border-purple-500/30"
                    style={{ transform: "scale(1.15)" }}
                  />
                </div>
                <div className="absolute inset-0 animate-spin-reverse-slow">
                  <div
                    className="absolute inset-0 rounded-full border-2 border-dotted border-cyan-500/30"
                    style={{ transform: "scale(1.25)" }}
                  />
                </div>

                <div className="w-60 h-60 md:w-72 md:h-72 rounded-full overflow-hidden border-4 hero-glow transition-all duration-500 group-hover:scale-105">
                  {artist.profile_photo_url ? (
                    <img
                      src={artist.profile_photo_url}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center">
                      <span className="text-9xl font-black">
                        {displayName[0]}
                      </span>
                    </div>
                  )}
                </div>

                {/* Pulsing dots around photo */}
                <div className="absolute top-0 right-0 w-4 h-4 bg-cyan-400 rounded-full pulsing-dot" />
                <div
                  className="absolute bottom-0 left-0 w-4 h-4 bg-purple-400 rounded-full pulsing-dot"
                  style={{ animationDelay: "1s" }}
                />
              </div>

              {/* Info & Title */}
              <div className="flex-1 text-center md:text-right order-2">
                <span className="inline-block px-5 py-2 bg-white/15 border border-white/30 rounded-full text-white/80 text-base font-bold mb-4 shadow-lg">
                  {artist.genre || "Psytrance"}
                </span>

                <h1 className="text-7xl sm:text-8xl lg:text-9xl font-black mb-4 gradient-hero-text drop-shadow-2xl">
                  {displayName}
                </h1>

                <p className="text-gray-200 text-2xl lg:text-3xl mb-8 max-w-2xl mx-auto md:mx-0 font-light leading-relaxed">
                  {artist.short_bio ||
                    "אמן טראנס ישראלי פורץ דרך, מפיק סאונד ייחודי המשלב אנרגיה גבוהה עם עומק מלודי."}
                </p>

                {/* Stats */}
                <div className="flex flex-wrap justify-center md:justify-end gap-8 pt-6 border-t border-white/20">
                  {/* Tracks Out */}
                  <div className="flex gap-3 text-right border-r border-white/20 pr-8">
                    <div className="text-4xl font-black text-cyan-300 tabular-nums">
                      {totalTracksOut}
                    </div>
                    <div className="text-sm text-gray-300">
                      <FaMusic className="inline w-4 h-4 text-cyan-300 mb-0.5" />{" "}
                      טרקים בחוץ
                    </div>
                  </div>

                  {/* Festivals Count */}
                  <div className="flex gap-3 text-right border-r border-white/20 pr-8">
                    <div className="text-4xl font-black text-cyan-300 tabular-nums">
                      {totalFestivals}
                    </div>
                    <div className="text-sm text-gray-300">
                      <FaStar className="inline w-4 h-4 text-yellow-400 mb-0.5" />{" "}
                      פסטיבלים
                    </div>
                  </div>

                  {/* Years Active */}
                  <div className="flex gap-3 text-right">
                    <div className="text-4xl font-black text-cyan-300 tabular-nums">
                      {firstMusicYear}
                    </div>
                    <div className="text-sm text-gray-300">
                      <FaCalendarAlt className="inline w-4 h-4 text-cyan-300 mb-0.5" />{" "}
                      יוצר מאז
                    </div>
                  </div>
                </div>

                {/* Social Icons */}
                <div className="flex flex-wrap justify-center md:justify-end gap-5 mt-8">
                  {socialLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.url!}
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
              {/* COLUMN 1: REPRESENTATION + CONTACT */}
              <div className="space-y-8">
                <h2 className="text-2xl font-black flex items-center gap-3 text-white">
                  <FaBriefcase className="text-cyan-400 text-3xl" />
                  Representation
                </h2>

                <div className="glass-card-deep p-6 rounded-2xl space-y-4">
                  {artist.booking_name ||
                  artist.booking_email ||
                  artist.booking_website ? (
                    <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between gap-4">
                      <div className="text-right flex-1">
                        <div className="text-xs text-gray-400 uppercase tracking-wide">
                          Booking
                        </div>
                        <div className="text-lg font-semibold">
                          {artist.booking_name || "To be announced"}
                        </div>
                        {artist.booking_email && (
                          <div className="text-sm text-gray-400">
                            {artist.booking_email}
                          </div>
                        )}
                      </div>
                      {artist.booking_website && (
                        <a
                          href={artist.booking_website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-full border border-white/30 text-sm flex items-center gap-2 hover:border-cyan-400 hover:text-cyan-300 transition"
                        >
                          Visit site
                          <FaExternalLinkAlt className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-black/40 border border-dashed border-white/20 text-right text-gray-400 text-sm">
                      Booking details will be announced soon.
                    </div>
                  )}

                  {artist.label_name || artist.label_website ? (
                    <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between gap-4">
                      <div className="text-right flex-1">
                        <div className="text-xs text-gray-400 uppercase tracking-wide">
                          Record Label
                        </div>
                        <div className="text-lg font-semibold">
                          {artist.label_name || "Independent"}
                        </div>
                      </div>
                      {artist.label_website && (
                        <a
                          href={artist.label_website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-full border border-white/30 text-sm flex items-center gap-2 hover:border-purple-400 hover:text-purple-300 transition"
                        >
                          Visit label
                          <FaExternalLinkAlt className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ) : null}
                </div>

                {/* Contact info card */}
                <div className="glass-card-deep p-6 rounded-2xl space-y-4">
                  <h3 className="text-xl font-semibold mb-2">Contact Info</h3>
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-right">
                      <div className="text-xs text-gray-400 mb-1">
                        Booking / Management
                      </div>
                      <a
                        href={`mailto:${primaryContactEmail}`}
                        className="flex items-center gap-2 text-base hover:text-cyan-300 transition"
                      >
                        <FaEnvelope className="text-cyan-400" />
                        <span>{primaryContactEmail}</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* COLUMNS 2–3: MUSIC + MEDIA CENTER */}
              <div className="lg:col-span-2 space-y-10">
                {/* DISCOSGRAPHY */}
                {spotifyDiscography.length > 0 && (
                  <div className="glass-card-deep p-7 rounded-2xl">
                    <h2 className="text-2xl md:text-3xl font-black mb-6 flex items-center gap-4 text-cyan-400">
                      <FaCompactDisc className="text-4xl" />
                      <span className="text-white">Discography</span>
                    </h2>

                    <div className="horizontal-scroll-container">
                      {spotifyDiscography.slice(0, 8).map((album) => (
                        <div key={album.id} className="album-item">
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
                                {new Date(
                                  album.releaseDate
                                ).getFullYear()}
                              </div>
                            </div>

                            <div className="text-xl font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                              {album.name}
                            </div>
                            <div className="text-sm text-gray-400">
                              {album.type === "album" ? "אלבום" : "סינגל"}
                            </div>
                          </a>
                        </div>
                      ))}
                    </div>

                    <Link
                      href={artist.spotify_url || "#"}
                      target="_blank"
                      className="text-cyan-300 text-base mt-5 flex items-center justify-end gap-2 hover:underline hover:text-cyan-200 transition"
                    >
                      View full catalog
                      <FaArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}

                {/* MEDIA CENTER: FESTIVAL SET + EPISODE SIDE BY SIDE */}
                <div>
                  <h2 className="text-2xl md:text-3xl font-black mb-6 flex items-center gap-4 text-red-400">
                    <FaBroadcastTower className="text-4xl" />
                    <span className="text-white">Media Center</span>
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Featured festival set – embedded YouTube */}
                    {mainFestivalSet && (
                      <div className="glass-card-deep p-6 rounded-2xl glass-card-hover">
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-3 text-red-300">
                          <FaStar className="text-yellow-400 text-2xl" />
                          Featured Live Set
                        </h3>
                        <div className="aspect-video rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                          <iframe
                            src={`https://www.youtube.com/embed/${mainFestivalSet.youtube_id}?rel=0&modestbranding=1`}
                            title={mainFestivalSet.title}
                            className="w-full h-full"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          />
                        </div>
                        <div className="mt-3 flex items-center justify-between text-sm text-gray-300">
                          <span>
                            {mainFestivalSet.festival} • {mainFestivalSet.year}
                          </span>
                          <span>
                            {mainFestivalSet.location}
                            {mainFestivalSet.duration_min
                              ? ` • ${mainFestivalSet.duration_min} min`
                              : ""}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Track Trip episode – embedded YouTube */}
                    {episode && (
                      <div className="glass-card-deep p-6 rounded-2xl glass-card-hover">
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-3 text-purple-300">
                          <FaYoutube className="text-2xl" />
                          Track Trip Interview
                        </h3>
                        <div className="aspect-video rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                          <iframe
                            src={`https://www.youtube.com/embed/${episode.youtube_video_id}?rel=0&modestbranding=1`}
                            title={episode.title}
                            className="w-full h-full"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          />
                        </div>
                        <div className="mt-3 flex items-center justify-between text-sm text-gray-300">
                          <div className="flex flex-col text-right">
                            <span className="font-semibold truncate">
                              {episode.clean_title || episode.title}
                            </span>
                            <span className="text-xs text-gray-400">
                              #{episode.episode_number ?? "?"} •{" "}
                              {new Date(
                                episode.published_at
                              ).toLocaleDateString("he-IL")}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">
                            {episode.view_count
                              ? `${episode.view_count.toLocaleString()} views`
                              : ""}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* If absolutely no video */}
                  {!episode && !mainFestivalSet && (
                    <div className="glass-card-deep p-10 rounded-2xl text-center text-gray-400 mt-6">
                      <FaExclamationTriangle className="text-6xl mx-auto mb-4 text-red-500" />
                      <p className="text-xl">אין תוכן וידאו זמין</p>
                    </div>
                  )}

                  {/* More festival performances list (optional links) */}
                  {artist.festival_sets && artist.festival_sets.length > 1 && (
                    <div className="glass-card-deep p-6 rounded-2xl mt-8">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-3 text-red-300">
                        <FaPlay className="text-2xl" />
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
                              <div className="font-bold text-base text-white truncate group-hover:text-red-300 transition-colors">
                                {set.title}
                              </div>
                              <div className="text-xs text-gray-400">
                                {set.festival} • {set.year} • {set.location}
                              </div>
                            </div>
                            <FaYoutube className="text-red-500 flex-shrink-0 text-2xl" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* SPOTIFY + SOUNDCLOUD HUB */}
                {hasSpotifyContent || hasSoundCloudContent ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Spotify Top Tracks with embedded player */}
                    {spotifyTopTracks.length > 0 ? (
                      <div className="glass-card-deep p-6 rounded-2xl glass-card-hover border-l-4 border-spotify">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-3 text-spotify">
                          <FaSpotify className="text-2xl" />
                          Popular Tracks
                        </h3>

                        <div className="space-y-3">
                          {spotifyTopTracks.map((track, index) => {
                            const isActive = track.id === activeTrackId;
                            return (
                              <button
                                type="button"
                                key={track.id}
                                onClick={() => setActiveTrackId(track.id)}
                                className={`w-full flex items-center gap-4 p-3 rounded-xl border text-right spotify-track-item relative overflow-hidden transition-all ${
                                  isActive
                                    ? "bg-spotify/20 border-spotify/60"
                                    : "bg-white/5 border-white/10"
                                }`}
                              >
                                <span className="text-2xl font-black text-spotify relative z-10">
                                  {index + 1}.
                                </span>
                                <img
                                  src={track.album.images[0]?.url}
                                  alt={track.album.name}
                                  className="w-14 h-14 rounded-lg flex-shrink-0 shadow-md relative z-10"
                                />
                                <div className="flex-1 min-w-0 relative z-10">
                                  <div className="font-semibold text-sm text-white truncate">
                                    {track.name}
                                  </div>
                                  <div className="text-xs text-gray-400 truncate">
                                    {new Date(
                                      track.album.release_date
                                    ).getFullYear()}{" "}
                                    • {track.album.name}
                                  </div>
                                </div>
                                <FaPlay
                                  className={`text-xs ${
                                    isActive
                                      ? "text-white"
                                      : "text-spotify/80"
                                  }`}
                                />
                              </button>
                            );
                          })}
                        </div>

                        {/* Embedded Spotify player */}
                        {activeTrackId && (
                          <div className="mt-5 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                            <iframe
                              src={`https://open.spotify.com/embed/track/${activeTrackId}`}
                              width="100%"
                              height="152"
                              frameBorder="0"
                              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                              loading="lazy"
                            />
                          </div>
                        )}

                        <div className="mt-4 text-xs text-gray-400 text-right flex items-center justify-between gap-3">
                          <span>Powered by Spotify</span>
                          {artist.spotify_url && (
                            <a
                              href={artist.spotify_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-spotify hover:text-green-300 transition"
                            >
                              Open artist on Spotify
                              <FaExternalLinkAlt className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="glass-card-deep p-6 rounded-2xl border border-white/10 text-center text-gray-400">
                        <FaSpotify className="text-5xl mx-auto mb-3 text-spotify" />
                        <p className="text-base">אין נתונים מ־Spotify</p>
                      </div>
                    )}

                    {/* SoundCloud player */}
                    {hasSoundCloudContent ? (
                      <div className="glass-card-deep p-6 rounded-2xl glass-card-hover border-l-4 border-soundcloud">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-3 text-soundcloud">
                          <FaSoundcloud className="text-2xl" />
                          <span className="relative flex items-center gap-2">
                            Latest Uploads
                            <div className="w-2 h-2 rounded-full bg-orange-400 pulsing-dot" />
                          </span>
                        </h3>
                        <div className="rounded-xl overflow-hidden border-2 border-soundcloud/40 shadow-2xl shadow-soundcloud/20">
                          <iframe
                            width="100%"
                            height="300"
                            scrolling="no"
                            frameBorder="no"
                            allow="autoplay"
                            src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(
                              artist.soundcloud_profile_url || ""
                            )}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true`}
                          />
                        </div>
                        <div className="mt-4 flex items-center justify-center gap-2 text-orange-400 text-sm">
                          <FaVolumeUp className="animate-pulse" />
                          <span>Listen on SoundCloud</span>
                        </div>
                      </div>
                    ) : (
                      <div className="glass-card-deep p-6 rounded-2xl border border-white/10 text-center text-gray-400">
                        <FaSoundcloud className="text-5xl mx-auto mb-3 text-soundcloud" />
                        <p className="text-base">חסר קישור SoundCloud</p>
                      </div>
                    )}
                  </div>
                ) : null}

                {/* Instagram Reels */}
                {artist.instagram_reels && artist.instagram_reels.length > 0 && (
                  <div className="glass-card-deep p-7 rounded-2xl mt-10">
                    <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-pink-400">
                      <FaInstagram className="text-3xl" />
                      Instagram Highlights
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                      {artist.instagram_reels.slice(0, 6).map(
                        (reelUrl, index) => (
                          <div
                            key={index}
                            className="rounded-xl overflow-hidden shadow-2xl insta-gradient-border hover:scale-105 transition-transform"
                          >
                            <iframe
                              src={`${reelUrl.replace(/\/$/, "")}/embed`}
                              className="w-full h-[400px]"
                              frameBorder="0"
                              scrolling="no"
                              allowTransparency={true}
                              allow="encrypted-media"
                            />
                          </div>
                        )
                      )}
                    </div>
                    <a
                      href={artist.instagram_url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-300 text-base mt-6 flex items-center justify-end gap-2 hover:underline hover:text-pink-200 transition"
                    >
                      View more on Instagram
                      <FaArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t-2 border-white/20 bg-gradient-to-b from-black/80 to-black mt-20">
          <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-gray-300">
              <div className="flex items-center gap-3 text-lg">
                <FaBriefcase className="text-cyan-400 text-2xl" />
                <span>Management: {artist.name}</span>
              </div>
              <a
                href={`mailto:${primaryContactEmail}`}
                className="hover:text-white transition flex items-center gap-3 text-xl font-semibold"
              >
                <FaEnvelope className="text-cyan-400 text-2xl" />
                {primaryContactEmail}
              </a>
              <div className="flex gap-8 text-base">
                <Link href="/" className="hover:text-white transition">
                  בית
                </Link>
                <Link href="/episodes" className="hover:text-white transition">
                  פרקים
                </Link>
                <Link
                  href="/track-of-the-week"
                  className="hover:text-white transition"
                >
                  טראק השבוע
                </Link>
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
    // 1. Fetch artist
    const { data: artist, error: artistError } = await supabase
      .from("artists")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .single();

    if (artistError || !artist) {
      return { notFound: true };
    }

    // 2. Fetch most recent episode for this artist
    const { data: episodeRows, error: episodeError } = await supabase
      .from("artist_episodes")
      .select("episodes (*)")
      .eq("artist_id", artist.id)
      .order("episode_id", { ascending: false })
      .limit(1);

    if (episodeError) {
      console.error("artist_episodes error:", episodeError);
    }

    const episode =
      (episodeRows && episodeRows[0]
        ? (episodeRows[0].episodes as Episode)
        : null) || null;

    // 3. Fetch Spotify data
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
          const uniqueDiscography = (
            discography as SpotifyDiscographyItem[]
          ).filter(
            (item, index, self) =>
              index ===
              self.findIndex(
                (t) =>
                  t.name === item.name && t.releaseDate === item.releaseDate
              )
          );
          spotifyDiscography = uniqueDiscography;
        }
      } catch (error) {
        console.error("Spotify API error in SSR:", error);
      }
    }

    // 4. Finalize artist data
    const artistWithData: Artist = {
      ...artist,
      profile_photo_url: spotifyProfileImage,
      festival_sets: (artist.festival_sets as FestivalSet[]) || [],
      instagram_reels: artist.instagram_reels || [],
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
    console.error("Error in getServerSideProps:", error);
    return { notFound: true };
  }
};

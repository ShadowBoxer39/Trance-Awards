// pages/[slug].tsx – Artist page (festival YT data + fixed IG embeds)

import React, { useEffect, useState, useMemo } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { FaTiktok } from "react-icons/fa6";
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
  FaVolumeUp,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

// ---------- Types ----------

interface FestivalSet {
  youtube_id: string;
  festival?: string;
  year?: string;
  location?: string;
  // filled from YouTube API:
  title?: string;
  thumbnail?: string;
  duration_min?: number | null;
  views?: number | null;
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
   tiktok_url: string | null;
  website_url: string | null;
  genre: string | null;
  spotify_artist_id: string | null;
  started_year: number | null;
  instagram_reels: string[];
  festival_sets: FestivalSet[];
  primary_color: string;
  booking_agency_name?: string | null;
  booking_agency_email?: string | null;
  booking_agency_url?: string | null;
  record_label_name?: string | null;
  record_label_url?: string | null;
  management_email?: string | null;

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

// ---------- Helpers ----------

const formatLocation = (loc?: string) => {
  if (!loc) return "";
  const lower = loc.toLowerCase();
  if (lower === "central israel") return "ישראל";
  return loc;
};

const getReleaseTypeLabel = (item: SpotifyDiscographyItem) => {
  const nameLower = item.name.toLowerCase();

  // Explicit EP hints in the name
  if (nameLower.includes(" ep") || nameLower.endsWith("ep")) return "EP";

  // Treat 3+ tracks on a "single" as EP for this page
  if (item.type === "single" && item.totalTracks >= 3) return "EP";

  if (item.type === "album") return "אלבום";
  return "סינגל";
};

// Parse ISO8601 YT duration (e.g. PT1H23M45S) into minutes
const parseYouTubeDurationToMinutes = (duration?: string): number | null => {
  if (!duration) return null;
  const match =
    /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(duration);
  if (!match) return null;
  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);
  const totalMinutes = hours * 60 + minutes + seconds / 60;
  return Math.round(totalMinutes);
};

interface YouTubeVideoInfo {
  title: string | null;
  thumbnail: string | null;
  duration_min: number | null;
  views: number | null;
}

// Fetch video info from YouTube API
const fetchYouTubeVideoInfo = async (
  videoId: string
): Promise<YouTubeVideoInfo | null> => {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return null;

  try {
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as any;

    const item = data.items?.[0];
    if (!item) return null;

    const snippet = item.snippet || {};
    const stats = item.statistics || {};
    const details = item.contentDetails || {};

    const thumb =
      snippet.thumbnails?.medium?.url ||
      snippet.thumbnails?.standard?.url ||
      snippet.thumbnails?.high?.url ||
      null;

    return {
      title: snippet.title || null,
      thumbnail: thumb,
      duration_min: parseYouTubeDurationToMinutes(details.duration),
      views: stats.viewCount ? Number(stats.viewCount) : null,
    };
  } catch (err) {
    console.error("YouTube API error for video", videoId, err);
    return null;
  }
};

// ---------- Component ----------

// 3D Discography Carousel
interface DiscographyCarousel3DProps {
  items: SpotifyDiscographyItem[];
}

const DiscographyCarousel3D: React.FC<DiscographyCarousel3DProps> = ({
  items,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // limit how many items we put on the ring
  const visibleItems = useMemo(() => items.slice(0, 8), [items]);

  if (!visibleItems.length) return null;

  const stepAngle = 360 / visibleItems.length;
  const radius = 240; // slightly smaller radius – less warping

  const handleNext = () =>
    setActiveIndex((prev) => (prev + 1) % visibleItems.length);

  const handlePrev = () =>
    setActiveIndex((prev) => (prev - 1 + visibleItems.length) % visibleItems.length);

  const current = visibleItems[activeIndex];

  return (
    <div className="relative w-full flex flex-col items-center py-4">
      {/* Controls + current title */}
      <div className="flex items-center justify-between w-full mb-3">
        <div className="text-sm text-white/80 text-center px-2 truncate">
          {current?.name}
        </div>
      </div>

      {/* 3D ring */}
      <div
        style={{ perspective: "1600px" }}
        className="relative w-full h-[320px] md:h-[380px] overflow-visible flex justify-center"
      >
        {/* Left arrow – previous */}
        <button
          onClick={handlePrev}
          className="
            absolute left-4 top-1/2 -translate-y-1/2 z-20
            flex items-center justify-center
            w-9 h-9 rounded-full
            bg-black/40 border border-white/20
            hover:bg-white/10 hover:border-cyan-400
            transition
          "
        >
          <FaChevronLeft className="text-cyan-300" />
        </button>

        {/* Right arrow – next */}
        <button
          onClick={handleNext}
          className="
            absolute right-4 top-1/2 -translate-y-1/2 z-20
            flex items-center justify-center
            w-9 h-9 rounded-full
            bg-black/40 border border-white/20
            hover:bg-white/10 hover:border-cyan-400
            transition
          "
        >
          <FaChevronRight className="text-cyan-300" />
        </button>

        <div
          className="absolute inset-0 mx-auto"
          style={{
            transformStyle: "preserve-3d",
            transform: "translateX(-90px)",
          }}
        >
          {visibleItems.map((release, index) => {
            const angle = (index - activeIndex) * stepAngle;
            const isActive = index === activeIndex;

            return (
              <div
                key={release.id}
                className="
                  absolute left-1/2 top-1/2
                  transition-transform duration-500
                  hover:scale-[1.03]
                "
                style={{
                  transformStyle: "preserve-3d",
                  transform: `
                    rotateY(${angle}deg)
                    translateZ(${radius}px)
                    translateX(-50%)
                    translateY(-50%)
                  `,
                  transition:
                    "transform 800ms cubic-bezier(0.33, 1, 0.68, 1)",
                }}
              >
                <a
                  href={release.spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`rounded-3xl overflow-hidden border bg-black/70 backdrop-blur-sm w-[170px] md:w-[200px] block cursor-pointer transition-transform transition-shadow duration-500 ${
                    isActive
                      ? "border-cyan-400 shadow-[0_0_24px_rgba(34,211,238,0.45)] scale-[1.03]"
                      : "border-white/10 opacity-70 scale-[0.96]"
                  }`}
                >
                  <div className="relative w-full aspect-square">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={release.coverImage}
                      alt={release.name}
                      className="w-full h-full object-cover"
                    />
                    {/* year badge */}
                    <div className="absolute top-2 left-2 rounded-full px-2 py-0.5 text-[11px] bg-yellow-400 text-black font-bold">
                      {new Date(release.releaseDate).getFullYear()}
                    </div>
                  </div>
                  <div className="px-3 py-2 text-right">
                    <div className="text-sm font-semibold leading-tight truncate">
                      {release.name}
                    </div>
                    <div className="text-[11px] text-white/60">
                      {getReleaseTypeLabel(release)}
                    </div>
                    <div className="mt-1 text-[10px] text-emerald-300 flex items-center gap-1 justify-end">
                      <FaSpotify className="w-3 h-3" />
                      <span>נגן בספוטיפיי</span>
                    </div>
                  </div>
                </a>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 text-xs text-white/50 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <span>השתמש בחצים כדי לסובב את הדיסקוגרפיה</span>
      </div>
    </div>
  );
};

// ---------- SEO helpers ----------

const buildMetaTitle = (artist: Artist) => {
  const displayName = artist.stage_name || artist.name;
  const genre = artist.genre || "Psytrance";
  // keep it short but rich in keywords (≈ 55–60 chars)
  return `${displayName} – ${genre} artist | TrackTrip`;
};

const buildMetaDescription = (
  artist: Artist,
  totalTracksOut: number,
  totalAlbums: number,
  firstMusicYear: number | null
) => {
  const displayName = artist.stage_name || artist.name;
  const genre = artist.genre || "פסייטראנס";
  const yearPart = firstMusicYear ? ` יוצר מאז ${firstMusicYear},` : "";
  const albumsPart =
    totalAlbums > 0 ? ` ${totalAlbums} אלבומים ו` : "";
  const tracksPart =
    totalTracksOut > 0 ? ` יותר מ-${totalTracksOut} טראקים בחוץ,` : "";

  const baseBio =
    artist.short_bio ||
    (artist as any).bio ||
    `${displayName} הוא אמן ${genre} ישראלי.`;

  // keep under ~155 chars where possible
  return `${displayName} – אמן ${genre} ישראלי.${yearPart}${tracksPart}${albumsPart} בדף זה: ביוגרפיה, סטים, דיסקוגרפיה וקישורים רשמיים. ${baseBio}`;
};




export default function ArtistPage({
  artist,
  episode,
  spotifyTopTracks,
  spotifyDiscography,
}: ArtistPageProps) {
  const totalTracksOut = spotifyDiscography.reduce(
    (sum, release) =>
      sum +
      // adjust these property names to match your SpotifyDiscographyItem
      (release.totalTracks ?? (release as any).total_tracks ?? 0),
    0
  );
  const displayName = artist.stage_name || artist.name;
  const accentColor = artist.primary_color || "#00e0ff";
    const bioText =
    artist.short_bio ||
    (artist as any).bio ||
    "אמן טראנס ישראלי פורץ דרך, מפיק סאונד ייחודי המשלב אנרגיה גבוהה עם עומק מלודי.";
const getInstagramEmbedUrl = (url: string) => {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);

    if (
      parts.length >= 2 &&
      (parts[0] === "reel" || parts[0] === "p" || parts[0] === "tv")
    ) {
      return `https://www.instagram.com/${parts[0]}/${parts[1]}/embed`;
    }

    return `${url.replace(/\/$/, "")}/embed`;
  } catch {
    return `${url.replace(/\/$/, "")}/embed`;
  }
};

  const [activeTrackId, setActiveTrackId] = useState<string | null>(
    spotifyTopTracks[0]?.id ?? null
  );

  useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
    document.documentElement.lang = "he";
  }, []);

  const dynamicStyle = {
    "--accent-color": accentColor,
    "--spotify-color": "#1DB954",
    "--soundcloud-color": "#FF5500",
  } as React.CSSProperties;

const firstMusicYear = artist.started_year || null;


const totalReleases = spotifyDiscography.length;

  const mainFestivalSet =
  artist.festival_sets && artist.festival_sets.length > 0
    ? artist.festival_sets[0]
    : null;


// albums from Spotify discography
const totalAlbums = spotifyDiscography.filter(
  (item) => item.type === "album"
).length;

  const seoTitle = buildMetaTitle(artist);
const seoDescription = buildMetaDescription(
  artist,
  totalTracksOut,
  totalAlbums,
  firstMusicYear
);



  const socialLinks = [
    {
      icon: FaInstagram,
      url: artist.instagram_url,
      label: "אינסטגרם",
      color: "text-pink-400",
      hover: "hover:text-pink-300",
    },
    {
      icon: FaSoundcloud,
      url: artist.soundcloud_profile_url,
      label: "סאונדקלאוד",
      color: "text-orange-400",
      hover: "hover:text-orange-300",
    },
    {
      icon: FaSpotify,
      url: artist.spotify_url,
      label: "ספוטיפיי",
      color: "text-green-400",
      hover: "hover:text-green-300",
    },
    {
      icon: FaYoutube,
      url: artist.youtube_url,
      label: "יוטיוב",
      color: "text-red-400",
      hover: "hover:text-red-300",
    },
    {
    icon: FaTiktok,
    url: artist.tiktok_url,
    label: "טיקטוק",
    color: "text-white",
    hover: "hover:text-gray-300",
  },
    {
      icon: FaFacebook,
      url: artist.facebook_url,
      label: "פייסבוק",
      color: "text-blue-400",
      hover: "hover:text-blue-300",
    },
  ].filter((link) => link.url);

  const primaryContactEmail =
  artist.booking_agency_email ||
  artist.booking_email ||
  artist.management_email ||
  `booking@${artist.slug}.com`;

  const bookingLogo =
    artist.booking_name === "Sonic Booking" ? "/images/sonic.jpg" : null;
  const labelLogo =
    artist.label_name === "Shamanic Tales" ? "/images/shamanic.jpg" : null;

  const hasSoundCloudContent = !!artist.soundcloud_profile_url;

  const customStyles = `
    .glass-card {
      background: rgba(7,10,24,0.96);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 0.75rem;
    }
    .glass-hover:hover {
      border-color: var(--accent-color);
      box-shadow: 0 10px 30px rgba(0,0,0,0.7);
    }
    .gradient-title {
      background: linear-gradient(90deg, var(--accent-color), #ec4899, #06b6d4);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .discography-scroll {
      scrollbar-width: thin;
      scrollbar-color: rgba(148,163,184,0.8) transparent;
    }
    .discography-scroll::-webkit-scrollbar {
      height: 6px;
    }
    .discography-scroll::-webkit-scrollbar-track {
      background: rgba(15,23,42,0.8);
      border-radius: 999px;
    }
    .discography-scroll::-webkit-scrollbar-thumb {
      background: linear-gradient(90deg, var(--accent-color), #0ea5e9);
      border-radius: 999px;
    }

    /* HERO AREA */
    .hero-header-bg {
      background:
        radial-gradient(circle at top left, rgba(56,189,248,0.28), transparent 55%),
        radial-gradient(circle at bottom right, rgba(236,72,153,0.22), transparent 60%),
        radial-gradient(circle at top right, rgba(94,234,212,0.18), transparent 55%);
    }

    .hero-photo {
      box-shadow: 0 0 0 0 rgba(56,189,248,0.5);
      animation: heroPulse 4.5s ease-in-out infinite;
      transition: transform 0.25s ease, box-shadow 0.25s ease;
    }
    .hero-photo:hover {
      transform: scale(1.04);
      box-shadow: 0 0 40px rgba(56,189,248,0.7);
    }

    .hero-tag-line {
      position: relative;
    }
    .hero-tag-line::after {
      content: "";
      position: absolute;
      inset-inline-end: 0;
      bottom: -6px;
      width: 90px;
      height: 2px;
      border-radius: 999px;
      background: linear-gradient(90deg, var(--accent-color), #ec4899);
      opacity: 0.9;
    }

    .hero-stat-card {
      border-radius: 999px;
      background: radial-gradient(circle at 0% 0%, rgba(15,23,42,0.9), rgba(15,23,42,0.6));
      border: 1px solid rgba(148,163,184,0.4);
      box-shadow: 0 10px 30px rgba(15,23,42,0.8);
    }

    @keyframes heroPulse {
      0% { box-shadow: 0 0 0 0 rgba(56,189,248,0.5); }
      50% { box-shadow: 0 0 32px 8px rgba(236,72,153,0.6); }
      100% { box-shadow: 0 0 0 0 rgba(56,189,248,0.5); }
    }
  `;


  return (
    <>
     <Head>
  <title>{seoTitle}</title>
  <meta name="description" content={seoDescription} />

  {/* --- Canonical URL --- */}
  <link
    rel="canonical"
    href={`https://www.tracktrip.co.il/${artist.slug}`}
  />

  {/* --- Social Share Preview (OG + Twitter) --- */}
  <meta property="og:title" content={seoTitle} />
  <meta property="og:description" content={seoDescription} />
  <meta property="og:type" content="website" />
  <meta
    property="og:url"
    content={`https://www.tracktrip.co.il/${artist.slug}`}
  />
  <meta property="og:image" content={artist.profile_photo_url || ""} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="1200" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={seoTitle} />
  <meta name="twitter:description" content={seoDescription} />
  <meta name="twitter:image" content={artist.profile_photo_url || ""} />

<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "MusicGroup",
      name: displayName,
      genre: artist.genre || "Psytrance",
      url: `https://www.tracktrip.co.il/${artist.slug}`,
      image: artist.profile_photo_url || undefined,
      foundingLocation: "Israel",
      foundingDate: firstMusicYear ? `${firstMusicYear}-01-01` : undefined,
      sameAs: [
        artist.spotify_url,
        artist.youtube_url,
        artist.instagram_url,
        artist.facebook_url,
        artist.soundcloud_profile_url,
        artist.website_url,
      ].filter(Boolean),
    }),
  }}
/>
       
</Head>


      <style jsx global>{customStyles}</style>

      <div
        className="min-h-screen text-white bg-gradient-to-b from-[#050814] via-[#050017] to-black"
        style={dynamicStyle}
      >
        {/* NAV */}
        <div className="sticky top-0 z-50 bg-black/90 backdrop-blur-lg border-b border-white/10">
          <Navigation currentPage="episodes" />
        </div>

  {/* HERO */}
<section className="relative py-12 px-6 hero-header-bg overflow-hidden">
  {/* soft background orbs */}
  <div className="pointer-events-none absolute -right-32 -top-32 w-72 h-72 rounded-full bg-cyan-500/20 blur-3xl" />
  <div className="pointer-events-none absolute -left-32 bottom-0 w-80 h-80 rounded-full bg-pink-500/15 blur-3xl" />

  <div className="relative max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-stretch gap-10">
    {/* Photo */}
    <div className="order-1 md:order-2 flex justify-center md:justify-end flex-1 md:flex-none">
      <div className="relative">
        {/* subtle glowing ring behind the avatar */}
        <div className="absolute inset-[-14px] rounded-full bg-gradient-to-tr from-cyan-500/60 via-purple-500/60 to-pink-500/60 blur-xl opacity-80" />
        <div className="w-52 h-52 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-[var(--accent-color)] hero-photo relative">
          {artist.profile_photo_url ? (
            <img
              src={artist.profile_photo_url}
              alt={`${displayName} artist photo`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center">
              <span className="text-5xl font-black">
                {displayName[0]}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Text + stats */}
    <div className="flex-1 text-center md:text-right order-2 md:order-1">
      {/* genre pill + “Psytrance artist” */}
      <div className="flex flex-wrap justify-center md:justify-end gap-2 mb-3">
        <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-[11px] uppercase tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {artist.genre || "Psytrance"}
        </span>
        {firstMusicYear && (
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-black/40 border border-white/15 rounded-full text-[11px]">
            יוצר מאז {firstMusicYear}
          </span>
        )}
      </div>

      <h1 className="hero-tag-line text-4xl md:text-5xl lg:text-6xl font-extrabold mb-3 gradient-title">
        {displayName} <span className="sr-only">Israeli Trance Artist</span>
      </h1>

      <p className="text-gray-200 text-base md:text-lg mb-6 max-w-xl mx-auto md:mx-0 leading-relaxed">
        {bioText}
      </p>

      {/* Stats as chips */}
      <div className="flex flex-wrap justify-center md:justify-end gap-4 mb-6">
        <div className="hero-stat-card px-4 py-2 flex items-center gap-2 text-xs">
          <div className="text-2xl font-bold text-cyan-300 leading-none">
            {totalTracksOut}
          </div>
          <div className="text-[11px] text-gray-300 flex items-center gap-1">
            <FaMusic className="w-3 h-3 text-cyan-300" />
            <span>טראקים בחוץ</span>
          </div>
        </div>

        {totalAlbums > 0 && (
          <div className="hero-stat-card px-4 py-2 flex items-center gap-2 text-xs">
            <div className="text-2xl font-bold text-cyan-300 leading-none">
              {totalAlbums}
            </div>
            <div className="text-[11px] text-gray-300 flex items-center gap-1">
              <FaStar className="w-3 h-3 text-yellow-400" />
              <span>אלבומים</span>
            </div>
          </div>
        )}
      </div>

      {/* CTAs & socials */}
      <div className="flex flex-col md:flex-row items-center md:items-center gap-4 md:gap-6 justify-center md:justify-end">
        <div className="flex gap-3">
          {artist.spotify_url && (
            <a
              href={artist.spotify_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/90 hover:bg-emerald-400 text-xs font-semibold text-black shadow-lg shadow-emerald-500/30 transition"
            >
              <FaSpotify className="w-4 h-4" />
              האזנה בספוטיפיי
            </a>
          )}
          {primaryContactEmail && (
            <a
              href={`mailto:${primaryContactEmail}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/25 bg-black/40 hover:bg-white/10 text-xs font-semibold text-white transition"
            >
              <FaEnvelope className="w-4 h-4 text-cyan-300" />
              יצירת קשר
            </a>
          )}
        </div>

        {/* Social icons */}
        <div className="flex flex-wrap justify-center md:justify-end gap-3">
          {socialLinks.map((link, index) => (
            <a
              key={index}
              href={link.url!}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-2xl ${link.color} ${link.hover} transition-transform hover:scale-110`}
              title={link.label}
            >
              <link.icon className="w-5 h-5" />
            </a>
          ))}
        </div>
      </div>
    </div>
  </div>
</section>


        {/* MAIN 2-COLUMN LAYOUT */}
        <section className="pb-10 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT: Media + Disco + IG */}
            <div className="space-y-6 lg:col-span-2">
              {/* MEDIA CENTER */}
              <div className="glass-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <span>מרכז מדיה</span>
                    <FaBroadcastTower className="text-red-400" />
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Festival set */}
                  {mainFestivalSet && (
                    <div className="bg-black/40 border border-white/10 rounded-lg p-3">
                      <h3 className="text-sm font-semibold mb-2 flex items-center gap-1 text-pink-200">
                        סט פסטיבל נבחר
                        <FaStar className="text-yellow-400 text-xs" />
                      </h3>
                      <div className="aspect-video rounded-md overflow-hidden border border-white/10 mb-2">
                        <iframe
                          src={`https://www.youtube.com/embed/${mainFestivalSet.youtube_id}?rel=0&modestbranding=1`}
                          title={mainFestivalSet.title || mainFestivalSet.youtube_id}
                          className="w-full h-full"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-gray-300">
                        <span>
                          {mainFestivalSet.festival || ""}
                          {mainFestivalSet.year
                            ? ` • ${mainFestivalSet.year}`
                            : ""}
                        </span>
                      <span>
  {mainFestivalSet.duration_min
    ? `${mainFestivalSet.duration_min} דק׳`
    : ""}
  {typeof mainFestivalSet.views === "number"
    ? `${
        mainFestivalSet.duration_min ? " • " : ""
      }${mainFestivalSet.views.toLocaleString()} צפיות`
    : ""}
</span>

                      </div>
                    </div>
                  )}

                  {/* Track Trip episode */}
                  {episode && (
                    <div className="bg-black/40 border border-white/10 rounded-lg p-3">
                      <h3 className="text-sm font-semibold mb-2 flex items-center gap-1 text-purple-200">
                        ראיון בתוכנית
                        <FaYoutube className="text-xs text-purple-300" />
                      </h3>
                      <div className="aspect-video rounded-md overflow-hidden border border-white/10 mb-2">
                        <iframe
                          src={`https://www.youtube.com/embed/${episode.youtube_video_id}?rel=0&modestbranding=1`}
                          title={episode.title}
                          className="w-full h-full"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-gray-300">
                        <div className="flex-1 text-right">
                          <div className="font-semibold truncate">
                            {episode.clean_title || episode.title}
                          </div>
                          <div className="text-[10px] text-gray-400 mt-1">
                            פרק {episode.episode_number ?? "?"} •{" "}
                            {new Date(
                              episode.published_at
                            ).toLocaleDateString("he-IL")}
                          </div>
                        </div>
                        {episode.view_count && (
                          <div className="text-[10px] text-gray-400 pl-2">
                            {episode.view_count.toLocaleString()} צפיות
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

                           {/* DISCOGRAPHY */}
              {spotifyDiscography.length > 0 && (
                <div className="glass-card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <span>דיסקוגרפיה</span>
                      <FaCompactDisc className="text-cyan-400" />
                    </h2>
                  </div>

                  {/* Desktop / tablet: 3D ring */}
                 <div className="hidden md:flex justify-center items-center ml-[-20px]">
  <DiscographyCarousel3D items={spotifyDiscography} />
</div>

                  {/* Mobile fallback: simple horizontal scroll (old design) */}
                  <div className="block md:hidden">
                    <div className="overflow-x-auto discography-scroll pb-2">
                      <div className="flex gap-3 min-w-max">
                        {spotifyDiscography.slice(0, 8).map((album) => (
                          <a
                            key={album.id}
                            href={album.spotifyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-40 flex-shrink-0 bg-black/40 border border-white/10 rounded-lg p-2 hover:bg-black/70 hover:border-[var(--accent-color)] transition group"
                          >
                            <div className="relative h-36 rounded-md overflow-hidden mb-2 shadow-lg">
                              <img
                                src={album.coverImage}
                               alt={`${album.name} – עטיפת אלבום של ${displayName}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute top-1 left-1 px-2 py-0.5 rounded-full bg-yellow-400 text-black text-[10px] font-bold">
                                {new Date(album.releaseDate).getFullYear()}
                              </div>
                            </div>
                            <div className="text-xs font-semibold truncate">
                              {album.name}
                            </div>
                            <div className="text-[11px] text-gray-400 mt-0.5">
                              {getReleaseTypeLabel(album)}
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>

                  {artist.spotify_url && (
                    <div className="flex justify-end mt-2">
                      <Link
                        href={artist.spotify_url}
                        target="_blank"
                        className="text-xs text-cyan-300 flex items-center gap-1 hover:text-cyan-200 hover:underline transition"
                      >
                        לצפייה בקטלוג המלא
                        <FaArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>
              )}


              {/* INSTAGRAM REELS */}
           {artist.instagram_reels && artist.instagram_reels.length > 0 && (
  <div className="glass-card p-4">
    <h3 className="text-xl font-bold mb-3 flex items-center gap-2 text-pink-400">
      <FaInstagram className="text-2xl" />
      היילייטס מאינסטגרם
    </h3>

    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {artist.instagram_reels.slice(0, 6).map((reelUrl, index) => (
        <div
          key={index}
          className="rounded-lg overflow-hidden border border-pink-400/40 hover:scale-105 transition-transform"
        >
          <iframe
            src={getInstagramEmbedUrl(reelUrl)}
            className="w-full h-[360px]"
            frameBorder="0"
            scrolling="no"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      ))}
    </div>
  </div>
)}

            </div>

            {/* RIGHT: Representation + Spotify + SC + Contact */}
            <div className="space-y-6 lg:col-span-1">
           {/* REPRESENTATION */}
<div>
  <h2 className="text-xl font-bold mb-3 flex items-center gap-2 justify-center lg:justify-start">
    <span>ייצוג</span>
    <FaBriefcase className="text-cyan-400" />
  </h2>

  <div className="glass-card p-3 space-y-3">
    {/* Booking */}
    {artist.booking_agency_name || artist.booking_agency_url ? (
      <div className="bg-black/70 border border-white/10 rounded-lg p-3 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          {bookingLogo && (
            <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
              <Image
                src={bookingLogo}
                alt={artist.booking_agency_name || "Booking"}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1 text-right">
            <div className="text-[11px] text-gray-400">בוקינג</div>
            <div className="text-sm font-semibold">
              {artist.booking_agency_name}
            </div>
            {artist.booking_agency_email && (
              <div className="text-[11px] text-gray-400">
                {artist.booking_agency_email}
              </div>
            )}
          </div>
        </div>

        {artist.booking_agency_url && (
          <a
            href={
              artist.booking_agency_url.startsWith("http")
                ? artist.booking_agency_url
                : `https://${artist.booking_agency_url.replace(/^\/+/, "")}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-1 px-3 py-1.5 rounded-full border border-white/30 text-[11px] hover:border-cyan-400 hover:text-cyan-300 transition"
          >
            לאתר הסוכנות
            <FaExternalLinkAlt className="w-3 h-3" />
          </a>
        )}
      </div>
    ) : null}

    {/* Label */}
    {artist.record_label_name || artist.record_label_url ? (
      <div className="bg-black/70 border border-white/10 rounded-lg p-3 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          {labelLogo && (
            <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
              <Image
                src={labelLogo}
                alt={artist.record_label_name || "Label"}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1 text-right">
            <div className="text-[11px] text-gray-400">לייבל</div>
            <div className="text-sm font-semibold">
              {artist.record_label_name}
            </div>
          </div>
        </div>

        {artist.record_label_url && (
          <a
            href={
              artist.record_label_url.startsWith("http")
                ? artist.record_label_url
                : `https://${artist.record_label_url.replace(/^\/+/, "")}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-1 px-3 py-1.5 rounded-full border border-white/30 text-[11px] hover:border-pink-400 hover:text-pink-300 transition"
          >
            לאתר הלייבל
            <FaExternalLinkAlt className="w-3 h-3" />
          </a>
        )}
      </div>
    ) : null}
  </div>
</div>


              {/* SPOTIFY TOP TRACKS */}
              {spotifyTopTracks.length > 0 && (
                <div className="glass-card p-3 glass-hover border-l-4 border-[var(--spotify-color)]">
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-[var(--spotify-color)]">
                    <FaSpotify className="text-xl" />
                    טראקים פופולריים
                  </h3>

                  <div className="space-y-2 mb-2">
                    {spotifyTopTracks.map((track, index) => {
                      const isActive = track.id === activeTrackId;
                      return (
                        <button
                          key={track.id}
                          type="button"
                          onClick={() => setActiveTrackId(track.id)}
                          className={`w-full flex items-center gap-3 p-2 rounded-lg border text-right transition ${
                            isActive
                              ? "bg-spotify/20 border-spotify/70"
                              : "bg-white/5 border-white/10"
                          }`}
                        >
                          <span className="text-xs text-gray-300 ml-1">
                            {index + 1}
                          </span>
                          <img
                            src={track.album.images[0]?.url}
                            alt={track.album.name}
                            className="w-9 h-9 rounded-md object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold truncate">
                              {track.name}
                            </div>
                            <div className="text-[10px] text-gray-400 truncate">
                              {track.album.name}
                            </div>
                          </div>
                          <FaPlay
                            className={`text-[11px] ${
                              isActive ? "text-white" : "text-spotify"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>

                  {activeTrackId && (
                    <div className="rounded-lg overflow-hidden border border-white/10">
                      <iframe
                        src={`https://open.spotify.com/embed/track/${activeTrackId}`}
                        width="100%"
                        height="80"
                        frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {artist.spotify_url && (
                    <div className="mt-2 text-[10px] text-gray-400 flex items-center justify-between">
                      <span>ניגון דרך ספוטיפיי</span>
                      <a
                        href={artist.spotify_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-spotify hover:text-green-300 transition"
                      >
                        פתח את האמן בספוטיפיי
                        <FaExternalLinkAlt className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* SOUNDCLOUD */}
              {hasSoundCloudContent && (
                <div className="glass-card p-3 glass-hover border-l-4 border-[var(--soundcloud-color)]">
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-[var(--soundcloud-color)]">
                    <FaSoundcloud className="text-xl" />
                    שחרורים אחרונים בסאונדקלאוד
                  </h3>
                  <div className="rounded-lg overflow-hidden border border-[var(--soundcloud-color)]/40">
                    <iframe
                      width="100%"
                      height="320"
                      scrolling="no"
                      frameBorder="no"
                      allow="autoplay"
                      src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(
                        artist.soundcloud_profile_url || ""
                      )}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=true&show_user=true&show_reposts=false&show_teaser=false&visual=false`}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-center gap-2 text-[var(--soundcloud-color)] text-xs">
                    <FaVolumeUp className="animate-pulse" />
                    <span>המשך להאזין בסאונדקלאוד</span>
                  </div>
                </div>
              )}

              {/* CONTACT */}
              <div className="glass-card p-3">
                <h3 className="text-base font-semibold text-center mb-2">
                  פרטי קשר
                </h3>
                <div className="text-[11px] text-gray-400 text-center mb-1">
                  הזמנות / ניהול
                </div>
                <div className="flex items-center justify-center gap-2 text-xs">
                  <FaEnvelope className="text-cyan-400" />
                  <a
                    href={`mailto:${primaryContactEmail}`}
                    className="hover:text-cyan-300 transition"
                  >
                    {primaryContactEmail}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-white/15 bg-black/90">
          <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-gray-400 text-xs">
            <div>© 2025 יוצאים לטראק • כל הזכויות שמורות</div>
            <div className="flex gap-4">
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
        </footer>
      </div>
    </>
  );
}

// ---------- Server-side props ----------

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const slug = params?.slug as string;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

try {
  const { data: artistRow, error: artistError } = await supabase
    .from("artists")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (artistError || !artistRow) {
    return { notFound: true };
  }

  // normalize
  const artist = {
    ...artistRow,
    short_bio:
      (artistRow as any).short_bio ??
      (artistRow as any).bio ??
      null,
  };

    // Episodes for this artist
    const { data: episodeRows, error: episodeError } = await supabase
      .from("artist_episodes")
      .select("episodes (*)")
      .eq("artist_id", artist.id)
      .order("episode_id", { ascending: false });

    if (episodeError) {
      console.error("artist_episodes error:", episodeError);
    }

    let selectedEpisode: Episode | null = null;

    if (episodeRows && episodeRows.length > 0) {
      const allEpisodes: Episode[] = [];

      for (const row of episodeRows) {
        const raw = (row as any).episodes;
        if (!raw) continue;
        if (Array.isArray(raw)) {
          allEpisodes.push(...(raw as Episode[]));
        } else {
          allEpisodes.push(raw as Episode);
        }
      }

      const nameLower = (artist.stage_name || artist.name).toLowerCase();

      selectedEpisode =
        allEpisodes.find((e) => {
          const t = (e.title || "").toLowerCase();
          const ct = (e.clean_title || "").toLowerCase();
          return t.includes(nameLower) || ct.includes(nameLower);
        }) ||
        allEpisodes
          .filter((e) => typeof e.episode_number === "number")
          .sort(
            (a, b) =>
              (a.episode_number ?? 9999) - (b.episode_number ?? 9999)
          )[0] ||
        null;
    }

    // Spotify data
   let spotifyTopTracks: SpotifyTrack[] = [];
let spotifyDiscography: SpotifyDiscographyItem[] = [];

// Start with the image from the DB
let spotifyProfileImage = artist.profile_photo_url || null;

if (artist.spotify_artist_id) {
  try {
    const [profile, topTracks, discography] = await Promise.all([
      getArtistProfile(artist.spotify_artist_id),
      getArtistTopTracks(artist.spotify_artist_id),
      getArtistDiscography(artist.spotify_artist_id),
    ]);

    // --- FIXED: Use Spotify image only if DB image is missing ---
    if (!spotifyProfileImage && profile?.image) {
      spotifyProfileImage = profile.image;
    }

    if (Array.isArray(topTracks)) {
      spotifyTopTracks = topTracks as unknown as SpotifyTrack[];
    }

    if (Array.isArray(discography)) {
      const unique = (discography as SpotifyDiscographyItem[]).filter(
        (item, index, self) =>
          index ===
          self.findIndex(
            (t) =>
              t.name === item.name && t.releaseDate === item.releaseDate
          )
      );

      spotifyDiscography = unique;
    }
  } catch (err) {
    console.error("Spotify API error:", err);
  }
}


    // Enrich festival sets with YouTube data
    let festivalSets: FestivalSet[] =
      (artist.festival_sets as FestivalSet[]) || [];
    if (festivalSets.length) {
      const enriched: FestivalSet[] = [];
      for (const set of festivalSets) {
        if (!set.youtube_id) {
          enriched.push(set);
          continue;
        }
        const info = await fetchYouTubeVideoInfo(set.youtube_id);
        enriched.push({
          ...set,
          ...(info || {}),
        });
      }
      festivalSets = enriched;
    }

    const artistWithData: Artist = {
      ...(artist as any),
      profile_photo_url: spotifyProfileImage,
      festival_sets: festivalSets,
      instagram_reels: artist.instagram_reels || [],
      achievements: (artist.achievements as Achievement[]) || [],
    };

    return {
      props: {
        artist: artistWithData,
        episode: selectedEpisode,
        spotifyTopTracks,
        spotifyDiscography,
      },
    };
  } catch (err) {
    console.error("getServerSideProps error:", err);
    return { notFound: true };
  }
};

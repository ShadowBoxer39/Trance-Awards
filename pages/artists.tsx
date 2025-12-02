// pages/artists.tsx - Israeli Artists Directory
import React, { useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { GetServerSideProps } from "next";
import { createClient } from "@supabase/supabase-js";
import Navigation from "../components/Navigation";
import {
  FaInstagram,
  FaSoundcloud,
  FaSpotify,
  FaYoutube,
  FaMusic,
  FaArrowLeft,
} from "react-icons/fa";

interface Artist {
  id: number;
  slug: string;
  name: string;
  stage_name: string;
  bio: string | null;
  profile_photo_url: string | null;
  genre: string | null;
  started_year: number | null;
  instagram_url: string | null;
  soundcloud_url: string | null;
  spotify_url: string | null;
  youtube_url: string | null;
  primary_color: string | null;
}

interface ArtistsPageProps {
  artists: Artist[];
}

export default function ArtistsPage({ artists }: ArtistsPageProps) {
  useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
    document.documentElement.lang = "he";
  }, []);

  return (
    <>
      <Head>
        <title>האמנים שלנו | יוצאים לטראק</title>
        <meta
          name="description"
          content="גלו את אמני הטראנס והפסייטראנס הישראליים המובילים. פרופילים מלאים, דיסקוגרפיה, סטים וראיונות בלעדיים."
        />
        <meta property="og:title" content="האמנים שלנו | יוצאים לטראק" />
        <meta
          property="og:description"
          content="גלו את אמני הטראנס והפסייטראנס הישראליים המובילים."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.tracktrip.co.il/artists" />
        <link rel="canonical" href="https://www.tracktrip.co.il/artists" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-[#050814] via-[#0a0a1f] to-black text-white">
        {/* Navigation */}
        <div className="sticky top-0 z-50 bg-black/90 backdrop-blur-lg border-b border-white/10">
          <Navigation currentPage="artists" />
        </div>

        {/* Hero Section */}
        <section className="relative py-16 px-6 overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-cyan-500/15 rounded-full blur-[100px]" />
          </div>

          <div className="relative max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-purple-300 mb-6">
              <FaMusic className="text-purple-400" />
              <span>{artists.length} אמנים</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black mb-4">
              <span className="bg-gradient-to-l from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                האמנים שלנו
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
              הכירו את אמני הטראנס הישראליים שהתארחו בתוכנית.
              <br />
              פרופילים מלאים, דיסקוגרפיה, סטים וראיונות בלעדיים.
            </p>
          </div>
        </section>

        {/* Artists Grid */}
        <section className="px-6 pb-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {artists.map((artist) => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-black/80">
          <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-gray-400 text-sm">
            <div>© 2025 יוצאים לטראק • כל הזכויות שמורות</div>
            <div className="flex gap-6">
              <Link href="/" className="hover:text-white transition">
                בית
              </Link>
              <Link href="/episodes" className="hover:text-white transition">
                פרקים
              </Link>
              <Link href="/legends" className="hover:text-white transition">
                אגדות
              </Link>
            </div>
          </div>
        </footer>
      </div>

      <style jsx global>{`
        .artist-card {
          position: relative;
          border-radius: 1rem;
          overflow: hidden;
          background: rgba(15, 15, 35, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .artist-card:hover {
          transform: translateY(-8px) scale(1.02);
          border-color: rgba(168, 85, 247, 0.5);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4),
            0 0 60px rgba(168, 85, 247, 0.15);
        }

        .artist-card .card-image {
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .artist-card:hover .card-image {
          transform: scale(1.1);
        }

        .artist-card .hover-content {
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .artist-card:hover .hover-content {
          opacity: 1;
          transform: translateY(0);
        }

        .artist-card .overlay {
          background: linear-gradient(
            to top,
            rgba(0, 0, 0, 0.95) 0%,
            rgba(0, 0, 0, 0.7) 50%,
            transparent 100%
          );
          transition: all 0.4s ease;
        }

        .artist-card:hover .overlay {
          background: linear-gradient(
            to top,
            rgba(0, 0, 0, 0.98) 0%,
            rgba(0, 0, 0, 0.85) 60%,
            rgba(0, 0, 0, 0.4) 100%
          );
        }

        .social-icon {
          transition: all 0.2s ease;
        }

        .social-icon:hover {
          transform: scale(1.2);
        }
      `}</style>
    </>
  );
}

// Artist Card Component
function ArtistCard({ artist }: { artist: Artist }) {
  const accentColor = artist.primary_color || "#a855f7";

  const socialLinks = [
    { icon: FaSpotify, url: artist.spotify_url, color: "#1DB954" },
    { icon: FaInstagram, url: artist.instagram_url, color: "#E4405F" },
    { icon: FaSoundcloud, url: artist.soundcloud_url, color: "#FF5500" },
    { icon: FaYoutube, url: artist.youtube_url, color: "#FF0000" },
  ].filter((link) => link.url);

  // Truncate bio for preview
  const bioPreview = artist.bio
    ? artist.bio.length > 100
      ? artist.bio.substring(0, 100) + "..."
      : artist.bio
    : null;

  return (
    <Link href={`/${artist.slug}`} className="block">
      <div className="artist-card group aspect-[3/4] relative">
        {/* Image */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          {artist.profile_photo_url ? (
            <img
              src={artist.profile_photo_url}
              alt={artist.stage_name}
              className="card-image w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${accentColor}40, ${accentColor}10)`,
              }}
            >
              <span className="text-6xl font-black text-white/30">
                {artist.stage_name[0]}
              </span>
            </div>
          )}
        </div>

        {/* Overlay */}
        <div className="overlay absolute inset-0 rounded-2xl" />

        {/* Content */}
        <div className="absolute inset-0 p-4 flex flex-col justify-end">
          {/* Genre badge */}
          {artist.genre && (
            <div className="absolute top-3 right-3">
              <span
                className="px-2 py-1 text-[10px] font-semibold rounded-full bg-black/50 backdrop-blur-sm border border-white/20"
                style={{ color: accentColor }}
              >
                {artist.genre}
              </span>
            </div>
          )}

          {/* Main info (always visible) */}
          <div className="mb-2">
            <h3 className="text-xl md:text-2xl font-bold text-white leading-tight">
              {artist.stage_name}
            </h3>
            {artist.started_year && (
              <p className="text-xs text-gray-400 mt-1">
                יוצר מאז {artist.started_year}
              </p>
            )}
          </div>

          {/* Hover content */}
          <div className="hover-content">
            {/* Bio preview */}
            {bioPreview && (
              <p className="text-xs text-gray-300 leading-relaxed mb-3 line-clamp-3">
                {bioPreview}
              </p>
            )}

            {/* Social links */}
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-3 mb-3">
                {socialLinks.map((link, index) => (
                  <span
                    key={index}
                    className="social-icon text-lg"
                    style={{ color: link.color }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.open(link.url!, "_blank");
                    }}
                  >
                    <link.icon />
                  </span>
                ))}
              </div>
            )}

            {/* View profile button */}
            <div
              className="flex items-center gap-2 text-sm font-medium transition-colors"
              style={{ color: accentColor }}
            >
              <span>לפרופיל המלא</span>
              <FaArrowLeft className="text-xs" />
            </div>
          </div>
        </div>

        {/* Accent border on hover */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            boxShadow: `inset 0 0 0 2px ${accentColor}50`,
          }}
        />
      </div>
    </Link>
  );
}

// Server-side data fetching
export const getServerSideProps: GetServerSideProps = async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { data: artists, error } = await supabase
      .from("artists")
      .select(
        `
        id,
        slug,
        name,
        stage_name,
        bio,
        profile_photo_url,
        genre,
        started_year,
        instagram_url,
        soundcloud_url,
        spotify_url,
        youtube_url,
        primary_color
      `
      )
      .eq("is_published", true)
      .order("stage_name", { ascending: true });

    if (error) {
      console.error("Error fetching artists:", error);
      return { props: { artists: [] } };
    }

    return {
      props: {
        artists: artists || [],
      },
    };
  } catch (err) {
    console.error("getServerSideProps error:", err);
    return { props: { artists: [] } };
  }
};

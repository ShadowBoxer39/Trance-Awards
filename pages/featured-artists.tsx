// pages/featured-artists.tsx - Featured Artists Directory
import React, { useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { createClient } from "@supabase/supabase-js";
import Navigation from "../components/Navigation";
import {
  FaInstagram,
  FaSoundcloud,
  FaSpotify,
  FaStar,
  FaArrowLeft,
} from "react-icons/fa";

interface FeaturedArtist {
  id: number;
  artist_id: string;
  name: string;
  stage_name: string;
  bio: string;
  profile_photo_url: string;
  soundcloud_track_url: string;
  instagram_url?: string;
  soundcloud_profile_url?: string;
  spotify_url?: string;
  featured_at: string;
}

interface FeaturedArtistsPageProps {
  artists: FeaturedArtist[];
  currentFeaturedId: string | null;
}

export default function FeaturedArtistsPage({ artists, currentFeaturedId }: FeaturedArtistsPageProps) {
  useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
    document.documentElement.lang = "he";
  }, []);

  return (
    <>
      <Head>
        <title>האמנים הצעירים שלנו | יוצאים לטראק</title>
        <meta
          name="description"
          content="הכירו את האמנים הצעירים והמוכשרים שהוצגו בפודקאסט יוצאים לטראק. הדור הבא של הטראנס הישראלי."
        />
        <meta property="og:title" content="האמנים הצעירים שלנו | יוצאים לטראק" />
        <meta
          property="og:description"
          content="הכירו את האמנים הצעירים והמוכשרים שהוצגו בפודקאסט יוצאים לטראק."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.tracktrip.co.il/featured-artists" />
        <link rel="canonical" href="https://www.tracktrip.co.il/featured-artists" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-[#050814] via-[#0a0a1f] to-black text-white">
        {/* Navigation */}
        <div className="sticky top-0 z-50 bg-black/90 backdrop-blur-lg border-b border-white/10">
          <Navigation currentPage="featured-artist" />
        </div>

        {/* Hero Section */}
        <section className="relative py-16 px-6 overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-cyan-500/15 rounded-full blur-[100px]" />
            <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-[100px]" />
          </div>

          <div className="relative max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full text-sm text-purple-300 mb-6">
              <FaStar className="text-yellow-400" />
              <span>{artists.length} אמנים מוכשרים</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black mb-4">
              <span className="bg-gradient-to-l from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                האמנים הצעירים שלנו
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              הכירו את האמנים המוכשרים שהוצגו ביוצאים לטראק.
              <br />
              הדור הבא של הטראנס הישראלי.
            </p>

            {/* CTA to signup */}
            <Link
              href="/young-artists"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg hover:shadow-purple-500/50 hover:scale-105"
            >
              <span>רוצה להופיע כאן?</span>
              <FaArrowLeft className="text-sm" />
            </Link>
          </div>
        </section>

        {/* Artists Grid */}
        <section className="px-6 pb-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {artists.map((artist) => (
                <ArtistCard 
                  key={artist.id} 
                  artist={artist} 
                  isCurrentFeatured={artist.artist_id === currentFeaturedId}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="px-6 pb-20">
          <div className="max-w-4xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 rounded-3xl blur-lg opacity-25 group-hover:opacity-50 transition duration-500" />
              <div className="relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-gray-800 text-center">
                <div className="text-5xl mb-4">🎤</div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  רוצה להיות האמן הבא?
                </h2>
                <p className="text-gray-300 mb-6 max-w-xl mx-auto">
                  אם את/ה אמן/ית צעיר/ה בסצנת הטראנס הישראלית ורוצה במה להציג את המוזיקה שלך, 
                  הגיע הזמן להירשם!
                </p>
                <Link
                  href="/young-artists"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold py-4 px-10 rounded-xl transition-all shadow-lg hover:shadow-purple-500/50 hover:scale-105"
                >
                  הרשמה להופעה בתוכנית
                  <FaArrowLeft className="text-sm" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-black/80">
          <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-gray-400 text-sm">
            <div>© 2026 יוצאים לטראק • כל הזכויות שמורות</div>
            <div className="flex gap-6">
              <Link href="/" className="hover:text-white transition">
                בית
              </Link>
              <Link href="/episodes" className="hover:text-white transition">
                פרקים
              </Link>
              <Link href="/artists" className="hover:text-white transition">
                אמנים
              </Link>
              <Link href="/young-artists" className="hover:text-white transition">
                הרשמה
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
function ArtistCard({ artist, isCurrentFeatured }: { artist: FeaturedArtist; isCurrentFeatured: boolean }) {
  const socialLinks = [
    { icon: FaSpotify, url: artist.spotify_url, color: "#1DB954" },
    { icon: FaInstagram, url: artist.instagram_url, color: "#E4405F" },
    { icon: FaSoundcloud, url: artist.soundcloud_profile_url, color: "#FF5500" },
  ].filter((link) => link.url);

  // Truncate bio for preview
  const bioPreview = artist.bio
    ? artist.bio.length > 80
      ? artist.bio.substring(0, 80) + "..."
      : artist.bio
    : null;

  // Format date
  const featuredDate = new Date(artist.featured_at).toLocaleDateString('he-IL', {
    year: 'numeric',
    month: 'short'
  });

  return (
    <Link href={`/artist/${artist.artist_id}`} className="block">
      <div className="artist-card group aspect-[3/4] relative">
        {/* Current Featured Badge */}
        {isCurrentFeatured && (
          <div className="absolute top-3 right-3 z-20 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
            <FaStar className="text-yellow-300" />
            נוכחי
          </div>
        )}

        {/* Image */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <img
            src={artist.profile_photo_url}
            alt={artist.stage_name}
            className="card-image w-full h-full object-cover"
          />
        </div>

        {/* Overlay */}
        <div className="overlay absolute inset-0 rounded-2xl" />

        {/* Content */}
        <div className="absolute inset-0 p-4 flex flex-col justify-end">
          {/* Date badge */}
          <div className="absolute top-3 left-3">
            <span className="px-2 py-1 text-[10px] font-semibold rounded-full bg-black/50 backdrop-blur-sm border border-white/20 text-purple-300">
              {featuredDate}
            </span>
          </div>

          {/* Main info (always visible) */}
          <div className="mb-2">
            <h3 className="text-xl md:text-2xl font-bold text-white leading-tight">
              {artist.stage_name}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              {artist.name}
            </p>
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
            <div className="flex items-center gap-2 text-sm font-medium text-purple-400 transition-colors">
              <span>לעמוד האמן</span>
              <FaArrowLeft className="text-xs" />
            </div>
          </div>
        </div>

        {/* Accent border on hover / current featured */}
        <div
          className={`absolute inset-0 rounded-2xl transition-opacity duration-300 pointer-events-none ${
            isCurrentFeatured ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
          style={{
            boxShadow: isCurrentFeatured 
              ? 'inset 0 0 0 2px rgba(168, 85, 247, 0.7), 0 0 20px rgba(168, 85, 247, 0.3)'
              : 'inset 0 0 0 2px rgba(168, 85, 247, 0.5)',
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
    // Get all featured artists
    const { data: artists, error } = await supabase
      .from("featured_artists")
      .select("*")
      .order("featured_at", { ascending: false });

    if (error) {
      console.error("Error fetching featured artists:", error);
      return { props: { artists: [], currentFeaturedId: null } };
    }

    // The first one is the current featured
    const currentFeaturedId = artists && artists.length > 0 ? artists[0].artist_id : null;

    return {
      props: {
        artists: artists || [],
        currentFeaturedId,
      },
    };
  } catch (err) {
    console.error("getServerSideProps error:", err);
    return { props: { artists: [], currentFeaturedId: null } };
  }
};

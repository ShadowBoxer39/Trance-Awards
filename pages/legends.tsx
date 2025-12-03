// pages/legends.tsx
import React from "react";
import Head from "next/head";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { createClient } from "@supabase/supabase-js";
import Navigation from "../components/Navigation";
import { FaArrowLeft, FaMusic } from "react-icons/fa";

interface Legend {
  id: number;
  stage_name: string;
  country: string;
  country_code: string;
  short_bio: string | null;
  photo_url: string | null;
  episode_id: number | null;

  // enriched from episodes table:
  episode_slug?: string | null;
  youtube_video_id?: string | null;
}

interface LegendsPageProps {
  legends: Legend[];
}

/**
 * Convert a country code (IL, GB, FR...) to a flag emoji.
 * Falls back to a white flag if something is off.
 */
const getFlagEmoji = (countryCode: string | null | undefined) => {
  if (!countryCode) return "🏳️";
  const code = countryCode.trim().toUpperCase();
  if (code.length !== 2) return "🏳️";

  try {
    return code
      .split("")
      .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
      .join("");
  } catch {
    return "🏳️";
  }
};

function LegendsPage({ legends }: LegendsPageProps) {
  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-b from-[#050814] via-[#0a0a1f] to-black text-white"
    >
      <Head>
        <title>האגדות | יוצאים לטראק</title>
        <meta
          name="description"
          content="חלוצי הטראנס שהקדשנו להם פרקים מיוחדים."
        />
        <meta property="og:title" content="האגדות | יוצאים לטראק" />
        <meta
          property="og:description"
          content="חלוצי הטראנס שהקדשנו להם פרקים מיוחדים."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.tracktrip.co.il/legends" />
        <link rel="canonical" href="https://www.tracktrip.co.il/legends" />
      </Head>

      {/* Navigation */}
      <div className="sticky top-0 z-50 bg-black/90 backdrop-blur-lg border-b border-white/10">
        <Navigation currentPage="legends" />
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
            <span>{legends.length} אגדות</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black mb-4">
            <span className="bg-gradient-to-l from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              האגדות
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            חלוצי הטראנס והפסייטראנס שהקדשנו להם פרקים מיוחדים.
            <br />
            לחצו על כרטיס כדי לצפות בפרק המלא.
          </p>
        </div>
      </section>

      {/* Legends Grid */}
      <section className="px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {legends.map((legend) => (
              <LegendCard key={legend.id} legend={legend} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/80">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-gray-400 text-sm">
          <div>© {new Date().getFullYear()} יוצאים לטראק · כל הזכויות שמורות</div>
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
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .legend-card {
          position: relative;
          border-radius: 1rem;
          overflow: hidden;
          background: rgba(15, 15, 35, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .legend-card:hover {
          transform: translateY(-8px) scale(1.02);
          border-color: rgba(168, 85, 247, 0.5);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4),
            0 0 60px rgba(168, 85, 247, 0.15);
        }

        .legend-card .card-image {
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .legend-card:hover .card-image {
          transform: scale(1.1);
        }

        .legend-card .hover-content {
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .legend-card:hover .hover-content {
          opacity: 1;
          transform: translateY(0);
        }

        .legend-card .overlay {
          background: linear-gradient(
            to top,
            rgba(0, 0, 0, 0.95) 0%,
            rgba(0, 0, 0, 0.7) 50%,
            transparent 100%
          );
          transition: all 0.4s ease;
        }

        .legend-card:hover .overlay {
          background: linear-gradient(
            to top,
            rgba(0, 0, 0, 0.98) 0%,
            rgba(0, 0, 0, 0.85) 60%,
            rgba(0, 0, 0, 0.4) 100%
          );
        }
      `}</style>
    </div>
  );
}

// Legend Card Component - matching the ArtistCard style
function LegendCard({ legend }: { legend: Legend }) {
  const accentColor = "#a855f7";

  // Build URL to a small PNG flag icon using the country_code (IL, GB, FR...)
  const flagUrl = legend.country_code
    ? `https://flagcdn.com/24x18/${legend.country_code.toLowerCase()}.png`
    : null;

  // Target URL:
  // 1) If youtube_video_id exists → open YouTube
  // 2) Else if episode_slug exists → internal /episodes/[slug]
  // 3) Else fallback to /episodes/[id] (if id exists)
  let href = "#";
  if (legend.youtube_video_id) {
    href = `https://www.youtube.com/watch?v=${legend.youtube_video_id}`;
  } else if (legend.episode_slug) {
    href = `/episodes/${legend.episode_slug}`;
  } else if (legend.episode_id) {
    href = `/episodes/${legend.episode_id}`;
  }

  // Truncate bio for preview (same as artists page)
  const bioPreview = legend.short_bio
    ? legend.short_bio.length > 100
      ? legend.short_bio.substring(0, 100) + "..."
      : legend.short_bio
    : null;

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="block">
      <div className="legend-card group aspect-[3/4] relative">
        {/* Image */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          {legend.photo_url ? (
            <img
              src={legend.photo_url}
              alt={legend.stage_name}
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
                {legend.stage_name[0]}
              </span>
            </div>
          )}
        </div>

        {/* Overlay */}
        <div className="overlay absolute inset-0 rounded-2xl" />

        {/* Content */}
        <div className="absolute inset-0 p-4 flex flex-col justify-end">
          {/* Country + flag badge */}
          <div className="absolute top-3 right-3">
            <span className="flex items-center gap-2 px-2 py-1 text-[10px] font-semibold rounded-full bg-black/50 backdrop-blur-sm border border-white/20 text-white/85">
              {flagUrl && (
                <img
                  src={flagUrl}
                  alt={legend.country}
                  className="w-4 h-3 rounded-[2px] object-cover"
                />
              )}
              {legend.country}
            </span>
          </div>

          {/* Main info (always visible) */}
          <div className="mb-2">
            <h3 className="text-xl md:text-2xl font-bold text-white leading-tight">
              {legend.stage_name}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              לצפייה בפרק המלא
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

            {/* View episode button */}
            <div
              className="flex items-center gap-2 text-sm font-medium transition-colors"
              style={{ color: accentColor }}
            >
              <span>לצפייה בפרק</span>
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
    </a>
  );
}

// --- getServerSideProps: legends + episodes join ---

export const getServerSideProps: GetServerSideProps<LegendsPageProps> = async () => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  );

  try {
    // 1) Get all legends
    const { data: legendsRaw, error: legendsError } = await supabase
      .from("legends")
      .select(
        "id, stage_name, country, country_code, short_bio, photo_url, episode_id"
      )
      .order("stage_name", { ascending: true });

    if (legendsError || !legendsRaw) {
      console.error("Error fetching legends:", legendsError);
      return { props: { legends: [] } };
    }

    // 2) Collect episode IDs
    const episodeIds = legendsRaw
      .map((l) => l.episode_id)
      .filter((id): id is number => typeof id === "number");

    let episodesById = new Map<
      number,
      { slug: string | null; youtube_video_id: string | null }
    >();

    if (episodeIds.length > 0) {
      const { data: episodes, error: episodesError } = await supabase
        .from("episodes")
        .select("id, slug, youtube_video_id")
        .in("id", episodeIds);

      if (episodesError) {
        console.error("Error fetching episodes for legends:", episodesError);
      } else if (episodes) {
        episodesById = new Map(
          episodes.map((ep: any) => [
            ep.id,
            {
              slug: ep.slug ?? null,
              youtube_video_id: ep.youtube_video_id ?? null,
            },
          ])
        );
      }
    }

    // 3) Enrich legends with episode info
    const legends: Legend[] = legendsRaw.map((legend: any) => {
      const epInfo = legend.episode_id
        ? episodesById.get(legend.episode_id)
        : undefined;

      return {
        ...legend,
        episode_slug: epInfo?.slug ?? null,
        youtube_video_id: epInfo?.youtube_video_id ?? null,
      };
    });

    return { props: { legends } };
  } catch (err) {
    console.error("getServerSideProps legends error:", err);
    return { props: { legends: [] } };
  }
};

export default LegendsPage;

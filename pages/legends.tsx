// pages/legends.tsx
import React from "react";
import Head from "next/head";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { createClient } from "@supabase/supabase-js";
import Navigation from "../components/Navigation";
import { FaArrowLeft } from "react-icons/fa";

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
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center justify-end gap-3 text-sm text-purple-200/80 mb-6">
            <Link
              href="/artists"
              className="inline-flex items-center gap-2 text-xs md:text-sm text-purple-300 hover:text-purple-100 transition-colors"
            >
              <span>חזרה לאמנים</span>
              <FaArrowLeft className="text-xs" />
            </Link>
            <span className="h-4 w-px bg-purple-500/40" />
            <span className="uppercase tracking-[0.25em] text-[10px] md:text-xs text-purple-300/80">
              LEGENDS
            </span>
          </div>

          <div className="space-y-4 text-right">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-purple-400 via-pink-400 to-orange-300">
                האגדות
              </span>{" "}
              שלנו
            </h1>
            <p className="max-w-2xl text-sm md:text-base text-gray-300 leading-relaxed ml-auto">
              חלוצי הטראנס והפסייטראנס שהקדשנו להם פרקים מיוחדים. לחצו על כרטיס
              כדי לעבור לפרק שלהם, וריחפו מעל הכרטיס כדי לקרוא תיאור קצר.
            </p>
            <p className="text-xs md:text-sm text-gray-400">
              מציג {legends.length} אגדות.
            </p>
          </div>
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
          <div className="text-xs text-gray-500">
            דף האגדות · מופעל על ידי Supabase
          </div>
        </div>
      </footer>
    </div>
  );
}

// --- Legend Card (RTL, <img>, flags, hover bio) ---

function LegendCard({ legend }: { legend: Legend }) {
  const accentColor = "#a855f7";
  const flag = getFlagEmoji(legend.country_code);

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

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="block">
      <div className="artist-card group aspect-[3/4] relative">
        {/* Image (same idea as artists.tsx) */}
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

        {/* Base gradient overlay */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

        {/* Country + flag pill */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-2 px-3 py-1 rounded-full bg-black/70 backdrop-blur text-xs">
          <span className="text-lg leading-none">{flag}</span>
          <span className="text-white/85">{legend.country}</span>
        </div>

        {/* Hover bio overlay */}
        <div className="absolute inset-0 rounded-2xl bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4 pointer-events-none">
          <p className="text-xs md:text-sm text-gray-100 leading-snug line-clamp-6 text-right">
            {legend.short_bio}
          </p>
        </div>

        {/* Bottom info – fades out on hover so it doesn't clash with bio */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-4 flex items-center justify-between gap-3 transition-opacity duration-300 group-hover:opacity-0">
          <div className="min-w-0 text-right">
            <h3 className="text-sm md:text-base font-semibold truncate">
              {legend.stage_name}
            </h3>
            <p className="text-[11px] md:text-xs text-gray-300 truncate">
              לצפייה בפרק המלא
            </p>
          </div>
          <span className="text-[11px] md:text-xs text-purple-300">
            לצפייה →
          </span>
        </div>

        <style jsx>{`
          .artist-card {
            border-radius: 1rem;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.12);
            background: radial-gradient(
              circle at top,
              rgba(148, 163, 253, 0.18),
              rgba(15, 23, 42, 1)
            );
            transition: transform 0.25s ease, box-shadow 0.25s ease,
              border-color 0.25s ease;
          }

          .artist-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.7);
            border-color: rgba(236, 72, 153, 0.6);
          }

          .card-image {
            transform: scale(1.02);
            transition: transform 0.5s ease;
          }

          .artist-card:hover .card-image {
            transform: scale(1.08);
          }
        `}</style>
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

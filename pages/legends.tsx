// pages/legends.tsx
import React from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { createClient } from "@supabase/supabase-js";
import Navigation from "../components/Navigation";

interface Legend {
  id: number;
  stage_name: string;
  country: string;
  country_code: string;
  short_bio: string | null;
  photo_url: string | null;
  episode_id: string; // will be used to build the YT URL
}

interface LegendsPageProps {
  legends: Legend[];
}

/**
 * Turn "IL" / "GB" / "FR" into 🇮🇱 / 🇬🇧 / 🇫🇷
 */
const getFlagEmoji = (countryCode: string) => {
  if (!countryCode) return "🏳️";
  const code = countryCode.toUpperCase();

  // Convert each letter (A-Z) to its regional indicator
  return code
    .split("")
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join("");
};

const LegendsPage: React.FC<LegendsPageProps> = ({ legends }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black text-white">
      <Head>
        <title>Legends | יוצאים לטראק</title>
        <meta
          name="description"
          content="The trance & psytrance legends we dedicated episodes to."
        />
      </Head>

      <Navigation />

      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="px-6 mb-10">
          <div className="max-w-6xl mx-auto flex flex-col gap-6">
            <div className="flex items-center gap-3 text-sm text-purple-200/80">
              <Link
                href="/artists"
                className="inline-flex items-center gap-2 text-xs md:text-sm text-purple-300 hover:text-purple-100 transition-colors"
              >
                ← Back to artists
              </Link>
              <span className="h-4 w-px bg-purple-500/40" />
              <span className="uppercase tracking-[0.25em] text-[10px] md:text-xs text-purple-300/80">
                Legends
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight">
                The <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-orange-300">Legends</span>
              </h1>
              <p className="max-w-2xl text-sm md:text-base text-gray-300 leading-relaxed">
                The pioneering artists we&apos;ve dedicated full episodes to.
                Click a legend to jump straight to their YouTube episode. Hover
                a card to read a short bio.
              </p>
              <p className="text-xs md:text-sm text-gray-400">
                Showing {legends.length} legends.
              </p>
            </div>
          </div>
        </section>

        {/* Legends grid */}
        <section className="px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {legends.map((legend) => (
                <LegendCard key={legend.id} legend={legend} />
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Simple footer */}
      <footer className="border-t border-white/10 bg-black/80">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs md:text-sm text-gray-400">
          <span>© {new Date().getFullYear()} יוצאים לטראק · All rights reserved</span>
          <span className="text-gray-500">
            Legends page · Powered by Supabase
          </span>
        </div>
      </footer>
    </div>
  );
};

const LegendCard: React.FC<{ legend: Legend }> = ({ legend }) => {
  // If your DB stores the full YT URL instead of just the video id,
  // change this line to: const youtubeUrl = legend.episode_id;
  const youtubeUrl = `https://www.youtube.com/watch?v=${legend.episode_id}`;
  const flag = getFlagEmoji(legend.country_code);

  return (
    <a
      href={youtubeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-2xl"
    >
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-white/10 via-white/[0.03] to-black border border-white/10 shadow-xl shadow-black/40">
        {/* Image + overlays */}
        <div className="relative aspect-[4/5]">
          <Image
            src={legend.photo_url || "/legend-placeholder.jpg"}
            alt={legend.stage_name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Top gradient */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          {/* Country + flag pill */}
          <div className="absolute left-3 top-3 flex items-center gap-2 px-3 py-1 rounded-full bg-black/70 backdrop-blur text-xs">
            <span className="text-lg leading-none">{flag}</span>
            <span className="text-white/85">{legend.country}</span>
          </div>

          {/* Hover bio overlay */}
          <div className="absolute inset-0 flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/70">
            <p className="text-xs md:text-sm text-gray-100 leading-snug line-clamp-5">
              {legend.short_bio}
            </p>
          </div>
        </div>

        {/* Bottom info row */}
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm md:text-base font-semibold truncate">
              {legend.stage_name}
            </h3>
            <p className="text-[11px] md:text-xs text-gray-400 truncate">
              Watch their episode on YouTube
            </p>
          </div>
          <span className="text-[11px] md:text-xs text-purple-300 group-hover:translate-x-0.5 transition-transform">
            Watch →
          </span>
        </div>
      </div>
    </a>
  );
};

export const getServerSideProps: GetServerSideProps<LegendsPageProps> = async () => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  );

  try {
    const { data, error } = await supabase
      .from("legends")
      .select(
        "id, stage_name, country, country_code, short_bio, photo_url, episode_id"
      )
      .order("stage_name", { ascending: true });

    if (error) {
      console.error("Error fetching legends:", error);
      return { props: { legends: [] } };
    }

    return {
      props: {
        legends: data ?? [],
      },
    };
  } catch (err) {
    console.error("getServerSideProps legends error:", err);
    return { props: { legends: [] } };
  }
};

export default LegendsPage;

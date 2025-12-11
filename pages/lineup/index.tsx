// pages/lineup/index.tsx
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import React from "react";
// import Navigation from "../../components/Navigation";

// Showcase lineups - placeholder artists (replace IDs with real ones later)
const SHOWCASE_LINEUPS = [
  {
    name: "טל אסיף",
    role: "יוצאים לטראק",
    type: "night" as const,
    artists: ["Astrix", "Infected Mushroom", "Hallucinogen", "Libra", "Mystic", "Artmis"],
  },
  {
    name: "אסף אבשלום",
    role: "פודקאסטר",
    type: "day" as const,
    artists: ["Cosma", "Total Eclipse", "Transwave", "Astral Projection", "Man With No Name", "Miranda"],
  },
  {
    name: "תמיר נחום",
    role: "פודקאסטר",
    type: "night" as const,
    artists: ["X-Dream", "Hallucinogen", "Xenomorph", "Etnica", "Doof", "Cosmosis"],
  },
];

const TIME_SLOTS = {
  day: ["12:00", "14:00", "16:00", "18:00", "20:00", "22:00"],
  night: ["22:00", "00:00", "02:00", "04:00", "06:00", "08:00"],
};

function ShowcaseCard({ lineup }: { lineup: typeof SHOWCASE_LINEUPS[0] }) {
  const isNight = lineup.type === "night";
  const times = TIME_SLOTS[lineup.type];

  return (
    <div
      className={`relative rounded-2xl overflow-hidden border-2 ${
        isNight ? "border-purple-500/30" : "border-amber-500/30"
      }`}
    >
      {/* Background */}
      <div
        className={`absolute inset-0 ${
          isNight
            ? "bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950"
            : "bg-gradient-to-br from-amber-900/80 via-orange-900/60 to-green-900/40"
        }`}
      />

      {/* Stars for night */}
      {isNight && (
        <div className="absolute inset-0 opacity-50">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">{lineup.name}</h3>
            <p className="text-sm text-white/60">{lineup.role}</p>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              isNight
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
            }`}
          >
            {isNight ? "🌙 לילה" : "☀️ יום"}
          </div>
        </div>

        {/* Lineup */}
        <div className="space-y-2">
          {lineup.artists.map((artist, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-black/20 rounded-lg px-3 py-2"
            >
              <span
                className={`text-xs font-mono ${
                  isNight ? "text-purple-400" : "text-amber-400"
                }`}
              >
                {times[i]}
              </span>
              <span className="text-sm text-white font-medium">{artist}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LineupLanding() {
  React.useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
  }, []);

  return (
    <>
      <Head>
        <title>הלייאנפ של החלומות | יוצאים לטראק</title>
        <meta
          name="description"
          content="בנו את הלייאנפ החלומי שלכם עם האמנים האהובים עליכם"
        />
        <meta property="og:title" content="הלייאנפ של החלומות | יוצאים לטראק" />
        <meta
          property="og:description"
          content="בנו את הלייאנפ החלומי שלכם ושתפו עם חברים"
        />
        <meta property="og:image" content="/images/logo.png" />
      </Head>

      <div className="min-h-screen bg-[#0a0a1f] text-white">
        {/* Simple Header */}
        <header className="fixed top-0 inset-x-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur-lg">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <img src="/images/logo.png" alt="יוצאים לטראק" className="w-9 h-9 rounded-full" />
              <span className="text-sm font-medium hidden sm:inline">יוצאים לטראק</span>
            </Link>
            <Link
              href="/lineup/create"
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-sm font-medium"
            >
              צרו לייאנפ
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative pt-24 pb-16 overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0">
            <div className="absolute top-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 max-w-6xl mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-amber-500/20 border border-purple-500/30 mb-6">
                <span className="text-2xl">🎧</span>
                <span className="text-sm font-medium text-purple-300">
                  כלי חדש!
                </span>
              </div>

              {/* Title */}
              <h1 className="text-5xl sm:text-7xl font-bold mb-6">
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
                  הלייאנפ של החלומות
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-xl text-white/70 mb-8 leading-relaxed">
                בנו את המסיבה המושלמת שלכם.
                <br />
                בחרו 6 אמנים, סדרו אותם על הטיימליין, ושתפו עם העולם.
              </p>

              {/* CTA */}
              <Link
                href="/lineup/create"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl font-bold text-lg shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105 transition-all"
              >
                <span>צרו את הלייאנפ שלכם</span>
                <span className="text-2xl">🚀</span>
              </Link>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-16">
              <div className="text-center p-4">
                <div className="text-3xl mb-2">🌅</div>
                <div className="text-sm text-white/60">מסיבת יום או לילה</div>
              </div>
              <div className="text-center p-4">
                <div className="text-3xl mb-2">🎨</div>
                <div className="text-sm text-white/60">עיצוב מדהים לשיתוף</div>
              </div>
              <div className="text-center p-4">
                <div className="text-3xl mb-2">🏕️</div>
                <div className="text-sm text-white/60">אווירת טבע אמיתית</div>
              </div>
            </div>
          </div>
        </section>

        {/* Showcase Lineups */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-3">
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  הלייאנפים שלנו
                </span>
              </h2>
              <p className="text-white/60">ראו מה בחרנו, ובנו את שלכם</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {SHOWCASE_LINEUPS.map((lineup, i) => (
                <ShowcaseCard key={i} lineup={lineup} />
              ))}
            </div>

            {/* Second CTA */}
            <div className="text-center mt-12">
              <Link
                href="/lineup/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 rounded-xl font-medium hover:bg-white/20 transition-all"
              >
                <span>עכשיו התור שלכם</span>
                <span>←</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 py-8">
          <div className="max-w-6xl mx-auto px-4 text-center text-sm text-white/40">
            © {new Date().getFullYear()} יוצאים לטראק
          </div>
        </footer>
      </div>
    </>
  );
}

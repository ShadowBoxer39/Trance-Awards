// pages/index.tsx - HOME PAGE
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import React from "react";

export default function Home() {
  React.useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
  }, []);

  return (
    <>
      <Head>
        <title>יוצאים לטראק - הפודקאסט הכי גדול בטראנס בישראל</title>
        <meta
          name="description"
          content="הפודקאסט הכי גדול בטראנס בישראל - יוצאים לטראק (Track Trip). הצטרפו לקהילה שלנו!"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Navigation Bar - Sticky */}
      <nav className="sticky top-0 z-50 glass border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
                <span className="text-2xl">🎧</span>
              </div>
              <span className="text-xl font-bold gradient-title hidden sm:inline">
                יוצאים לטראק
              </span>
            </Link>

            {/* Nav Links */}
            <div className="flex items-center gap-4">
              <Link
                href="/episodes"
                className="text-white/80 hover:text-white transition text-sm sm:text-base"
              >
                פרקים
              </Link>
              <Link
                href="/about"
                className="text-white/80 hover:text-white transition text-sm sm:text-base"
              >
                אודות
              </Link>
              <Link
                href="/vote"
                className="glass rounded-xl px-4 py-2 text-sm sm:text-base font-bold gradient-title hover:scale-105 transition-transform"
              >
                הצבעה 🗳️
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="min-h-screen relative">
        {/* Animated Background */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
          <div className="absolute top-20 left-20 w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
          {/* Hero Section */}
          <section className="text-center mb-16">
            {/* Logo */}
            <div className="mb-6">
              <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center shadow-2xl">
                <span className="text-6xl">🎧</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="gradient-title text-5xl sm:text-6xl lg:text-7xl font-bold mb-4 leading-tight">
              יוצאים לטראק
            </h1>
            <p className="text-white/80 text-xl sm:text-2xl mb-8">
              הפודקאסט הכי גדול בטראנס בישראל 🇮🇱
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <div className="glass rounded-2xl px-6 py-4">
                <div className="text-3xl font-bold gradient-title">94+</div>
                <div className="text-white/70 text-sm">פרקים</div>
              </div>
              <div className="glass rounded-2xl px-6 py-4">
                <div className="text-3xl font-bold gradient-title">שבועי</div>
                <div className="text-white/70 text-sm">פרקים חדשים</div>
              </div>
              <div className="glass rounded-2xl px-6 py-4">
                <div className="text-3xl font-bold gradient-title">2 שבועות</div>
                <div className="text-white/70 text-sm">אמנים צעירים</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/episodes"
                className="glass rounded-xl px-8 py-3 text-lg font-bold hover:scale-105 transition-transform"
              >
                כל הפרקים 🎵
              </Link>
              <Link
                href="/vote"
                className="bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl px-8 py-3 text-lg font-bold hover:scale-105 transition-transform shadow-xl"
              >
                הצביעו עכשיו! 🗳️
              </Link>
            </div>
          </section>

          {/* Featured Episode */}
          <section className="mb-16">
            <h2 className="gradient-title text-3xl sm:text-4xl font-bold text-center mb-8">
              🎬 הפרק האחרון
            </h2>
            <div className="glass rounded-3xl overflow-hidden max-w-4xl mx-auto">
              <div className="aspect-video">
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/LATEST_VIDEO_ID"
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2">שם הפרק האחרון</h3>
                <p className="text-white/70 mb-4">תיאור קצר של הפרק...</p>
                <div className="flex gap-3">
                  <a
                    href="https://www.youtube.com/@tracktripil"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass rounded-xl px-4 py-2 text-sm hover:scale-105 transition-transform"
                  >
                    ▶️ YouTube
                  </a>
                  <a
                    href="https://open.spotify.com/show/0LGP2n3IGqeFVv1fIZOkeZ"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass rounded-xl px-4 py-2 text-sm hover:scale-105 transition-transform"
                  >
                    🎧 Spotify
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Young Artists Section */}
          <section className="mb-16">
            <h2 className="gradient-title text-3xl sm:text-4xl font-bold text-center mb-4">
              🌟 אמני החודש
            </h2>
            <p className="text-white/70 text-center mb-8">
              מתעדכן כל שבועיים • האמנים הצעירים המבטיחים ביותר
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Artist Card 1 */}
              <div className="glass rounded-2xl overflow-hidden hover:scale-105 transition-transform">
                <div className="aspect-square bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                  <span className="text-6xl">🎵</span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1">שם האמן</h3>
                  <p className="text-white/70 text-sm mb-3">ז'אנר / סגנון</p>
                  <a
                    href="#"
                    className="text-cyan-400 text-sm hover:underline"
                  >
                    האזינו עכשיו →
                  </a>
                </div>
              </div>

              {/* Artist Card 2 */}
              <div className="glass rounded-2xl overflow-hidden hover:scale-105 transition-transform">
                <div className="aspect-square bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="text-6xl">🎵</span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1">שם האמן</h3>
                  <p className="text-white/70 text-sm mb-3">ז'אנר / סגנון</p>
                  <a
                    href="#"
                    className="text-cyan-400 text-sm hover:underline"
                  >
                    האזינו עכשיו →
                  </a>
                </div>
              </div>

              {/* Artist Card 3 */}
              <div className="glass rounded-2xl overflow-hidden hover:scale-105 transition-transform">
                <div className="aspect-square bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center">
                  <span className="text-6xl">🎵</span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1">שם האמן</h3>
                  <p className="text-white/70 text-sm mb-3">ז'אנר / סגנון</p>
                  <a
                    href="#"
                    className="text-cyan-400 text-sm hover:underline"
                  >
                    האזינו עכשיו →
                  </a>
                </div>
              </div>

              {/* Artist Card 4 */}
              <div className="glass rounded-2xl overflow-hidden hover:scale-105 transition-transform">
                <div className="aspect-square bg-gradient-to-br from-orange-500 to-cyan-500 flex items-center justify-center">
                  <span className="text-6xl">🎵</span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1">שם האמן</h3>
                  <p className="text-white/70 text-sm mb-3">ז'אנר / סגנון</p>
                  <a
                    href="#"
                    className="text-cyan-400 text-sm hover:underline"
                  >
                    האזינו עכשיו →
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* About Preview */}
          <section className="mb-16">
            <div className="glass rounded-3xl p-8 sm:p-12 max-w-4xl mx-auto text-center">
              <h2 className="gradient-title text-3xl sm:text-4xl font-bold mb-6">
                מי אנחנו?
              </h2>
              <p className="text-white/80 text-lg leading-relaxed mb-6">
                יוצאים לטראק הוא הפודקאסט הכי גדול בטראנס בישראל. אנחנו מביאים לכם את המוזיקה הטובה ביותר, 
                ראיונות עם האמנים המובילים, וכמובן - אמנים צעירים שמגיעים לשדר כל שבועיים.
              </p>
              <p className="text-white/80 text-lg leading-relaxed mb-8">
                עם יותר מ-94 פרקים ופרק חדש כל שבוע, אנחנו הבית של קהילת הטראנס בישראל.
              </p>
              <Link
                href="/about"
                className="glass rounded-xl px-6 py-3 inline-block hover:scale-105 transition-transform"
              >
                קראו עוד עלינו →
              </Link>
            </div>
          </section>

          {/* Social Links */}
          <section className="mb-8">
            <h2 className="gradient-title text-2xl font-bold text-center mb-6">
              הצטרפו לקהילה 🎉
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="https://www.instagram.com/track_trip.trance/"
                target="_blank"
                rel="noopener noreferrer"
                className="glass rounded-xl px-6 py-3 hover:scale-105 transition-transform"
              >
                📸 Instagram
              </a>
              <a
                href="https://www.youtube.com/@tracktripil"
                target="_blank"
                rel="noopener noreferrer"
                className="glass rounded-xl px-6 py-3 hover:scale-105 transition-transform"
              >
                ▶️ YouTube
              </a>
              <a
                href="https://open.spotify.com/show/0LGP2n3IGqeFVv1fIZOkeZ"
                target="_blank"
                rel="noopener noreferrer"
                className="glass rounded-xl px-6 py-3 hover:scale-105 transition-transform"
              >
                🎧 Spotify
              </a>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="relative z-10 border-t border-white/10 mt-16">
          <div className="max-w-6xl mx-auto px-4 py-8 text-center">
            <p className="text-white/60 text-sm">
              © 2025 יוצאים לטראק - Track Trip. כל הזכויות שמורות.
            </p>
            <p className="text-white/40 text-xs mt-2">
              פודקאסט הטראנס הכי גדול בישראל 🇮🇱
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}

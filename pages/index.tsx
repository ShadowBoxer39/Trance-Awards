// pages/index.tsx - PSYCHEDELIC TRANCE DESIGN
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import React from "react";

const BRAND = {
  logo: "/images/logo.png",
  title: "יוצאים לטראק",
};

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
  }, []);

  return (
    <>
      <Head>
        <title>יוצאים לטראק - הפודקאסט הכי גדול בטראנס בישראל</title>
        <meta
          name="description"
          content="הפודקאסט הכי גדול בטראנס בישראל - יוצאים לטראק. 94+ פרקים, אמנים צעירים, והמוזיקה הטובה ביותר."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#8a2be2" />
        <link rel="icon" type="image/png" href="/images/logo.png" />
      </Head>

      <main className="min-h-screen psychedelic-backdrop text-white">
        {/* Navigation Bar */}
        <header className="sticky top-0 z-50 border-b border-purple-500/20 bg-black/60 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="relative">
                <div className="absolute inset-0 blur-xl bg-gradient-to-r from-purple-500/30 to-cyan-500/30" />
                <Image
                  src={BRAND.logo}
                  alt="יוצאים לטראק"
                  width={48}
                  height={48}
                  className="relative rounded-full border border-purple-500/30"
                  priority
                />
              </div>
              <span className="text-xl font-bold tracking-tight">{BRAND.title}</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-3">
              <Link
                href="/episodes"
                className="glass rounded-lg px-5 py-2.5 text-base font-medium hover:bg-purple-500/10 transition-all"
              >
                פרקים
              </Link>
              <Link
                href="/young-artists"
                className="glass rounded-lg px-5 py-2.5 text-base font-medium hover:bg-purple-500/10 transition-all"
              >
                אמנים צעירים
              </Link>
              <Link
                href="/about"
                className="glass rounded-lg px-5 py-2.5 text-base font-medium hover:bg-purple-500/10 transition-all"
              >
                אודות
              </Link>
              <Link
                href="/vote"
                className="btn-primary rounded-lg px-5 py-2.5 text-base font-semibold border-0"
              >
                הצבעה
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden glass rounded-lg px-4 py-2.5 text-lg font-medium hover:bg-purple-500/10 transition"
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-purple-500/20 bg-black/80 backdrop-blur-xl">
              <nav className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-3">
                <Link
                  href="/episodes"
                  className="glass rounded-lg px-5 py-3 text-base font-medium hover:bg-purple-500/10 transition text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  פרקים
                </Link>
                <Link
                  href="/young-artists"
                  className="glass rounded-lg px-5 py-3 text-base font-medium hover:bg-purple-500/10 transition text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  אמנים צעירים
                </Link>
                <Link
                  href="/about"
                  className="glass rounded-lg px-5 py-3 text-base font-medium hover:bg-purple-500/10 transition text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  אודות
                </Link>
                <Link
                  href="/vote"
                  className="btn-primary rounded-lg px-5 py-3 text-base font-semibold border-0 text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  הצבעה
                </Link>
              </nav>
            </div>
          )}
        </header>

        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-4 pt-16 sm:pt-24 pb-12">
          <div className="max-w-3xl">
            {/* Logo */}
            <div className="mb-10 inline-block relative animate-float">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-cyan-500/20 to-magenta-500/20 blur-3xl animate-pulse-slow" />
              <Image
                src={BRAND.logo}
                alt="יוצאים לטראק"
                width={100}
                height={100}
                className="relative rounded-2xl border border-purple-500/30"
                priority
              />
            </div>

            {/* Title */}
            <h1 className="gradient-title text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-5">
              יוצאים לטראק
            </h1>
            <p className="text-gray-300 text-xl sm:text-2xl mb-10 font-light leading-relaxed">
              הפודקאסט הכי גדול בטראנס בישראל
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-4 mb-10">
              <div className="glass rounded-xl px-6 py-4">
                <div className="text-3xl font-bold gradient-title mb-1">94+</div>
                <div className="text-gray-400 text-sm font-light">פרקים</div>
              </div>
              <div className="glass rounded-xl px-6 py-4">
                <div className="text-3xl font-bold gradient-title mb-1">200+</div>
                <div className="text-gray-400 text-sm font-light">שעות מוזיקה</div>
              </div>
              <div className="glass rounded-xl px-6 py-4">
                <div className="text-3xl font-bold gradient-title mb-1">10K+</div>
                <div className="text-gray-400 text-sm font-light">מאזינים</div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <Link
                href="/episodes"
                className="btn-primary rounded-xl px-8 py-4 text-lg font-semibold inline-flex items-center justify-center gap-2 hover:scale-105 transition-transform"
              >
                <span>כל הפרקים</span>
              </Link>
              <a
                href="https://open.spotify.com/show/0LGP2n3IGqeFVv1fIZOkeZ"
                target="_blank"
                rel="noopener noreferrer"
                className="glass rounded-xl px-8 py-4 text-lg font-medium hover:bg-purple-500/10 transition inline-flex items-center justify-center gap-2"
              >
                <span>Spotify</span>
              </a>
            </div>
          </div>
        </section>

        {/* Featured Episode */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 gradient-title">
              הפרק האחרון
            </h2>
            <p className="text-gray-400 text-lg font-light">
              הפרק החדש ביותר שלנו
            </p>
          </div>

          <div className="glass rounded-2xl overflow-hidden max-w-4xl">
            {/* YouTube Embed */}
            <div className="aspect-video bg-black/60">
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

            {/* Episode Info */}
            <div className="p-6 sm:p-8">
              <h3 className="text-2xl font-bold mb-3">שם הפרק האחרון</h3>
              <p className="text-gray-400 mb-6 font-light leading-relaxed">
                תיאור קצר של הפרק - מה היה, מי היה, איזה טראקים ואיזה אמנים.
              </p>

              <div className="flex flex-wrap gap-3">
                <a
                  href="https://www.youtube.com/@tracktripil"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-purple-500/10 transition"
                >
                  צפו ביוטיוב
                </a>
                <a
                  href="https://open.spotify.com/show/0LGP2n3IGqeFVv1fIZOkeZ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-purple-500/10 transition"
                >
                  האזינו בספוטיפיי
                </a>
                <Link
                  href="/episodes"
                  className="glass rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-purple-500/10 transition"
                >
                  כל הפרקים
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Social Links */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2 gradient-title">
              הצטרפו לקהילה
            </h3>
            <p className="text-gray-400 font-light">
              עקבו אחרינו ברשתות החברתיות
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://www.instagram.com/track_trip.trance/"
              target="_blank"
              rel="noopener noreferrer"
              className="glass rounded-xl px-8 py-4 hover:bg-purple-500/10 transition-all group flex items-center gap-3 min-w-[160px]"
            >
              <span className="text-2xl">📸</span>
              <span className="font-medium group-hover:text-purple-400 transition">Instagram</span>
            </a>

            <a
              href="https://www.youtube.com/@tracktripil"
              target="_blank"
              rel="noopener noreferrer"
              className="glass rounded-xl px-8 py-4 hover:bg-purple-500/10 transition-all group flex items-center gap-3 min-w-[160px]"
            >
              <span className="text-2xl">▶️</span>
              <span className="font-medium group-hover:text-cyan-400 transition">YouTube</span>
            </a>

            <a
              href="https://open.spotify.com/show/0LGP2n3IGqeFVv1fIZOkeZ"
              target="_blank"
              rel="noopener noreferrer"
              className="glass rounded-xl px-8 py-4 hover:bg-purple-500/10 transition-all group flex items-center gap-3 min-w-[160px]"
            >
              <span className="text-2xl">🎧</span>
              <span className="font-medium group-hover:text-green-400 transition">Spotify</span>
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-purple-500/20 bg-black/40 mt-8">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Image
                  src={BRAND.logo}
                  alt="יוצאים לטראק"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
                <div className="text-sm text-gray-400">
                  <div className="font-medium">© 2025 יוצאים לטראק</div>
                  <div className="text-xs text-gray-500">כל הזכויות שמורות</div>
                </div>
              </div>
              <div className="flex gap-4 text-sm text-gray-400 font-light">
                <Link href="/episodes" className="hover:text-white transition">
                  פרקים
                </Link>
                <Link href="/young-artists" className="hover:text-white transition">
                  אמנים צעירים
                </Link>
                <Link href="/about" className="hover:text-white transition">
                  אודות
                </Link>
                <Link href="/vote" className="hover:text-white transition">
                  הצבעה
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}

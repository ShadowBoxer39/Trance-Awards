// pages/index.tsx - CLEAN HOME PAGE
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
        <meta name="theme-color" content="#FF5AA5" />
        <link rel="icon" type="image/png" href="/images/logo.png" />
      </Head>

      <main className="min-h-screen neon-backdrop text-white">
        {/* Navigation Bar (Sticky) - BIGGER & MORE PROMINENT */}
        <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
              <Image
                src={BRAND.logo}
                alt="יוצאים לטראק"
                width={48}
                height={48}
                className="rounded-full border-2 border-white/20"
                priority
              />
              <span className="text-lg font-[900]">{BRAND.title}</span>
            </Link>

            {/* Desktop Navigation Links - MUCH BIGGER */}
            <nav className="hidden lg:flex items-center gap-3">
              <Link
                href="/episodes"
                className="glass rounded-xl px-6 py-3 text-lg font-bold hover:bg-white/10 transition border border-white/10"
              >
                פרקים
              </Link>
              <Link
                href="/young-artists"
                className="glass rounded-xl px-6 py-3 text-lg font-bold hover:bg-white/10 transition border border-white/10"
              >
                אמנים צעירים
              </Link>
              <Link
                href="/about"
                className="glass rounded-xl px-6 py-3 text-lg font-bold hover:bg-white/10 transition border border-white/10"
              >
                אודות
              </Link>
              <Link
                href="/vote"
                className="btn-primary rounded-xl px-6 py-3 text-lg font-bold border-0"
              >
                הצבעה 🗳️
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden glass rounded-xl px-4 py-3 text-lg font-bold hover:bg-white/10 transition border border-white/10"
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-white/10 bg-black/60 backdrop-blur">
              <nav className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-3">
                <Link
                  href="/episodes"
                  className="glass rounded-xl px-6 py-3 text-lg font-bold hover:bg-white/10 transition border border-white/10 text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  פרקים
                </Link>
                <Link
                  href="/young-artists"
                  className="glass rounded-xl px-6 py-3 text-lg font-bold hover:bg-white/10 transition border border-white/10 text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  אמנים צעירים
                </Link>
                <Link
                  href="/about"
                  className="glass rounded-xl px-6 py-3 text-lg font-bold hover:bg-white/10 transition border border-white/10 text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  אודות
                </Link>
                <Link
                  href="/vote"
                  className="btn-primary rounded-xl px-6 py-3 text-lg font-bold border-0 text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  הצבעה 🗳️
                </Link>
              </nav>
            </div>
          )}
        </header>

        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-4 pt-12 sm:pt-20 pb-12">
          <div className="max-w-3xl">
            {/* Logo with glow effect */}
            <div className="mb-8 inline-block relative">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/30 to-purple-500/30 blur-3xl" />
              <Image
                src={BRAND.logo}
                alt="יוצאים לטראק"
                width={120}
                height={120}
                className="relative rounded-3xl border-2 border-white/20"
                priority
              />
            </div>

            {/* Title & Tagline */}
            <h1 className="gradient-title text-5xl sm:text-6xl lg:text-7xl font-[900] leading-[1.05] mb-4">
              יוצאים לטראק
            </h1>
            <p className="text-white/80 text-xl sm:text-2xl mb-8 leading-relaxed">
              הפודקאסט הכי גדול בטראנס בישראל
            </p>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-4 mb-10">
              <div className="glass rounded-2xl px-6 py-4 border border-white/10">
                <div className="text-3xl font-black gradient-title">94+</div>
                <div className="text-white/70 text-sm">פרקים</div>
              </div>
              <div className="glass rounded-2xl px-6 py-4 border border-white/10">
                <div className="text-3xl font-black gradient-title">200+</div>
                <div className="text-white/70 text-sm">שעות מוזיקה</div>
              </div>
              <div className="glass rounded-2xl px-6 py-4 border border-white/10">
                <div className="text-3xl font-black gradient-title">10K+</div>
                <div className="text-white/70 text-sm">מאזינים</div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <Link
                href="/episodes"
                className="btn-primary rounded-2xl px-8 py-4 text-lg font-bold inline-flex items-center justify-center gap-2 hover:scale-105 transition-transform"
              >
                <span>כל הפרקים</span>
                <span>🎵</span>
              </Link>
              <a
                href="https://open.spotify.com/show/0LGP2n3IGqeFVv1fIZOkeZ"
                target="_blank"
                rel="noopener noreferrer"
                className="glass rounded-2xl px-8 py-4 text-lg font-bold hover:bg-white/10 transition inline-flex items-center justify-center gap-2"
              >
                <span>Spotify</span>
                <span>🎧</span>
              </a>
            </div>
          </div>
        </section>

        {/* Featured Episode Section */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="mb-8">
            <h2 className="text-3xl sm:text-4xl font-[900] mb-3 gradient-title">
              🎬 הפרק האחרון
            </h2>
            <p className="text-white/70 text-lg">
              הפרק החדש ביותר שלנו - תהנו!
            </p>
          </div>

          <div className="glass rounded-3xl overflow-hidden max-w-4xl border border-white/10">
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
              <p className="text-white/70 mb-6 leading-relaxed">
                תיאור קצר של הפרק - מה היה, מי היה, איזה טראקים ואיזה אמנים. 
                זה המקום לתת טעימה מהתוכן.
              </p>

              <div className="flex flex-wrap gap-3">
                <a
                  href="https://www.youtube.com/@tracktripil"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-white/10 transition"
                >
                  ▶️ צפו ביוטיוב
                </a>
                <a
                  href="https://open.spotify.com/show/0LGP2n3IGqeFVv1fIZOkeZ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-white/10 transition"
                >
                  🎧 האזינו בספוטיפיי
                </a>
                <Link
                  href="/episodes"
                  className="glass rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-white/10 transition"
                >
                  📚 כל הפרקים
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Social Links */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-[900] mb-2 gradient-title">
              הצטרפו לקהילה
            </h3>
            <p className="text-white/70">
              עקבו אחרינו ברשתות החברתיות
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://www.instagram.com/track_trip.trance/"
              target="_blank"
              rel="noopener noreferrer"
              className="glass rounded-2xl px-8 py-4 hover:border-pink-500/50 transition-all group flex items-center gap-3 min-w-[160px]"
              style={{ borderColor: 'rgba(225, 48, 108, 0.3)' }}
            >
              <span className="text-2xl">📸</span>
              <span className="font-medium group-hover:text-pink-400 transition">Instagram</span>
            </a>

            <a
              href="https://www.youtube.com/@tracktripil"
              target="_blank"
              rel="noopener noreferrer"
              className="glass rounded-2xl px-8 py-4 hover:border-red-500/50 transition-all group flex items-center gap-3 min-w-[160px]"
              style={{ borderColor: 'rgba(255, 0, 0, 0.3)' }}
            >
              <span className="text-2xl">▶️</span>
              <span className="font-medium group-hover:text-red-400 transition">YouTube</span>
            </a>

            <a
              href="https://open.spotify.com/show/0LGP2n3IGqeFVv1fIZOkeZ"
              target="_blank"
              rel="noopener noreferrer"
              className="glass rounded-2xl px-8 py-4 hover:border-green-500/50 transition-all group flex items-center gap-3 min-w-[160px]"
              style={{ borderColor: 'rgba(29, 185, 84, 0.3)' }}
            >
              <span className="text-2xl">🎧</span>
              <span className="font-medium group-hover:text-green-400 transition">Spotify</span>
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-black/40 mt-8">
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
                <div className="text-sm text-white/60">
                  <div>© 2025 יוצאים לטראק</div>
                  <div className="text-xs text-white/40">כל הזכויות שמורות</div>
                </div>
              </div>
              <div className="flex gap-4 text-sm text-white/60">
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

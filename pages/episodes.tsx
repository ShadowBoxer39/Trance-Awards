// pages/episodes.tsx - EPISODES PAGE
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import React from "react";

export default function Episodes() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
  }, []);

  return (
    <>
      <Head>
        <title>פרקים - יוצאים לטראק</title>
        <meta name="description" content="כל הפרקים של יוצאים לטראק" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/images/logo.png" />
      </Head>

      <div className="trance-backdrop min-h-screen text-gray-100">
        {/* Navigation */}
        <nav className="border-b border-gray-800 bg-black/40 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition">
                <Image
                  src="/images/logo.png"
                  alt="Logo"
                  width={40}
                  height={40}
                  className="rounded-lg"
                />
                <span className="text-lg font-semibold">יוצאים לטראק</span>
              </Link>

              <div className="hidden md:flex items-center gap-6">
                <Link href="/" className="text-gray-300 hover:text-white transition text-sm font-medium">
                  בית
                </Link>
                <Link href="/episodes" className="text-white text-sm font-medium">
                  פרקים
                </Link>
                <Link href="/young-artists" className="text-gray-300 hover:text-white transition text-sm font-medium">
                  אמנים צעירים
                </Link>
                <Link href="/about" className="text-gray-300 hover:text-white transition text-sm font-medium">
                  אודות
                </Link>
                <Link href="/vote" className="btn-primary px-5 py-2 rounded-lg text-sm font-medium">
                  הצבעה
                </Link>
              </div>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-gray-300 hover:text-white"
              >
                {mobileMenuOpen ? "✕" : "☰"}
              </button>
            </div>

            {mobileMenuOpen && (
              <div className="md:hidden mt-4 pt-4 border-t border-gray-800 space-y-3">
                <Link href="/" className="block text-gray-300 hover:text-white transition text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                  בית
                </Link>
                <Link href="/episodes" className="block text-white text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                  פרקים
                </Link>
                <Link href="/young-artists" className="block text-gray-300 hover:text-white transition text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                  אמנים צעירים
                </Link>
                <Link href="/about" className="block text-gray-300 hover:text-white transition text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                  אודות
                </Link>
                <Link href="/vote" className="block btn-primary px-5 py-2 rounded-lg text-sm font-medium text-center" onClick={() => setMobileMenuOpen(false)}>
                  הצבעה
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Hero */}
        <section className="max-w-7xl mx-auto px-6 pt-20 pb-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-6xl mb-6">🎵</div>
            <h1 className="text-5xl md:text-6xl font-semibold mb-5">כל הפרקים</h1>
            <p className="text-xl md:text-2xl text-gray-400">
              94+ פרקים של מוזיקת טראנס מהארץ ומהעולם
            </p>
          </div>
        </section>

        {/* Latest Episode */}
        <section className="max-w-7xl mx-auto px-6 py-8">
          <h2 className="text-2xl font-semibold mb-6">הפרק האחרון</h2>
          
          <div className="glass-card rounded-xl overflow-hidden max-w-5xl">
            <div className="aspect-video bg-gray-900">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/rMb4a5A5wVw"
                title="YouTube"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">פרק 95 - יוצאים לטראק</h3>
              <p className="text-gray-400 text-sm mb-4">
                הפרק החדש ביותר של הפודקאסט
              </p>
              <div className="flex gap-3">
                <a
                  href="https://www.youtube.com/watch?v=rMb4a5A5wVw"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary px-4 py-2 rounded-lg text-sm font-medium"
                >
                  YouTube
                </a>
                <a
                  href="https://open.spotify.com/show/0LGP2n3IGqeFVv1fIZOkeZ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Spotify
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* All Episodes Grid */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-semibold mb-6">פרקים קודמים</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Episode Cards - Placeholder */}
            {[94, 93, 92, 91, 90, 89, 88, 87, 86].map((episodeNum) => (
              <div key={episodeNum} className="glass-card rounded-xl overflow-hidden hover:scale-105 transition-transform">
                <div className="aspect-video bg-gray-800 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-16 h-16 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">פרק {episodeNum}</h3>
                  <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                    תיאור הפרק - מוזיקה טובה, אמנים מעולים, ווייבים.
                  </p>
                  <a
                    href={`https://www.youtube.com/watch?v=VIDEO_ID_${episodeNum}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary px-4 py-2 rounded-lg text-xs font-medium inline-block"
                  >
                    צפה עכשיו
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <button className="btn-primary px-8 py-3 rounded-lg font-medium">
              טען עוד פרקים
            </button>
          </div>
        </section>

        {/* Platforms */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="glass-card rounded-xl p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">האזינו בפלטפורמות</h2>
            <p className="text-gray-400 mb-8">כל הפרקים זמינים גם בפלטפורמות האהובות עליכם</p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="https://open.spotify.com/show/0LGP2n3IGqeFVv1fIZOkeZ"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary px-6 py-3 rounded-lg font-medium flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
                Spotify
              </a>
              <a
                href="https://www.youtube.com/@tracktripil"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary px-6 py-3 rounded-lg font-medium flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                YouTube
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-800 mt-16">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
              <div>© 2025 יוצאים לטראק</div>
              <div className="flex gap-6">
                <Link href="/" className="hover:text-gray-300 transition">בית</Link>
                <Link href="/episodes" className="hover:text-gray-300 transition">פרקים</Link>
                <Link href="/young-artists" className="hover:text-gray-300 transition">אמנים צעירים</Link>
                <Link href="/about" className="hover:text-gray-300 transition">אודות</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

// pages/index.tsx - PROFESSIONAL MATURE DESIGN
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import React from "react";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
  }, []);

  return (
    <>
      <Head>
        <title>יוצאים לטראק</title>
        <meta name="description" content="פודקאסט טראנס ישראלי" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/images/logo.png" />
      </Head>

      <div className="trance-backdrop min-h-screen text-gray-100">
        {/* Navigation */}
        <nav className="border-b border-gray-800 bg-black/40 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Logo & Brand */}
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

              {/* Desktop Menu */}
              <div className="hidden md:flex items-center gap-6">
                <Link href="/episodes" className="text-gray-300 hover:text-white transition text-sm font-medium">
                  פרקים
                </Link>
                <Link href="/young-artists" className="text-gray-300 hover:text-white transition text-sm font-medium">
                  אמנים צעירים
                </Link>
                <Link href="/about" className="text-gray-300 hover:text-white transition text-sm font-medium">
                  אודות
                </Link>
                <Link 
                  href="/vote" 
                  className="btn-primary px-5 py-2 rounded-lg text-sm font-medium"
                >
                  הצבעה
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-gray-300 hover:text-white"
              >
                {mobileMenuOpen ? "✕" : "☰"}
              </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div className="md:hidden mt-4 pt-4 border-t border-gray-800 space-y-3">
                <Link 
                  href="/episodes" 
                  className="block text-gray-300 hover:text-white transition text-sm font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  פרקים
                </Link>
                <Link 
                  href="/young-artists" 
                  className="block text-gray-300 hover:text-white transition text-sm font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  אמנים צעירים
                </Link>
                <Link 
                  href="/about" 
                  className="block text-gray-300 hover:text-white transition text-sm font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  אודות
                </Link>
                <Link 
                  href="/vote" 
                  className="block btn-primary px-5 py-2 rounded-lg text-sm font-medium text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  הצבעה
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Hero */}
        <section className="max-w-5xl mx-auto px-6 pt-20 pb-16">
          <div className="max-w-2xl">
            {/* Logo */}
            <div className="mb-8">
              <Image
                src="/images/logo.png"
                alt="יוצאים לטראק"
                width={90}
                height={90}
                className="rounded-xl"
              />
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-6xl font-semibold mb-4 tracking-tight">
              יוצאים לטראק
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl text-gray-400 mb-10 font-normal">
              הפודקאסט הכי גדול בטראנס בישראל
            </p>

            {/* Stats */}
            <div className="flex gap-6 mb-10">
              <div>
                <div className="text-3xl font-semibold text-gradient mb-1">94+</div>
                <div className="text-sm text-gray-500">פרקים</div>
              </div>
              <div>
                <div className="text-3xl font-semibold text-gradient mb-1">200+</div>
                <div className="text-sm text-gray-500">שעות</div>
              </div>
              <div>
                <div className="text-3xl font-semibold text-gradient mb-1">10K+</div>
                <div className="text-sm text-gray-500">מאזינים</div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex gap-4">
              <Link 
                href="/episodes" 
                className="btn-primary px-6 py-3 rounded-lg font-medium"
              >
                כל הפרקים
              </Link>
              <a
                href="https://open.spotify.com/show/0LGP2n3IGqeFVv1fIZOkeZ"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary px-6 py-3 rounded-lg font-medium"
              >
                Spotify
              </a>
            </div>
          </div>
        </section>

        {/* Latest Episode */}
        <section className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-semibold mb-6">הפרק האחרון</h2>
          
          <div className="glass-card rounded-xl overflow-hidden">
            {/* Video */}
            <div className="aspect-video bg-gray-900">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/VIDEO_ID"
                title="YouTube"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Info */}
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">שם הפרק</h3>
              <p className="text-gray-400 mb-4 text-sm leading-relaxed">
                תיאור הפרק - מה היה בפרק, אילו אמנים, אילו טראקים.
              </p>
              <div className="flex gap-3">
                <a
                  href="https://www.youtube.com/@tracktripil"
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

        {/* Social */}
        <section className="max-w-5xl mx-auto px-6 py-16">
          <h3 className="text-2xl font-semibold mb-6 text-center">עקבו אחרינו</h3>
          
          <div className="flex justify-center gap-4">
            <a
              href="https://www.instagram.com/track_trip.trance/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary px-6 py-3 rounded-lg text-sm font-medium"
            >
              Instagram
            </a>
            <a
              href="https://www.youtube.com/@tracktripil"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary px-6 py-3 rounded-lg text-sm font-medium"
            >
              YouTube
            </a>
            <a
              href="https://open.spotify.com/show/0LGP2n3IGqeFVv1fIZOkeZ"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary px-6 py-3 rounded-lg text-sm font-medium"
            >
              Spotify
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-800 mt-16">
          <div className="max-w-5xl mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
              <div>© 2025 יוצאים לטראק</div>
              <div className="flex gap-6">
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

// pages/index.tsx
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import React from "react";

const BRAND = {
  logo: "/images/logo.png",
  title: "יוצאים לטראק",
};

export default function ComingSoon() {
  React.useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
  }, []);

  return (
    <>
      <Head>
        <title>יוצאים לטראק - האתר בבנייה</title>
        <meta name="description" content="האתר החדש של יוצאים לטראק בבנייה. בינתיים, בואו להצביע בנבחרי השנה!" />
        <meta name="theme-color" content="#FF5AA5" />
        <link rel="icon" type="image/png" href="/images/logo.png" />
      </Head>

      <main className="min-h-screen neon-backdrop text-white flex items-center justify-center p-4">
        {/* Animated background blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          {/* Logo */}
          <div className="mb-8 relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/30 to-purple-500/30 blur-3xl animate-pulse" />
            <Image
              src={BRAND.logo}
              alt="יוצאים לטראק"
              width={150}
              height={150}
              className="relative rounded-3xl border-2 border-white/20"
              priority
            />
          </div>

          {/* Title */}
          <h1 className="gradient-title text-5xl sm:text-7xl font-[900] mb-6 leading-tight">
            יוצאים לטראק
          </h1>

          {/* Subtitle */}
          <div className="glass rounded-2xl p-6 mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              🚧 האתר בבנייה 🚧
            </h2>
            <p className="text-white/80 text-lg">
              אנחנו עובדים על משהו מיוחד...
            </p>
          </div>

          {/* CTA to voting */}
          <div className="glass rounded-2xl p-8 mb-6">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h3 className="text-xl font-bold mb-3">בינתיים...</h3>
            <p className="text-white/70 mb-6">
              הצביעו בנבחרי השנה בטראנס 2025!
            </p>
            <Link
              href="/vote"
              className="btn-primary rounded-2xl px-8 py-4 text-lg font-bold inline-flex items-center justify-center gap-2 hover:scale-105 transition-transform"
            >
              <span>לחצו להצבעה</span>
              <span>🚀</span>
            </Link>
          </div>

          {/* Social Links */}
          <div className="flex flex-wrap gap-3 justify-center">
            
              href="https://www.instagram.com/track_trip.trance/"
              target="_blank"
              rel="noopener noreferrer"
              className="glass rounded-xl px-4 py-2 text-sm hover:bg-white/10 transition"
            >
              📱 Instagram
            </a>
            
              href="https://www.youtube.com/@tracktripil"
              target="_blank"
              rel="noopener noreferrer"
              className="glass rounded-xl px-4 py-2 text-sm hover:bg-white/10 transition"
            >
              📺 YouTube
            </a>
            
              href="https://open.spotify.com/show/0LGP2n3IGqeFVVlflZOkeZ"
              target="_blank"
              rel="noopener noreferrer"
              className="glass rounded-xl px-4 py-2 text-sm hover:bg-white/10 transition"
            >
              🎧 Spotify
            </a>
          </div>
        </div>
      </main>
    </>
  );
}

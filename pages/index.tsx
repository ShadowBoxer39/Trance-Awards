// pages/index.tsx - PROFESSIONAL MATURE DESIGN
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import React from "react";

interface Episode {
  id: number;
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  channelTitle: string;
}

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [episodes, setEpisodes] = React.useState<Episode[]>([]);
  const [episodesLoading, setEpisodesLoading] = React.useState(true);
  const [episodesError, setEpisodesError] = React.useState<string | null>(null);

  React.useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");

    const fetchEpisodes = async () => {
      try {
        const res = await fetch("/api/episodes");
        if (!res.ok) throw new Error("Failed to fetch episodes");
        const data: Episode[] = await res.json();
        setEpisodes(data);
        setEpisodesLoading(false);
      } catch (err: any) {
        console.error("Failed to fetch episodes:", err);
        setEpisodesError(err.message || "שגיאה בטעינת הפרקים");
        setEpisodesLoading(false);
      }
    };

    fetchEpisodes();
  }, []);

  const latestEpisode =
    episodes.length > 0 ? episodes[episodes.length - 1] : null;

  const previousEpisodes =
    episodes.length > 1
      ? episodes
          .slice(Math.max(episodes.length - 4, 0), episodes.length - 1)
          .reverse()
      : [];

  return (
    <>
      <Head>
        <title>יוצאים לטראק - פודקאסט טראנס</title>
        <meta
          name="description"
          content="יוצאים לטראק - הפודקאסט של קהילת הטראנס בישראל. פרקים, סטים, אמנים צעירים ועוד."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/images/logo.png" />
      </Head>

      <div className="trance-backdrop min-h-screen text-gray-100">
       {/* Navigation */}
<nav className="border-b border-gray-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6">
    <div className="flex items-center justify-between h-20">
      {/* Logo & Brand */}
      <Link
        href="/"
        className="flex items-center gap-3 hover:opacity-90 transition"
      >
        <Image
          src="/images/logo.png"
          alt="Logo"
          width={50}
          height={50}
          className="rounded-lg"
        />
        <span className="text-xl font-semibold hidden sm:block">יוצאים לטראק</span>
      </Link>

    {/* Desktop Menu */}
<div className="hidden md:flex items-center gap-8">
  <Link href="/" className="text-gray-300 hover:text-white text-base font-medium transition">
    בית
  </Link>
  <Link
    href="/episodes"
    className="text-gray-300 hover:text-white text-base font-medium transition"
  >
    פרקים
  </Link>
  <Link
    href="/young-artists"
    className="text-gray-300 hover:text-white text-base font-medium transition"
  >
    אמנים צעירים
  </Link>
  <Link
    href="/about"
    className="text-gray-300 hover:text-white text-base font-medium transition"
  >
    אודות
  </Link>
  <Link
    href="/advertisers"
    className="text-white text-base font-medium hover:text-purple-400 transition"
  >
    למפרסמים
  </Link>
  <Link
    href="/vote"
    className="btn-primary px-6 py-3 rounded-lg text-base font-medium"
  >
    הצבעה
  </Link>
</div>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden text-gray-300 hover:text-white p-2"
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {mobileMenuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>
    </div>

  {/* Mobile Menu */}
{mobileMenuOpen && (
  <div className="md:hidden pb-4 space-y-1">
    <Link
      href="/"
      className="block text-gray-300 hover:text-white text-base font-medium py-3 px-4 rounded-lg hover:bg-gray-800 transition"
      onClick={() => setMobileMenuOpen(false)}
    >
      בית
    </Link>
    <Link
      href="/episodes"
      className="block text-gray-300 hover:text-white text-base font-medium py-3 px-4 rounded-lg hover:bg-gray-800 transition"
      onClick={() => setMobileMenuOpen(false)}
    >
      פרקים
    </Link>
    <Link
      href="/young-artists"
      className="block text-gray-300 hover:text-white text-base font-medium py-3 px-4 rounded-lg hover:bg-gray-800 transition"
      onClick={() => setMobileMenuOpen(false)}
    >
      אמנים צעירים
    </Link>
    <Link
      href="/about"
      className="block text-gray-300 hover:text-white text-base font-medium py-3 px-4 rounded-lg hover:bg-gray-800 transition"
      onClick={() => setMobileMenuOpen(false)}
    >
      אודות
    </Link>
    <Link
      href="/advertisers"
      className="block text-white text-base font-medium py-3 px-4 rounded-lg hover:bg-gray-800 transition"
      onClick={() => setMobileMenuOpen(false)}
    >
      למפרסמים
    </Link>
    <Link
      href="/vote"
      className="block btn-primary px-4 py-3 rounded-lg text-base font-medium text-center mt-2"
      onClick={() => setMobileMenuOpen(false)}
    >
      הצבעה
    </Link>
  </div>
)}
  </div>
</nav>

        {/* HERO */}
        <header className="max-w-7xl mx-auto px-6 pt-16 pb-10">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            {/* Left side – title & CTA */}
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-purple-400 mb-3">
                פודקאסט הטראנס של ישראל
              </p>
              <h1 className="text-4xl md:text-6xl font-semibold mb-4 tracking-tight">
                יוצאים לטראק
              </h1>
              <p className="text-xl md:text-2xl text-gray-400 mb-8">
                מוזיקת טראנס, סיפורים מאחורי הקלעים והקהילה כולה – באולפן אחד.
              </p>

              <div className="flex flex-wrap gap-4 mb-10">
                <Link
                  href="/episodes"
                  className="btn-primary px-6 py-3 rounded-lg font-medium"
                >
                  האזינו לפרקים
                </Link>
                <Link
                  href="/young-artists"
                  className="btn-secondary px-6 py-3 rounded-lg font-medium flex items-center gap-2"
                >
                  <span className="text-xl">🌟</span>
                  אמנים צעירים
                </Link>
              </div>

              {/* Stats */}
              <div className="flex gap-8 md:gap-12">
                <div>
                  <div className="text-4xl md:text-5xl font-semibold text-gradient mb-1">
                    50+
                  </div>
                  <div className="text-sm text-gray-500">פרקים</div>
                </div>
                <div>
                  <div className="text-4xl md:text-5xl font-semibold text-gradient mb-1">
                    200+
                  </div>
                  <div className="text-sm text-gray-500">שעות</div>
                </div>
                <div>
                  <div className="text-4xl md:text-5xl font-semibold text-gradient mb-1">
                    אינסוף
                  </div>
                  <div className="text-sm text-gray-500">וייבים טובים</div>
                </div>
              </div>
            </div>

            {/* Right side – studio partner card (desktop only) */}
            <div className="hidden md:block mt-10 md:mt-0">
              <div className="glass-card rounded-2xl p-8 max-w-sm mx-auto flex flex-col items-center text-center">
                <div className="mb-4">
                  <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center mx-auto shadow-lg">
                    <Image
                      src="/images/musikroom.png"
                      alt="Music Room Studio"
                      width={130}
                      height={130}
                      className="object-contain"
                    />
                  </div>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                  התכנית מוקלטת באולפני המיוזיק רום – אולפן פודקאסטים ייחודי
                  ומרחב יצירתי ל־DJs להפקות וידאו מקצועיות.
                </p>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-purple-300 hover:text-purple-200 underline-offset-2 hover:underline transition"
                >
                  לאתר המיוזיק רום
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Latest Episode */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-semibold mb-6">הפרק האחרון</h2>

          {episodesLoading ? (
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="aspect-video bg-gray-900 animate-pulse" />
              <div className="p-6">
                <div className="h-6 bg-gray-800 rounded mb-3" />
                <div className="h-4 bg-gray-800 rounded mb-2" />
                <div className="h-4 bg-gray-800 rounded w-2/3" />
              </div>
            </div>
          ) : episodesError ? (
            <div className="glass-card rounded-xl p-6 text-center text-gray-300">
              <p className="mb-4">לא הצלחנו לטעון את הפרק האחרון.</p>
              <button
                onClick={() => window.location.reload()}
                className="btn-primary px-6 py-3 rounded-lg font-medium"
              >
                נסה שוב
              </button>
            </div>
          ) : latestEpisode ? (
            <div className="glass-card rounded-xl overflow-hidden">
              {/* Video */}
              <div className="aspect-video bg-gray-900">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${latestEpisode.videoId}`}
                  title={latestEpisode.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Info */}
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">
                  {latestEpisode.title}
                </h3>
                <p className="text-gray-400 mb-4 text-sm leading-relaxed line-clamp-3">
                  {latestEpisode.description ||
                    "הפרק החדש ביותר של הפודקאסט - מוזיקה טובה, ווייבים טובים."}
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={`https://www.youtube.com/watch?v=${latestEpisode.videoId}`}
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
          ) : (
            <p className="text-gray-400">אין פרקים להצגה כרגע.</p>
          )}
        </section>

        {/* Studio card - mobile only */}
        <section className="md:hidden max-w-7xl mx-auto px-6 pb-16">
          <div className="glass-card rounded-2xl p-6 max-w-sm mx-auto flex flex-col items-center text-center">
            <div className="mb-4">
              <div className="w-28 h-28 rounded-full bg-white flex items-center justify-center mx-auto shadow-lg">
                <Image
                  src="/images/musikroom.png"
                  alt="Music Room Studio"
                  width={110}
                  height={110}
                  className="object-contain"
                />
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              התכנית מוקלטת באולפני המיוזיק רום – אולפן פודקאסטים ייחודי
              ומרחב יצירתי ל־DJs להפקות וידאו מקצועיות.
            </p>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-purple-300 hover:text-purple-200 underline-offset-2 hover:underline transition"
            >
              לאתר המיוזיק רום
            </a>
          </div>
        </section>

        {/* Featured Young Artist */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="glass-card rounded-xl p-8 md:p-10 border-2 border-purple-500/30">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🌟</span>
                <h2 className="text-2xl md:text-3xl font-semibold text-gradient">
                  האמן הצעיר המוצג
                </h2>
              </div>
              <Link
                href="/young-artists"
                className="text-sm text-purple-300 hover:text-purple-200 underline-offset-2 hover:underline transition"
              >
                כל האמנים הצעירים ←
              </Link>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-start">
              {/* Left side - Image */}
              <div className="w-full">
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-900">
                  <img
                    src="/images/featured-artist.jpg"
                    alt="Featured Artist"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Right side - Info */}
              <div className="flex flex-col gap-6">
                {/* Artist Name & Bio */}
                <div>
                  <h3 className="text-2xl font-semibold mb-2">
                    שם האמן (Stage Name)
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    כאן יבוא ביוגרפיה קצרה על האמן - הסיפור שלו, איך הוא התחיל ביצירה, 
                    מה מייחד אותו והשראות מוזיקליות. כמה משפטים שמספרים את הסיפור 
                    ומעוררים עניין להאזין למוזיקה שלו.
                  </p>
                </div>

                {/* SoundCloud Embed */}
                <div>
                  <h4 className="text-lg font-semibold mb-3">הטרק המוצג</h4>
                  <div className="rounded-lg overflow-hidden">
                    <iframe
                      width="100%"
                      height="166"
                      scrolling="no"
                      frameBorder="no"
                      allow="autoplay"
                      src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/TRACK_ID_HERE&color=%23a855f7&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false"
                    ></iframe>
                  </div>
                </div>

                {/* Social Links */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-gray-400">עקבו אחריו</h4>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href="#"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                      Instagram
                    </a>
                    <a
                      href="#"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7.8 2.002c-2.9 0-5.25 2.35-5.25 5.25v4.5c0 2.9 2.35 5.25 5.25 5.25h8.4c2.9 0 5.25-2.35 5.25-5.25v-4.5c0-2.9-2.35-5.25-5.25-5.25H7.8zm0 1.5h8.4c2.07 0 3.75 1.68 3.75 3.75v4.5c0 2.07-1.68 3.75-3.75 3.75H7.8c-2.07 0-3.75-1.68-3.75-3.75v-4.5c0-2.07 1.68-3.75 3.75-3.75zM18 5.002c-.414 0-.75.336-.75.75s.336.75.75.75.75-.336.75-.75-.336-.75-.75-.75zM12 6.002c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 1.5c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5-2.5-1.12-2.5-2.5 1.12-2.5 2.5-2.5z"/>
                      </svg>
                      SoundCloud
                    </a>
                    <a
                      href="#"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm5.5 17.3c-.2.4-.7.5-1.1.3-2.8-1.7-6.3-2.1-10.5-1.1-.4.1-.8-.2-.9-.6-.1-.4.2-.8.6-.9 4.6-1 8.5-.6 11.6 1.3.4.2.6.6.3 1z"/>
                      </svg>
                      Spotify
                    </a>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="pt-2">
                  <Link
                    href="/young-artists"
                    className="btn-primary px-6 py-3 rounded-lg font-medium inline-block"
                  >
                    גלו עוד אמנים צעירים
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Previous Episodes - Small Grid */}
        <section className="max-w-7xl mx-auto px-6 pb-16">
          <h3 className="text-xl font-semibold mb-4">פרקים קודמים</h3>

          {episodesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card rounded-lg overflow-hidden">
                  <div className="aspect-video bg-gray-900 animate-pulse" />
                  <div className="p-3">
                    <div className="h-4 bg-gray-800 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : episodesError ? (
            <p className="text-gray-400">לא הצלחנו לטעון פרקים קודמים.</p>
          ) : previousEpisodes.length === 0 ? (
            <p className="text-gray-400">אין עדיין פרקים קודמים.</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {previousEpisodes.map((episode) => (
                  <a
                    key={episode.id}
                    href={`https://www.youtube.com/watch?v=${episode.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-card rounded-lg overflow-hidden hover:scale-105 transition-transform"
                  >
                    <div className="aspect-video bg-gray-800 relative">
                      <img
                        src={episode.thumbnail}
                        alt={episode.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <svg
                          className="w-12 h-12 text-white/90"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium line-clamp-2">
                        {episode.title}
                      </p>
                    </div>
                  </a>
                ))}
              </div>

              <div className="text-center mt-6">
                <Link
                  href="/episodes"
                  className="btn-primary px-6 py-3 rounded-lg font-medium inline-block"
                >
                  כל הפרקים
                </Link>
              </div>
            </>
          )}
        </section>

        {/* Platforms */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="glass-card rounded-xl p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">
              האזינו בכל הפלטפורמות
            </h2>
            <p className="text-gray-400 mb-8">
              כל הפרקים זמינים גם ב־YouTube, Spotify ועוד.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="https://open.spotify.com/show/0LGP2n3IGqeFVv1fIZOkeZ"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary px-6 py-3 rounded-lg font-medium flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm5.5 17.3c-.2.4-.7.5-1.1.3-2.8-1.7-6.3-2.1-10.5-1.1-.4.1-.8-.2-.9-.6-.1-.4.2-.8.6-.9 4.6-1 8.5-.6 11.6 1.3.4.2.6.6.3 1z" />
                </svg>
                Spotify
              </a>
              <a
                href="https://www.youtube.com/@tracktripil"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary px-6 py-3 rounded-lg font-medium flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M10 8l6 4-6 4V8z" />
                  <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 49 49 0 0 0 0 12a49 49 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A49 49 0 0 0 24 12a49 49 0 0 0-.5-5.8z" />
                </svg>
                YouTube
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-800 mt-16">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex flex-col items-center gap-6">
              {/* Social Links */}
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="https://www.instagram.com/tracktrip.il/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-purple-400 transition"
                  aria-label="Instagram"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a
                  href="https://www.facebook.com/tracktrip.il"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-purple-400 transition"
                  aria-label="Facebook"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a
                  href="https://www.youtube.com/@tracktripil"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-purple-400 transition"
                  aria-label="YouTube"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
                <a
                  href="https://open.spotify.com/show/0LGP2n3IGqeFVv1fIZOkeZ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-purple-400 transition"
                  aria-label="Spotify"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                </a>
                <a
                  href="https://wa.me/972509218090"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-purple-400 transition"
                  aria-label="WhatsApp"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
              </div>

              {/* Navigation Links */}
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <Link href="/episodes" className="text-gray-400 hover:text-gray-300 transition">
                  פרקים
                </Link>
                <Link href="/young-artists" className="text-gray-400 hover:text-gray-300 transition">
                  אמנים צעירים
                </Link>
                <Link href="/about" className="text-gray-400 hover:text-gray-300 transition">
                  אודות
                </Link>
              </div>

              {/* Copyright */}
              <div className="text-sm text-gray-500">
                © 2025 יוצאים לטראק
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

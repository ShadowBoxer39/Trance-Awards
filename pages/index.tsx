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
        <nav className="border-b border-gray-800 bg-black/40 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Logo & Brand */}
              <Link
                href="/"
                className="flex items-center gap-3 hover:opacity-90 transition"
              >
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
                <Link href="/" className="text-white text-sm font-medium">
                  בית
                </Link>
                <Link
                  href="/episodes"
                  className="text-gray-300 hover:text-white transition text-sm font-medium"
                >
                  פרקים
                </Link>
                <Link
                  href="/young-artists"
                  className="text-gray-300 hover:text-white transition text-sm font-medium"
                >
                  אמנים צעירים
                </Link>
                <Link
                  href="/about"
                  className="text-gray-300 hover:text-white transition text-sm font-medium"
                >
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
                  href="/"
                  className="block text-white text-sm font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  בית
                </Link>
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

        {/* Studio card - mobile only - MOVED HERE TO APPEAR LOWER ON MOBILE */}
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
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">🌟</span>
              <h2 className="text-2xl md:text-3xl font-semibold text-gradient">
                האמן הצעיר המוצג
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-xl font-semibold mb-3">
                  טרק חדש מהדור הבא
                </h3>
                <p className="text-gray-400 mb-4 leading-relaxed">
                  בכל חודש אנחנו מציגים אמן צעיר מקהילת הטראנס המקומית, עם מוזיקה
                  מקורית, סטים מיוחדים וסיפור אישי מאחורי היצירה.
                </p>
                <Link
                  href="/young-artists"
                  className="btn-primary px-6 py-3 rounded-lg font-medium inline-block"
                >
                  גלו אמנים צעירים
                </Link>
              </div>
              <div className="glass-card rounded-xl h-52 bg-gradient-to-br from-purple-500/40 via-pink-500/30 to-indigo-500/30 flex items-center justify-center">
                <span className="text-5xl">🎧</span>
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
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
              <div>© 2025 יוצאים לטראק</div>
              <div className="flex gap-6">
                <Link href="/episodes" className="hover:text-gray-300 transition">
                  פרקים
                </Link>
                <Link
                  href="/young-artists"
                  className="hover:text-gray-300 transition"
                >
                  אמנים צעירים
                </Link>
                <Link href="/about" className="hover:text-gray-300 transition">
                  אודות
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

// pages/episodes.tsx - EPISODES ARCHIVE
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import React from "react";

const BRAND = {
  logo: "/images/logo.png",
  title: "יוצאים לטראק",
};

// TODO: Replace with actual episode data from your CMS/API
const EPISODES = [
  {
    id: 1,
    title: "פרק 94 - שם הפרק",
    date: "2025-01-15",
    youtubeId: "VIDEO_ID_1",
    spotifyUrl: "https://open.spotify.com/episode/...",
    description: "תיאור קצר של מה היה בפרק - אמנים, טראקים, נושאים מיוחדים.",
    duration: "2:30:00",
    thumbnail: "/images/episode-94.jpg",
  },
  {
    id: 2,
    title: "פרק 93 - שם הפרק",
    date: "2025-01-08",
    youtubeId: "VIDEO_ID_2",
    spotifyUrl: "https://open.spotify.com/episode/...",
    description: "תיאור קצר של מה היה בפרק.",
    duration: "2:15:00",
    thumbnail: "/images/episode-93.jpg",
  },
  // Add more episodes...
];

export default function Episodes() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedEpisode, setSelectedEpisode] = React.useState<typeof EPISODES[0] | null>(null);

  React.useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
  }, []);

  // Filter episodes based on search
  const filteredEpisodes = EPISODES.filter((ep) =>
    ep.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Head>
        <title>כל הפרקים - יוצאים לטראק</title>
        <meta
          name="description"
          content="ארכיון מלא של כל פרקי הפודקאסט יוצאים לטראק. 94+ פרקים של טראנס, ראיונות ומוזיקה."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#FF5AA5" />
        <link rel="icon" type="image/png" href="/images/logo.png" />
      </Head>

      <main className="min-h-screen neon-backdrop text-white">
        {/* Navigation Bar - BIGGER & MORE PROMINENT */}
        <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
              <Image
                src={BRAND.logo}
                alt="יוצאים לטראק"
                width={48}
                height={48}
                className="rounded-full border-2 border-white/20"
              />
              <span className="text-lg font-[900] hidden sm:inline">{BRAND.title}</span>
            </Link>

            <nav className="flex items-center gap-2 sm:gap-3">
              <Link href="/" className="glass rounded-xl px-4 sm:px-6 py-2.5 sm:py-3 text-base sm:text-lg font-bold hover:bg-white/10 transition border border-white/10">
                בית
              </Link>
              <Link href="/episodes" className="glass rounded-xl px-4 sm:px-6 py-2.5 sm:py-3 text-base sm:text-lg font-bold bg-white/10 transition border border-cyan-500/50">
                פרקים
              </Link>
              <Link href="/young-artists" className="glass rounded-xl px-4 sm:px-6 py-2.5 sm:py-3 text-base sm:text-lg font-bold hover:bg-white/10 transition border border-white/10">
                אמנים צעירים
              </Link>
              <Link href="/about" className="glass rounded-xl px-4 sm:px-6 py-2.5 sm:py-3 text-base sm:text-lg font-bold hover:bg-white/10 transition border border-white/10">
                אודות
              </Link>
              <Link href="/vote" className="btn-primary rounded-xl px-4 sm:px-6 py-2.5 sm:py-3 text-base sm:text-lg font-bold border-0">
                הצבעה 🗳️
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero Header */}
        <section className="max-w-6xl mx-auto px-4 pt-12 pb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="text-5xl">🎵</div>
            <div>
              <h1 className="gradient-title text-4xl sm:text-5xl font-[900] mb-2">
                כל הפרקים
              </h1>
              <p className="text-white/70 text-lg">
                {EPISODES.length}+ פרקים של טראנס, מוזיקה וראיונות
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="max-w-xl">
            <div className="glass rounded-2xl p-4 border border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔍</span>
                <input
                  type="text"
                  placeholder="חפשו פרק לפי שם..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/50"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-white/50 hover:text-white transition"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Episodes Grid */}
        <section className="max-w-6xl mx-auto px-4 pb-16">
          {filteredEpisodes.length === 0 ? (
            <div className="glass rounded-3xl p-12 text-center">
              <div className="text-6xl mb-4">🤷</div>
              <p className="text-white/70 text-lg">לא נמצאו פרקים התואמים את החיפוש</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEpisodes.map((episode) => (
                <article
                  key={episode.id}
                  className="glass rounded-2xl overflow-hidden border border-white/10 hover:border-cyan-400/50 transition-all group cursor-pointer"
                  onClick={() => setSelectedEpisode(episode)}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-gradient-to-br from-cyan-500/20 to-purple-500/20 overflow-hidden">
                    {episode.thumbnail ? (
                      <Image
                        src={episode.thumbnail}
                        alt={episode.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-6xl opacity-50">🎵</span>
                      </div>
                    )}
                    {/* Play overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                        <span className="text-3xl">▶️</span>
                      </div>
                    </div>
                    {/* Duration badge */}
                    <div className="absolute bottom-2 right-2 glass rounded-lg px-2 py-1 text-xs">
                      {episode.duration}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <div className="text-xs text-white/50 mb-2">
                      {new Date(episode.date).toLocaleDateString("he-IL", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                    <h3 className="text-lg font-bold mb-2 group-hover:text-cyan-400 transition">
                      {episode.title}
                    </h3>
                    <p className="text-white/70 text-sm line-clamp-2 mb-4">
                      {episode.description}
                    </p>
                    <div className="flex gap-2">
                      <button className="flex-1 glass rounded-lg px-3 py-2 text-xs hover:bg-white/10 transition">
                        ▶️ צפייה
                      </button>
                      <a
                        href={episode.spotifyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 glass rounded-lg px-3 py-2 text-xs hover:bg-white/10 transition text-center"
                      >
                        🎧 Spotify
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Episode Modal */}
        {selectedEpisode && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedEpisode(null)}
          >
            <div
              className="glass rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-auto border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <div className="sticky top-0 z-10 bg-black/40 backdrop-blur border-b border-white/10 p-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">{selectedEpisode.title}</h2>
                <button
                  onClick={() => setSelectedEpisode(null)}
                  className="glass rounded-lg px-3 py-2 hover:bg-white/10 transition"
                >
                  ✕
                </button>
              </div>

              {/* Video Player */}
              <div className="aspect-video bg-black">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${selectedEpisode.youtubeId}`}
                  title={selectedEpisode.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>

              {/* Episode Details */}
              <div className="p-6">
                <div className="text-sm text-white/50 mb-3">
                  {new Date(selectedEpisode.date).toLocaleDateString("he-IL", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  • {selectedEpisode.duration}
                </div>
                <p className="text-white/80 leading-relaxed mb-6">
                  {selectedEpisode.description}
                </p>
                <div className="flex gap-3">
                  <a
                    href={`https://www.youtube.com/watch?v=${selectedEpisode.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary rounded-xl px-6 py-3 text-sm font-bold"
                  >
                    ▶️ צפו ביוטיוב
                  </a>
                  <a
                    href={selectedEpisode.spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass rounded-xl px-6 py-3 text-sm font-bold hover:bg-white/10 transition"
                  >
                    🎧 האזינו בספוטיפיי
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="border-t border-white/10 bg-black/40">
          <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-white/60">
            © 2025 יוצאים לטראק - כל הזכויות שמורות
          </div>
        </footer>
      </main>
    </>
  );
}

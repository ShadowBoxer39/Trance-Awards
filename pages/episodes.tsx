// pages/episodes.tsx - AUTO-UPDATE FROM YOUTUBE API
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import React from "react";
import Navigation from "../components/Navigation";

interface Episode {
  id: number;
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  channelTitle: string;
}

export default function Episodes() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [episodes, setEpisodes] = React.useState<Episode[]>([]);
  const [filteredEpisodes, setFilteredEpisodes] = React.useState<Episode[]>([]);
  const [displayCount, setDisplayCount] = React.useState(12);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
    
    // Fetch episodes from API
    fetch('/api/episodes')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch episodes');
        return res.json();
      })
      .then(data => {
        setEpisodes(data);
        setFilteredEpisodes(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch episodes:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Search functionality
  React.useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredEpisodes(episodes);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = episodes.filter((episode: Episode) => {
      const titleMatch = episode.title.toLowerCase().includes(query);
      const descriptionMatch = episode.description.toLowerCase().includes(query);
      return titleMatch || descriptionMatch;
    });

    setFilteredEpisodes(filtered);
    setDisplayCount(12);
  }, [searchQuery, episodes]);

  const displayedEpisodes = filteredEpisodes.slice(0, displayCount);
  const hasMore = displayCount < filteredEpisodes.length;

  const loadMore = () => {
    setDisplayCount(prev => Math.min(prev + 12, filteredEpisodes.length));
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>פרקים - יוצאים לטראק</title>
          <meta name="description" content="כל הפרקים של יוצאים לטראק" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/images/logo.png" />
        </Head>

        <div className="trance-backdrop min-h-screen text-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-pulse">🎵</div>
            <p className="text-xl text-gray-400">טוען פרקים...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Head>
          <title>פרקים - יוצאים לטראק</title>
          <meta name="description" content="כל הפרקים של יוצאים לטראק" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/images/logo.png" />
        </Head>

        <div className="trance-backdrop min-h-screen text-gray-100 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-semibold mb-3">שגיאה בטעינת הפרקים</h2>
            <p className="text-gray-400 mb-6">לא הצלחנו לטעון את הפרקים. נסה לרענן את הדף.</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary px-6 py-3 rounded-lg font-medium"
            >
              רענן דף
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>פרקים - יוצאים לטראק</title>
        <meta name="description" content="כל הפרקים של יוצאים לטראק" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/images/logo.png" />
      </Head>

      <div className="trance-backdrop min-h-screen text-gray-100">
     <Navigation currentPage="episodes" />

        {/* Hero */}
        <section className="max-w-7xl mx-auto px-6 pt-20 pb-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-6xl mb-6">🎵</div>
            <h1 className="text-5xl md:text-6xl font-semibold mb-5">כל הפרקים</h1>
            <p className="text-xl md:text-2xl text-gray-400 mb-8">
              {episodes.length} פרקים זמינים לצפייה
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="חפש פרק לפי שם, תיאור, אמן..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-900/50 border border-purple-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60 transition text-lg"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                  >
                    ✕
                  </button>
                )}
              </div>
              {searchQuery && (
                <p className="text-sm text-gray-400 mt-3">
                  נמצאו {filteredEpisodes.length} תוצאות עבור "{searchQuery}"
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Episodes Grid */}
        <section className="max-w-7xl mx-auto px-6 py-8">
          {filteredEpisodes.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-2xl font-semibold mb-2">לא נמצאו תוצאות</h2>
              <p className="text-gray-400 mb-6">נסה לחפש משהו אחר</p>
              <button
                onClick={() => setSearchQuery("")}
                className="btn-secondary px-6 py-3 rounded-lg font-medium"
              >
                נקה חיפוש
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayedEpisodes.map((episode: Episode) => (
                  <a
                    key={episode.id}
                    href={`https://www.youtube.com/watch?v=${episode.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-card rounded-xl overflow-hidden hover:scale-105 transition-transform group"
                  >
                    {/* Thumbnail */}
                    <div className="aspect-video bg-gray-800 relative overflow-hidden">
                      <img
                        src={episode.thumbnail}
                        alt={episode.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                      {/* Episode Number Badge */}
                      <div className="absolute top-3 right-3 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        #{episode.id}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="text-base font-semibold mb-2 line-clamp-2 group-hover:text-purple-400 transition">
                        {episode.title}
                      </h3>
                      <p className="text-gray-400 text-xs line-clamp-2 mb-3">
                        {episode.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{new Date(episode.publishedAt).toLocaleDateString('he-IL')}</span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                          צפה
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="text-center mt-12">
                  <button
                    onClick={loadMore}
                    className="btn-primary px-8 py-4 rounded-lg font-medium text-lg"
                  >
                    טען עוד פרקים ({displayCount} מתוך {filteredEpisodes.length})
                  </button>
                </div>
              )}

              {/* Showing count */}
              <div className="text-center mt-8 text-sm text-gray-500">
                מציג {displayedEpisodes.length} מתוך {filteredEpisodes.length} פרקים
              </div>
            </>
          )}
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

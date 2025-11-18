// pages/young-artists.tsx - YOUNG ARTISTS SHOWCASE
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import React from "react";

const BRAND = {
  logo: "/images/logo.png",
  title: "יוצאים לטראק",
};

// TODO: Replace with actual artist data
const CURRENT_ARTISTS = [
  {
    id: 1,
    name: "שם האמן 1",
    photo: "/images/artist-1.jpg",
    genre: "Progressive Psytrance",
    bio: "ביוגרפיה קצרה על האמן - מי הוא, מאיפה הוא, ואיך הגיע למוזיקה. כמה משפטים על הסגנון והעבודות שלו.",
    soundcloudUrl: "https://soundcloud.com/artist1",
    instagramUrl: "https://instagram.com/artist1",
    featuredTrack: "https://soundcloud.com/artist1/track",
    episodeNumber: 94,
    episodeDate: "2025-01-15",
  },
  {
    id: 2,
    name: "שם האמן 2",
    photo: "/images/artist-2.jpg",
    genre: "Full-On",
    bio: "תיאור קצר על האמן השני.",
    soundcloudUrl: "https://soundcloud.com/artist2",
    instagramUrl: "https://instagram.com/artist2",
    featuredTrack: "https://soundcloud.com/artist2/track",
    episodeNumber: 94,
    episodeDate: "2025-01-15",
  },
];

const PAST_ARTISTS = [
  {
    name: "אמן עבר 1",
    photo: "/images/past-1.jpg",
    episodeNumber: 92,
    date: "2025-01-01",
  },
  {
    name: "אמן עבר 2",
    photo: "/images/past-2.jpg",
    episodeNumber: 90,
    date: "2024-12-15",
  },
  // Add more past artists...
];

export default function YoungArtists() {
  React.useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
  }, []);

  return (
    <>
      <Head>
        <title>אמנים צעירים - יוצאים לטראק</title>
        <meta
          name="description"
          content="הכירו את האמנים הצעירים המבטיחים ביותר בסצנת הטראנס הישראלית. במה לדור הבא."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#FF5AA5" />
        <link rel="icon" type="image/png" href="/images/logo.png" />
      </Head>

      <main className="min-h-screen neon-backdrop text-white">
        {/* Navigation Bar */}
        <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
              <Image
                src={BRAND.logo}
                alt="יוצאים לטראק"
                width={36}
                height={36}
                className="rounded-full border border-white/15"
              />
              <span className="text-base font-[700] hidden sm:inline">{BRAND.title}</span>
            </Link>

            <nav className="flex items-center gap-4">
              <Link href="/" className="text-white/80 hover:text-white transition text-sm">
                בית
              </Link>
              <Link href="/episodes" className="text-white/80 hover:text-white transition text-sm">
                פרקים
              </Link>
              <Link href="/young-artists" className="text-white transition text-sm font-bold">
                אמנים צעירים
              </Link>
              <Link href="/about" className="text-white/80 hover:text-white transition text-sm">
                אודות
              </Link>
              <Link href="/vote" className="btn-primary rounded-xl px-4 py-2 text-sm font-bold border-0">
                הצבעה 🗳️
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero Header */}
        <section className="max-w-6xl mx-auto px-4 pt-12 pb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="text-5xl">🌟</div>
            <div>
              <h1 className="gradient-title text-4xl sm:text-5xl font-[900] mb-2">
                אמנים צעירים
              </h1>
              <p className="text-white/70 text-lg">
                במה לדור הבא של הטראנס הישראלי
              </p>
            </div>
          </div>

          {/* Info Box */}
          <div className="glass rounded-2xl p-6 max-w-3xl border border-cyan-500/30">
            <div className="flex items-start gap-4">
              <span className="text-3xl">ℹ️</span>
              <div>
                <h3 className="font-bold text-lg mb-2">איך זה עובד?</h3>
                <p className="text-white/80 leading-relaxed">
                  כל שבועיים אנחנו מזמינים אמנים צעירים מהסצנה הישראלית להופיע בפודקאסט, 
                  להציג את המוזיקה שלהם, ולקבל במה להגיע לקהל רחב יותר. זו ההזדמנות שלהם לזרוח!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Current Artists - Featured Section */}
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="mb-8">
            <h2 className="text-3xl font-[900] mb-2 gradient-title">
              🎤 אמני החודש
            </h2>
            <p className="text-white/70">
              האמנים המוצגים בפרקים האחרונים
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {CURRENT_ARTISTS.map((artist) => (
              <article
                key={artist.id}
                className="glass rounded-3xl overflow-hidden border border-white/10 hover:border-cyan-400/50 transition-all"
              >
                {/* Artist Photo */}
                <div className="relative aspect-square bg-gradient-to-br from-cyan-500/20 to-purple-500/20">
                  {artist.photo ? (
                    <Image
                      src={artist.photo}
                      alt={artist.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-8xl opacity-50">🎧</span>
                    </div>
                  )}
                  {/* Episode badge */}
                  <div className="absolute top-4 right-4 glass rounded-xl px-3 py-2 text-sm font-bold">
                    פרק {artist.episodeNumber}
                  </div>
                </div>

                {/* Artist Info */}
                <div className="p-8">
                  <div className="mb-4">
                    <h3 className="text-3xl font-[900] mb-2">{artist.name}</h3>
                    <div className="text-cyan-400 text-sm font-medium">{artist.genre}</div>
                  </div>

                  <p className="text-white/80 leading-relaxed mb-6">
                    {artist.bio}
                  </p>

                  {/* Date */}
                  <div className="text-white/50 text-sm mb-6">
                    {new Date(artist.episodeDate).toLocaleDateString("he-IL", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>

                  {/* Social Links */}
                  <div className="flex flex-wrap gap-3 mb-6">
                    {artist.soundcloudUrl && (
                      <a
                        href={artist.soundcloudUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="glass rounded-xl px-4 py-2 text-sm hover:bg-white/10 transition"
                      >
                        🎵 SoundCloud
                      </a>
                    )}
                    {artist.instagramUrl && (
                      <a
                        href={artist.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="glass rounded-xl px-4 py-2 text-sm hover:bg-white/10 transition"
                      >
                        📸 Instagram
                      </a>
                    )}
                  </div>

                  {/* Featured Track */}
                  {artist.featuredTrack && (
                    <a
                      href={artist.featuredTrack}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary rounded-2xl px-6 py-3 text-sm font-bold inline-flex items-center gap-2 hover:scale-105 transition-transform"
                    >
                      <span>▶️</span>
                      <span>השמע טראק מומלץ</span>
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Past Artists Archive */}
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="mb-8">
            <h2 className="text-3xl font-[900] mb-2">
              📚 ארכיון אמנים
            </h2>
            <p className="text-white/70">
              כל האמנים הצעירים שהופיעו אצלנו בעבר
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {PAST_ARTISTS.map((artist, index) => (
              <article
                key={index}
                className="glass rounded-2xl overflow-hidden border border-white/10 hover:border-purple-400/50 transition-all group cursor-pointer"
              >
                {/* Photo */}
                <div className="relative aspect-square bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                  {artist.photo ? (
                    <Image
                      src={artist.photo}
                      alt={artist.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl opacity-50">🎵</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <div className="font-bold text-sm mb-1 line-clamp-2 group-hover:text-purple-400 transition">
                    {artist.name}
                  </div>
                  <div className="text-xs text-white/50">
                    פרק {artist.episodeNumber}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="glass rounded-3xl p-8 sm:p-12 text-center border border-white/10">
            <div className="text-6xl mb-6">🎸</div>
            <h2 className="text-3xl font-[900] mb-4 gradient-title">
              אמן צעיר ורוצה להופיע?
            </h2>
            <p className="text-white/80 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
              אנחנו תמיד מחפשים כישרונות חדשים מהסצנה הישראלית. 
              אם אתם יוצרים מוזיקת טראנס ורוצים במה להציג את עצמכם - צרו איתנו קשר!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="https://www.instagram.com/track_trip.trance/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary rounded-2xl px-8 py-4 text-lg font-bold inline-flex items-center gap-2 hover:scale-105 transition-transform"
              >
                <span>📸</span>
                <span>שלחו לנו הודעה באינסטגרם</span>
              </a>
              <a
                href="mailto:contact@tracktrip.co.il"
                className="glass rounded-2xl px-8 py-4 text-lg font-bold hover:bg-white/10 transition"
              >
                ✉️ או שלחו מייל
              </a>
            </div>
          </div>
        </section>

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

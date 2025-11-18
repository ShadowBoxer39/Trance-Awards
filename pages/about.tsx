// pages/about.tsx - ABOUT PAGE
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import React from "react";

const BRAND = {
  logo: "/images/logo.png",
  title: "יוצאים לטראק",
};

export default function About() {
  React.useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
  }, []);

  return (
    <>
      <Head>
        <title>אודות - יוצאים לטראק</title>
        <meta
          name="description"
          content="למדו עוד על יוצאים לטראק - הפודקאסט הכי גדול בטראנס בישראל. 94+ פרקים, מוזיקה, ראיונות ועוד."
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
              <Link href="/episodes" className="glass rounded-xl px-4 sm:px-6 py-2.5 sm:py-3 text-base sm:text-lg font-bold hover:bg-white/10 transition border border-white/10">
                פרקים
              </Link>
              <Link href="/young-artists" className="glass rounded-xl px-4 sm:px-6 py-2.5 sm:py-3 text-base sm:text-lg font-bold hover:bg-white/10 transition border border-white/10">
                אמנים צעירים
              </Link>
              <Link href="/about" className="glass rounded-xl px-4 sm:px-6 py-2.5 sm:py-3 text-base sm:text-lg font-bold bg-white/10 transition border border-cyan-500/50">
                אודות
              </Link>
              <Link href="/vote" className="btn-primary rounded-xl px-4 sm:px-6 py-2.5 sm:py-3 text-base sm:text-lg font-bold border-0">
                הצבעה 🗳️
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero Header */}
        <section className="max-w-4xl mx-auto px-4 pt-12 pb-8">
          <div className="text-center mb-12">
            <div className="mb-8 inline-block relative">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/30 to-purple-500/30 blur-3xl" />
              <Image
                src={BRAND.logo}
                alt="יוצאים לטראק"
                width={120}
                height={120}
                className="relative rounded-3xl border-2 border-white/20"
              />
            </div>
            <h1 className="gradient-title text-4xl sm:text-5xl font-[900] mb-4">
              אודות הפודקאסט
            </h1>
            <p className="text-white/70 text-xl">
              הפודקאסט הכי גדול בטראנס בישראל
            </p>
          </div>
        </section>

        {/* Main Content */}
        <section className="max-w-4xl mx-auto px-4 pb-16">
          <div className="space-y-8">
            {/* Main Story */}
            <div className="glass rounded-3xl p-8 sm:p-12 border border-white/10">
              <h2 className="text-2xl font-[900] mb-6 gradient-title">
                מי אנחנו
              </h2>
              <div className="space-y-4 text-white/80 text-lg leading-relaxed">
                <p>
                  יוצאים לטראק הוא הפודקאסט הכי גדול בטראנס בישראל. 
                  אנחנו מביאים לכם את המוזיקה הטובה ביותר, ראיונות עם האמנים המובילים, 
                  וכמובן - במה לאמנים צעירים שמגיעים לשדר כל שבועיים.
                </p>
                <p>
                  עם יותר מ-94 פרקים ופרק חדש כל שבוע, אנחנו הבית של קהילת הטראנס בישראלית. 
                  המטרה שלנו היא לקדם את הסצנה המקומית, לתת במה לכישרונות חדשים, 
                  ולהביא לכם את המוזיקה הטובה ביותר מהעולם ומהארץ.
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="glass rounded-2xl p-6 text-center border border-white/10">
                <div className="text-4xl font-black gradient-title mb-2">94+</div>
                <div className="text-white/70">פרקים</div>
              </div>
              <div className="glass rounded-2xl p-6 text-center border border-white/10">
                <div className="text-4xl font-black gradient-title mb-2">200+</div>
                <div className="text-white/70">שעות מוזיקה</div>
              </div>
              <div className="glass rounded-2xl p-6 text-center border border-white/10">
                <div className="text-4xl font-black gradient-title mb-2">10K+</div>
                <div className="text-white/70">מאזינים</div>
              </div>
            </div>

            {/* What We Do */}
            <div className="glass rounded-3xl p-8 sm:p-12 border border-white/10">
              <h2 className="text-2xl font-[900] mb-6 gradient-title">
                מה אנחנו עושים
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <span className="text-3xl shrink-0">🎵</span>
                  <div>
                    <h3 className="font-bold text-lg mb-2">פרקים שבועיים</h3>
                    <p className="text-white/70 leading-relaxed">
                      כל שבוע פרק חדש עם המוזיקה הכי טובה מהסצנה הישראלית והעולמית.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <span className="text-3xl shrink-0">🌟</span>
                  <div>
                    <h3 className="font-bold text-lg mb-2">במה לאמנים צעירים</h3>
                    <p className="text-white/70 leading-relaxed">
                      כל שבועיים אנחנו מזמינים אמנים צעירים מהסצנה להציג את המוזיקה שלהם ולקבל חשיפה.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <span className="text-3xl shrink-0">🎤</span>
                  <div>
                    <h3 className="font-bold text-lg mb-2">ראיונות ותוכן מיוחד</h3>
                    <p className="text-white/70 leading-relaxed">
                      ראיונות עם האמנים המובילים, סיפורים מאחורי הקלעים, וכל מה שרציתם לדעת על הסצנה.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Where to Find Us */}
            <div className="glass rounded-3xl p-8 sm:p-12 border border-white/10">
              <h2 className="text-2xl font-[900] mb-6 gradient-title">
                איפה אפשר למצוא אותנו
              </h2>
              <div className="space-y-4">
                <a
                  href="https://www.youtube.com/@tracktripil"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 glass rounded-2xl hover:border-red-500/50 transition-all group"
                >
                  <span className="text-3xl">▶️</span>
                  <div>
                    <div className="font-bold group-hover:text-red-400 transition">YouTube</div>
                    <div className="text-sm text-white/60">צפייה בפרקים מלאים</div>
                  </div>
                </a>

                <a
                  href="https://open.spotify.com/show/0LGP2n3IGqeFVv1fIZOkeZ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 glass rounded-2xl hover:border-green-500/50 transition-all group"
                >
                  <span className="text-3xl">🎧</span>
                  <div>
                    <div className="font-bold group-hover:text-green-400 transition">Spotify</div>
                    <div className="text-sm text-white/60">האזנה לפרקים</div>
                  </div>
                </a>

                <a
                  href="https://www.instagram.com/track_trip.trance/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 glass rounded-2xl hover:border-pink-500/50 transition-all group"
                >
                  <span className="text-3xl">📸</span>
                  <div>
                    <div className="font-bold group-hover:text-pink-400 transition">Instagram</div>
                    <div className="text-sm text-white/60">עדכונים ותכנים</div>
                  </div>
                </a>
              </div>
            </div>

            {/* Contact */}
            <div className="glass rounded-3xl p-8 text-center border border-cyan-500/30">
              <h2 className="text-2xl font-[900] mb-4 gradient-title">
                רוצים ליצור קשר?
              </h2>
              <p className="text-white/70 mb-6">
                יש לכם שאלה, הצעה לשיתוף פעולה, או סתם רוצים לומר שלום?
              </p>
              <a
                href="https://www.instagram.com/track_trip.trance/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary rounded-2xl px-8 py-4 text-lg font-bold inline-flex items-center gap-2 hover:scale-105 transition-transform"
              >
                <span>📸</span>
                <span>שלחו לנו הודעה</span>
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-black/40 mt-16">
          <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-white/60">
            © 2025 יוצאים לטראק - כל הזכויות שמורות
          </div>
        </footer>
      </main>
    </>
  );
}

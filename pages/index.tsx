// pages/index.tsx
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import React from "react";

const BRAND = {
  logo: "/images/logo.png",
  title: "יוצאים לטראק",
};

export default function Home() {
  React.useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
  }, []);

  return (
    <>
      <Head>
        <title>יוצאים לטראק - הפודקאסט הכי גדול בטראנס בישראל</title>
        <meta
          name="description"
          content="הפודקאסט הכי גדול בטראנס בישראל - יוצאים לטראק. הצטרפו לקהילה שלנו!"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#FF5AA5" />
        <link rel="icon" type="image/png" href="/images/logo.png" />
      </Head>

      <main className="min-h-screen neon-backdrop text-white">
        {/* Header - matching vote page style */}
        <header className="sticky top-0 z-10 border-b border-white/10 bg-black/40 backdrop-blur">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src={BRAND.logo}
                alt="יוצאים לטראק"
                width={36}
                height={36}
                className="rounded-full border border-white/15"
                priority
              />
              <span className="text-sm opacity-80 hidden sm:inline">{BRAND.title}</span>
            </Link>
            <div className="ms-auto">
              <Link
                href="/vote"
                className="btn-primary rounded-2xl px-4 py-2 text-sm font-medium"
              >
                הצבעה 🗳️
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-4 pt-16 pb-12">
          <div className="max-w-3xl">
            {/* Logo & Brand */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-500/20 blur-2xl" />
                <Image
                  src={BRAND.logo}
                  alt="יוצאים לטראק"
                  width={80}
                  height={80}
                  className="relative rounded-2xl border border-white/15"
                  priority
                />
              </div>
              <div>
                <h1 className="gradient-title text-4xl sm:text-5xl lg:text-6xl font-[700] leading-tight">
                  יוצאים לטראק
                </h1>
                <p className="text-white/70 text-lg mt-1">
                  הפודקאסט הכי גדול בטראנס בישראל
                </p>
              </div>
            </div>

            {/* Main Description */}
            <div className="glass rounded-3xl p-8 mb-8">
              <p className="text-white/90 text-lg leading-relaxed mb-6">
                פודקאסט טראנס שבועי עם למעלה מ-94 פרקים, המביא לכם את המוזיקה הטובה ביותר, 
                ראיונות עם האמנים המובילים, וכמובן - אמנים צעירים שמגיעים לשדר כל שבועיים.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="glass rounded-xl px-4 py-2 text-sm border border-white/10">
                  <span className="text-white/70">פרקים:</span>{" "}
                  <span className="text-white font-bold">94+</span>
                </div>
                <div className="glass rounded-xl px-4 py-2 text-sm border border-white/10">
                  <span className="text-white/70">תדירות:</span>{" "}
                  <span className="text-white font-bold">שבועי</span>
                </div>
                <div className="glass rounded-xl px-4 py-2 text-sm border border-white/10">
                  <span className="text-white/70">אמנים צעירים:</span>{" "}
                  <span className="text-white font-bold">כל שבועיים</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <Link
                href="/vote"
                className="glass rounded-2xl p-6 hover:border-cyan-400/50 transition-all group"
              >
                <div className="text-3xl mb-3">🗳️</div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-cyan-400 transition">
                  נבחרי השנה 2025
                </h3>
                <p className="text-white/70 text-sm">
                  הצביעו לאמנים, טראקים ואלבומים האהובים עליכם
                </p>
              </Link>

              <div className="glass rounded-2xl p-6 opacity-60">
                <div className="text-3xl mb-3">🎵</div>
                <h3 className="text-xl font-bold mb-2">
                  כל הפרקים
                </h3>
                <p className="text-white/70 text-sm">
                  בקרוב - ארכיון מלא של כל הפרקים שלנו
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Episode Section */}
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-[700] mb-2">
              הפרק האחרון
            </h2>
            <p className="text-white/70">
              צפו בפרק האחרון שלנו ביוטיוב
            </p>
          </div>

          <div className="glass rounded-3xl overflow-hidden max-w-4xl">
            <div className="aspect-video bg-black/60 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="text-6xl mb-4">▶️</div>
                <p className="text-white/70 mb-4">סרטון היוטיוב יופיע כאן</p>
                <a
                  href="https://www.youtube.com/@tracktripil"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary rounded-xl px-6 py-2 text-sm inline-block"
                >
                  לערוץ היוטיוב
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Young Artists Section */}
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-[700] mb-2">
              אמני החודש
            </h2>
            <p className="text-white/70">
              מתעדכן כל שבועיים • האמנים הצעירים המבטיחים ביותר
            </p>
          </div>

          <div className="glass rounded-3xl p-8">
            <div className="text-center text-white/60">
              <div className="text-5xl mb-4">🎵</div>
              <p>האמנים הצעירים יתווספו בקרוב</p>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="glass rounded-3xl p-8 sm:p-12 max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-[700] mb-6">
              אודות הפודקאסט
            </h2>
            <div className="space-y-4 text-white/80 leading-relaxed">
              <p>
                יוצאים לטראק הוא הפודקאסט הכי גדול בטראנס בישראל. אנחנו מביאים לכם את המוזיקה הטובה ביותר, 
                ראיונות עם האמנים המובילים, וכמובן - אמנים צעירים שמגיעים לשדר כל שבועיים.
              </p>
              <p>
                עם יותר מ-94 פרקים ופרק חדש כל שבוע, אנחנו הבית של קהילת הטראנס בישראל. 
                הצטרפו אלינו למסע המוזיקלי הכי מרתק בסצנה הישראלית.
              </p>
            </div>
          </div>
        </section>

        {/* Social Links */}
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-6">
            <h3 className="text-xl font-[700] mb-2">הצטרפו לקהילה</h3>
            <p className="text-white/70 text-sm">עקבו אחרינו ברשתות החברתיות</p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="https://www.instagram.com/track_trip.trance/"
              target="_blank"
              rel="noopener noreferrer"
              className="glass rounded-xl px-5 py-3 hover:border-pink-500/50 transition-all group"
            >
              <span className="text-white/80 group-hover:text-white">📸 Instagram</span>
            </a>

            <a
              href="https://www.youtube.com/@tracktripil"
              target="_blank"
              rel="noopener noreferrer"
              className="glass rounded-xl px-5 py-3 hover:border-red-500/50 transition-all group"
            >
              <span className="text-white/80 group-hover:text-white">▶️ YouTube</span>
            </a>

            <a
              href="https://open.spotify.com/show/0LGP2n3IGqeFVv1fIZOkeZ"
              target="_blank"
              rel="noopener noreferrer"
              className="glass rounded-xl px-5 py-3 hover:border-green-500/50 transition-all group"
            >
              <span className="text-white/80 group-hover:text-white">🎧 Spotify</span>
            </a>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="glass rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-[700] mb-1">הצביעו בנבחרי השנה</h3>
              <p className="text-white/70 text-sm">
                בואו להיות חלק מההיסטוריה של הטראנס הישראלי
              </p>
            </div>
            <Link
              href="/vote"
              className="btn-primary rounded-2xl px-8 py-3 text-base font-medium whitespace-nowrap"
            >
              מעבר להצבעה
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-black/40 mt-16">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/60">
              <div className="flex items-center gap-3">
                <Image
                  src={BRAND.logo}
                  alt="יוצאים לטראק"
                  width={24}
                  height={24}
                  className="rounded-lg"
                />
                <span>© 2025 יוצאים לטראק</span>
              </div>
              <div>
                הפודקאסט הכי גדול בטראנס בישראל 🇮🇱
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}

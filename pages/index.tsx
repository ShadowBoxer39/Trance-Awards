// pages/index.tsx
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import React from "react";

const BRAND = {
  title: "פרסי השנה 2025",
  logo: "/logo.png",
};

const CATEGORIES = [
  "אמן השנה",
  "אמנית השנה",
  "הרכב השנה",
  "אלבום השנה",
  "טראק השנה",
  "פריצת השנה",
];

export default function Landing() {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    // Force RTL at the document level
    document.documentElement.setAttribute("dir", "rtl");

    // Header style on scroll
    const onScroll = () => setScrolled(window.scrollY > 2);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <Head>
        <title>{BRAND.title} — יוצאים לטראק</title>
        <meta name="theme-color" content="#090a0f" />
        <meta name="description" content="דף נחיתה לפרסי השנה של יוצאים לטראק" />
        <meta property="og:title" content={`${BRAND.title} — יוצאים לטראק`} />
        <meta property="og:description" content="הקהילה בוחרת את ההיילייטס של השנה." />
        <meta property="og:image" content={BRAND.logo} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <main className="min-h-screen neon-backdrop text-white font-gan">
        {/* Header */}
        <header
          className={[
            "sticky top-0 z-20 border-b border-white/10 transition-colors",
            scrolled ? "bg-black/60 backdrop-blur" : "bg-transparent",
          ].join(" ")}
        >
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3" aria-label="חזרה לדף הבית">
              <Image
                src={BRAND.logo}
                alt="יוצאים לטראק"
                width={36}
                height={36}
                className="rounded-full border border-white/15"
                priority
              />
              <span className="text-sm opacity-80 hidden sm:inline">יוצאים לטראק</span>
            </Link>
            <nav className="ms-auto flex items-center gap-2">
              <a href="#about" className="btn-ghost rounded-2xl px-3 py-2 text-sm hidden sm:inline-block">
                מה זה?
              </a>
              <Link href="/awards" className="btn-primary rounded-2xl px-4 py-2 inline-block">
                התחילו הצבעה
              </Link>
            </nav>
          </div>
        </header>

        {/* HERO */}
        <section className="relative overflow-hidden">
          {/* soft radial glow */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_80%_0%,rgba(255,90,165,.18),transparent_60%)]" />
          <div className="max-w-6xl mx-auto px-4 pt-10 sm:pt-16 pb-10 sm:pb-16 grid lg:grid-cols-[1.2fr,0.8fr] gap-10 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src={BRAND.logo}
                  alt="לוגו יוצאים לטראק"
                  width={56}
                  height={56}
                  className="rounded-2xl border border-white/15"
                />
                <span className="text-white/80 text-sm">מגישים: יוצאים לטראק</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-[800] leading-[1.05] tracking-tight mb-3">
                פרסי השנה{" "}
                <span className="bg-gradient-to-r from-sky-300 via-pink-300 to-orange-300 bg-clip-text text-transparent">
                  2025
                </span>
              </h1>

              <p className="text-white/80 text-lg mb-8">
                הקהילה בוחרת את ההיילייטס של השנה.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link href="/awards" className="btn-primary rounded-2xl px-6 py-3 text-base">
                  המשך להצבעה
                </Link>
                <a href="#about" className="btn-ghost rounded-2xl px-6 py-3 text-base">
                  מה זה?
                </a>
              </div>

              {/* Category chips (horizontal scroll on mobile) */}
              <div className="mt-8 overflow-x-auto" aria-label="קטגוריות">
                <ul className="flex gap-2 min-w-max pr-1">
                  {CATEGORIES.map((t) => (
                    <li key={t} className="shrink-0">
                      <Link
                        href="/awards"
                        className="px-4 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/90 text-sm whitespace-nowrap inline-block"
                        aria-label={`עברו לקטגוריה ${t}`}
                      >
                        {t}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* right column – simple cards grid */}
            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map((t) => (
                <div key={t} className="glass rounded-2xl px-4 py-3 text-sm text-white/90">
                  {t}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section id="about" className="max-w-6xl mx-auto px-4 pb-12">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass rounded-3xl p-6">
              <h2 className="text-xl font-[800] mb-2">מה זה המיזם?</h2>
              <p className="text-white/75">
                סקר קהילתי קצר שמכבד את מי שעשו לנו את השנה — אמנים, אמניות, הרכבים ויצירות.
              </p>
            </div>
            <div className="glass rounded-3xl p-6">
              <h2 className="text-xl font-[800] mb-2">מי אנחנו — יוצאים לטראק</h2>
              <p className="text-white/75">
                פודקאסט וקהילה שמספרים את סיפור הטרנס הישראלי. מצטרפים? לחצו על הקישורים שלנו.
              </p>
            </div>
          </div>
        </section>

        {/* SOCIALS */}
        <section className="max-w-6xl mx-auto px-4 pb-16">
          <h3 className="text-lg font-[800] mb-3">עקבו אחרינו</h3>
          <div className="flex flex-wrap gap-8" role="list">
            <a
              className="font-milky text-sm px-4 py-2 rounded-xl"
              href="https://instagram.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              style={{ background: "#FF5AA5", color: "#0b0b0b" }}
            >
              Instagram
            </a>
            <a
              className="font-milky text-sm px-4 py-2 rounded-xl"
              href="https://youtube.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
              style={{ background: "#FF0000", color: "#fff" }}
            >
              YouTube
            </a>
            <a
              className="font-milky text-sm px-4 py-2 rounded-xl"
              href="https://open.spotify.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Spotify"
              style={{ background: "#1DB954", color: "#0b0b0b" }}
            >
              Spotify
            </a>
            <a
              className="font-milky text-sm px-4 py-2 rounded-xl btn-ghost"
              href="https://tiktok.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="TikTok"
            >
              TikTok
            </a>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="max-w-6xl mx-auto px-4 pb-24">
          <div className="glass rounded-3xl p-6 md:p-8 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-base md:text-lg font-[800]">מוכנים לבחור?</div>
              <div className="text-white/70 text-sm">ההצבעה פתוחה עכשיו.</div>
            </div>
            <Link href="/awards" className="btn-primary rounded-2xl px-6 py-3 text-base">
              התחילו הצבעה
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-black/40">
          <div className="max-w-6xl mx-auto px-4 py-6 text-xs text-white/60">
            © {new Date().getFullYear()} יוצאים לטראק — פרסי השנה.
          </div>
        </footer>
      </main>
    </>
  );
}

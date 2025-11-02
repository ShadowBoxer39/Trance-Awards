// pages/index.tsx
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import React from "react";

const BRAND = {
  title: "פרסי השנה 2025",
  logo: "/logo.png",
};

export default function Landing() {
  React.useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
  }, []);

  return (
    <>
      <Head>
        <title>{BRAND.title} — יוצאים לטראק</title>
        <meta name="theme-color" content="#090a0f" />
        <meta name="description" content="דף נחיתה לפרסי השנה של יוצאים לטראק" />
        <meta property="og:title" content={`${BRAND.title} — יוצאים לטראק`} />
        <meta property="og:image" content={BRAND.logo} />
      </Head>

      <main className="min-h-screen neon-backdrop text-white font-gan">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b border-white/10 bg-black/40 backdrop-blur">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
            <Image src={BRAND.logo} alt="יוצאים לטראק" width={44} height={44}
                   className="rounded-full border border-white/15" priority />
            <div className="text-sm opacity-80">יוצאים לטראק</div>
            <div className="ms-auto">
              <Link href="/awards" className="btn-primary rounded-2xl px-4 py-2 inline-block">
                התחילו הצבעה
              </Link>
            </div>
          </div>
        </header>

        {/* HERO */}
        <section className="max-w-6xl mx-auto px-4 pt-10 sm:pt-16">
          <div className="grid lg:grid-cols-[1.2fr,0.8fr] gap-10 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Image src={BRAND.logo} alt="לוגו יוצאים לטראק"
                       width={64} height={64} className="rounded-2xl border border-white/15" />
                <span className="text-white/80 text-sm">מגישים: יוצאים לטראק</span>
              </div>

              <h1 className="gradient-title text-4xl sm:text-6xl font-[700] leading-[1.05] tracking-tight mb-4">
                פרסי השנה
                <span className="block text-white drop-shadow-[0_0_10px_rgba(255,90,165,.25)]">
                  2025
                </span>
              </h1>

              <p className="text-white/80 text-lg mb-8">הקהילה בוחרת את ההיילייטס של השנה.</p>

              <div className="flex flex-wrap gap-3">
                <Link href="/awards" className="btn-primary rounded-2xl px-6 py-3 text-base">
                  המשך להצבעה
                </Link>
                <a href="#about" className="btn-ghost rounded-2xl px-6 py-3 text-base">מה זה?</a>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {["אמן השנה","אמנית השנה","הרכב השנה","אלבום השנה","טראק השנה","פריצת השנה"].map(t => (
                <div key={t} className="glass rounded-2xl px-4 py-3 text-sm text-white/90">{t}</div>
              ))}
            </div>
          </div>
        </section>

        {/* ABOUT (super short) */}
        <section id="about" className="max-w-6xl mx-auto px-4 py-10">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass rounded-3xl p-6">
              <h2 className="text-xl font-[700] mb-2">מה זה המיזם?</h2>
              <p className="text-white/75">סקר קהילתי קצר שמכבד את מי שעשו לנו את השנה.</p>
            </div>
            <div className="glass rounded-3xl p-6">
              <h2 className="text-xl font-[700] mb-2">מי אנחנו — יוצאים לטראק</h2>
              <p className="text-white/75">פודקאסט/קהילה שמספרים את סיפור הטרנס הישראלי.</p>
            </div>
          </div>
        </section>

        {/* SOCIALS */}
        <section className="max-w-6xl mx-auto px-4 pb-16">
          <h3 className="text-lg font-[700] mb-3">עקבו אחרינו</h3>
          <div className="flex flex-wrap gap-8">
            <a className="font-milky text-sm px-4 py-2 rounded-xl"
               href="https://instagram.com/" target="_blank" rel="noreferrer"
               style={{ background: "#FF5AA5", color: "#0b0b0b" }}>Instagram</a>
            <a className="font-milky text-sm px-4 py-2 rounded-xl"
               href="https://youtube.com/" target="_blank" rel="noreferrer"
               style={{ background: "#FF0000", color: "#fff" }}>YouTube</a>
            <a className="font-milky text-sm px-4 py-2 rounded-xl"
               href="https://open.spotify.com/" target="_blank" rel="noreferrer"
               style={{ background: "#1DB954", color: "#0b0b0b" }}>Spotify</a>
            <a className="font-milky text-sm px-4 py-2 rounded-xl btn-ghost"
               href="https://tiktok.com/" target="_blank" rel="noreferrer">TikTok</a>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="max-w-6xl mx-auto px-4 pb-24">
          <div className="glass rounded-3xl p-6 md:p-8 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-base md:text-lg font-[700]">מוכנים לבחור?</div>
              <div className="text-white/70 text-sm">ההצבעה פתוחה עכשיו.</div>
            </div>
            <Link href="/awards" className="btn-primary rounded-2xl px-6 py-3 text-base">
              התחילו הצבעה
            </Link>
          </div>
        </section>

        <footer className="border-t border-white/10 bg-black/40">
          <div className="max-w-6xl mx-auto px-4 py-6 text-xs text-white/60">
            © {new Date().getFullYear()} יוצאים לטראק — פרסי השנה.
          </div>
        </footer>
      </main>
    </>
  );
}

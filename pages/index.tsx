// pages/index.tsx
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import React from "react";

const BRAND = {
  title: "פרסי השנה 2025",
  // file must be at /public/images/logo.png
  logo: "/images/logo.png",
};

// simple inline SVG icons (no extra packages)
type IconProps = { className?: string };

const IconInstagram = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
    <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5A5.5 5.5 0 1 1 6.5 13 5.5 5.5 0 0 1 12 7.5zm0 2A3.5 3.5 0 1 0 15.5 13 3.5 3.5 0 0 0 12 9.5zm6.75-2.75a1.25 1.25 0 1 1-1.25 1.25 1.25 1.25 0 0 1 1.25-1.25z"/>
  </svg>
);

const IconYouTube = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
    <path d="M23.5 7.2a4 4 0 0 0-2.8-2.9C18.8 3.7 12 3.7 12 3.7s-6.8 0-8.7.6A4 4 0 0 0 .5 7.2 41 41 0 0 0 0 12a41 41 0 0 0 .5 4.8 4 4 0 0 0 2.8 2.9c1.9.6 8.7.6 8.7.6s6.8 0 8.7-.6a4 4 0 0 0 2.8-2.9A41 41 0 0 0 24 12a41 41 0 0 0-.5-4.8zM9.8 15V9l6 3-6 3z"/>
  </svg>
);

const IconSpotify = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
    <path d="M12 1.5a10.5 10.5 0 1 0 0 21 10.5 10.5 0 0 0 0-21zm4.6 15.3a.9.9 0 0 1-1.2.3 11.7 11.7 0 0 0-8.6-.9.9.9 0 0 1-.5-1.7 13.6 13.6 0 0 1 10 1.1.9.9 0 0 1 .3 1.2zm1.6-3.1a1 1 0 0 1-1.3.4 15.3 15.3 0 0 0-10.8-1.1 1 1 0 1 1-.6-1.9 17.3 17.3 0 0 1 12.2 1.2 1 1 0 0 1 .5 1.4zM19 9.3a1.1 1.1 0 0 1-1.4.5 18.8 18.8 0 0 0-12.6-1.3 1.1 1.1 0 0 1-.6-2.1 20.9 20.9 0 0 1 14 1.5 1.1 1.1 0 0 1 .6 1.4z"/>
  </svg>
);

const IconTikTok = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
    <path d="M21 8.1a7 7 0 0 1-4.7-2V16a5.9 5.9 0 1 1-6.9-5.8V13a3.2 3.2 0 1 0 3.2 3.2V2h3.4a7 7 0 0 0 5 2.1z"/>
  </svg>
);

const IconWhatsApp = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
    <path d="M20 3.9A10 10 0 0 0 2 14.2L1 22l7.9-1A10 10 0 0 0 20 3.9zm-8 15.2a8 8 0 1 1 0-16.1 8 8 0 0 1 0 16.1zm4.6-5.1c-.3-.2-1.8-.9-2-.9s-.5-.1-.8.3-.9 1-.9 1.1-.3.2-.6.1a6.5 6.5 0 0 1-3-2.7c-.2-.3 0-.5.2-.7l.5-.6c.1-.2.2-.4.1-.6s-.5-1.3-.7-1.7c-.2-.4-.4-.4-.6-.4h-.5a1 1 0 0 0-.8.4 3.2 3.2 0 0 0-1 2.3 5.6 5.6 0 0 0 1.2 2.9 10 10 0 0 0 4 3.6c.4.1.8.1 1.2.1a3 3 0 0 0 2-1 2.5 2.5 0 0 0 .5-1.5c0-.3 0-.4-.2-.5z"/>
  </svg>
);

const SOCIALS = [
  {
    name: "Instagram",
    url: "https://www.instagram.com/track_trip.trance/",
    style: { background: "#E1306C", color: "#fff" },
    Icon: IconInstagram,
  },
  {
    name: "YouTube",
    url: "https://www.youtube.com/@tracktripil",
    style: { background: "#FF0000", color: "#fff" },
    Icon: IconYouTube,
  },
  {
    name: "Spotify",
    url: "https://open.spotify.com/show/0LGP2n3IGqeFVVlflZOkeZ",
    style: { background: "#1DB954", color: "#0b0b0b" },
    Icon: IconSpotify,
  },
  {
    name: "TikTok",
    url: "https://www.tiktok.com/@tracktripil",
    style: { background: "#000000", color: "#fff", border: "1px solid rgba(255,255,255,0.15)" },
    Icon: IconTikTok,
  },
  {
    name: "WhatsApp",
    // ⬇️ replace with your community/invite link or phone: https://wa.me/<number>
    url: "https://chat.whatsapp.com/LSZaHTgYXPn4HRvrsCnmTc",
    style: { background: "#25D366", color: "#0b0b0b" },
    Icon: IconWhatsApp,
  },
];


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

      <main className="min-h-screen neon-backdrop text-white">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b border-white/10 bg-black/40 backdrop-blur">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
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
            <div className="ms-auto">
              <Link
                href="/awards"
                className="btn-primary rounded-2xl px-4 py-2 inline-flex items-center justify-center border-0 outline-none focus:outline-none focus:ring-0 overflow-hidden"
              >
                התחילו הצבעה
              </Link>
            </div>
          </div>
        </header>

        {/* HERO */}
        <section className="max-w-6xl mx-auto px-4 pt-10 sm:pt-16">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src={BRAND.logo}
                alt="לוגו יוצאים לטראק"
                width={64}
                height={64}
                className="rounded-2xl border border-white/15"
              />
              <span className="text-white/80 text-sm">מגישים: יוצאים לטראק</span>
            </div>

            <h1 className="gradient-title text-4xl sm:text-6xl font-[700] leading-[1.05] tracking-tight mb-4">
              פרסי השנה
              <span className="block text-white drop-shadow-[0_0_10px_rgba(255,90,165,.25)]">
                2025
              </span>
            </h1>

            <p className="text-white/80 text-lg mb-8">
              הקהילה בוחרת את פרסי השנה בטראנס.
            </p>

            <Link
              href="/awards"
              className="btn-primary rounded-2xl px-6 py-3 text-base inline-flex items-center justify-center border-0 outline-none focus:outline-none focus:ring-0 overflow-hidden"
            >
              המשך להצבעה
            </Link>
          </div>
        </section>

        {/* ABOUT — keep only left card */}
        <section id="about" className="max-w-6xl mx-auto px-4 py-10">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass rounded-3xl p-6">
              <h2 className="text-xl font-[700] mb-2">מי אנחנו — יוצאים לטראק</h2>
              <p className="text-white/75">תכנית הטראנס הכי גדולה בישראל, הצטרפו לקהילה שלנו .</p>
            </div>
            {/* removed the “מה זה המיזם?” card */}
          </div>
        </section>

        {/* SOCIALS */}
        <section className="max-w-6xl mx-auto px-4 pb-16">
          <h3 className="text-lg font-[700] mb-3">עקבו אחרינו</h3>
         <div className="flex flex-wrap gap-3">
  {SOCIALS.map((s) => (
    <a
      key={s.name}
      href={s.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl font-medium ring-1 ring-white/0 hover:ring-white/20 transition"
      style={s.style as React.CSSProperties}
      aria-label={s.name}
    >
      <s.Icon className="w-5 h-5" />
      <span className="hidden sm:inline">{s.name}</span>
    </a>
  ))}
</div>
        </section>

        {/* FINAL CTA */}
        <section className="max-w-6xl mx-auto px-4 pb-24">
          <div className="glass rounded-3xl p-6 md:p-8 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-base md:text-lg font-[700]">מוכנים לבחור?</div>
              <div className="text-white/70 text-sm">ההצבעה פתוחה עכשיו.</div>
            </div>
            <Link
              href="/awards"
              className="btn-primary rounded-2xl px-6 py-3 text-base inline-flex items-center justify-center border-0 outline-none focus:outline-none focus:ring-0 overflow-hidden"
            >
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

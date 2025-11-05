// pages/index.tsx
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import React from "react";
import LiveVoteCounter from "../components/LiveVoteCounter";
import { FaInstagram, FaYoutube, FaSpotify, FaTiktok, FaWhatsapp } from "react-icons/fa";

const BRAND = {
  title: "נבחרי השנה בטראנס 2025",
  logo: "/images/logo.png",
};

const SOCIALS = [
  {
    name: "WhatsApp",
    url: "https://chat.whatsapp.com/LSZaHTgYXPn4HRvrsCnmTc",
    color: "#25D366",
    Icon: FaWhatsapp,
  },
  {
    name: "TikTok",
    url: "https://www.tiktok.com/@tracktripil",
    color: "#000000",
    Icon: FaTiktok,
  },
  {
    name: "Spotify",
    url: "https://open.spotify.com/show/0LGP2n3IGqeFVVlflZOkeZ",
    color: "#1DB954",
    Icon: FaSpotify,
  },
  {
    name: "YouTube",
    url: "https://www.youtube.com/@tracktripil",
    color: "#FF0000",
    Icon: FaYoutube,
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/track_trip.trance/",
    color: "#E1306C",
    Icon: FaInstagram,
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
        <meta name="description" content="נבחרי השנה בטראנס של יוצאים לטראק" />
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
              נבחרי השנה בטראנס
              <span className="block text-white drop-shadow-[0_0_10px_rgba(255,90,165,.25)]">
                2025
              </span>
            </h1>

            <p className="text-white/80 text-lg mb-8">
              הקהילה בוחרת את נבחרי השנה בטראנס.
            </p>

            {/* Live Counter */}
            <div className="mb-8">
              <LiveVoteCounter />
            </div>

            <Link
              href="/awards"
              className="btn-primary rounded-2xl px-6 py-3 text-base inline-flex items-center justify-center border-0 outline-none focus:outline-none focus:ring-0 overflow-hidden"
            >
              המשך להצבעה
            </Link>
          </div>
        </section>

        {/* ABOUT */}
        <section id="about" className="max-w-6xl mx-auto px-4 py-10">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass rounded-3xl p-6">
              <h2 className="text-xl font-[700] mb-2">מי אנחנו — יוצאים לטראק</h2>
              <p className="text-white/75">תכנית הטראנס הכי גדולה בישראל, הצטרפו לקהילה שלנו.</p>
            </div>
          </div>
        </section>

      {/* SOCIALS */}
<section className="max-w-6xl mx-auto px-4 pb-16">
  <h3 className="text-lg font-[700] mb-3">עקבו אחרינו</h3>
  <div className="flex flex-wrap gap-3">
    {SOCIALS.map((social) => (
      
        key={social.name}
        href={social.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2 rounded-full text-white font-medium hover:scale-105 transition-transform shadow-md"
        style={{ backgroundColor: social.color }}
      >
        <social.Icon className="w-5 h-5" />
        <span>{social.name}</span>
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
            © {new Date().getFullYear()} יוצאים לטראק — נבחרי השנה.
          </div>
        </footer>
      </main>
    </>
  );
}

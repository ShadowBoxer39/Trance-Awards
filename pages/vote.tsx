// pages/index.tsx
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import React from "react";
import { FaInstagram, FaYoutube, FaSpotify, FaTiktok, FaWhatsapp } from "react-icons/fa";
import dynamic from "next/dynamic";


const LiveVoteCounter = dynamic(() => import("../components/LiveVoteCounter"), {
  ssr: false,
});

const BRAND = {
  title: "נבחרי השנה בטראנס 2025",
  logo: "/images/logo.png",
  logoFull: "https://tracktrip.co.il/images/logo.png", // For social sharing
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
  {/* Basic Meta */}
  <title>{BRAND.title} — יוצאים לטראק</title>
  <meta name="description" content="הצביעו לאמנים, הטראקים והאלבומים הכי טובים של 2025. פרסי הטראנס הראשונים של הקהילה הישראלית!" />
  <meta name="theme-color" content="#FF5AA5" />
  
  {/* Favicon */}
  <link rel="icon" type="image/png" href="/images/logo.png" />
  <link rel="apple-touch-icon" href="/images/logo.png" />
  
  {/* Open Graph (Facebook, WhatsApp) */}
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://tracktrip.co.il" />
  <meta property="og:title" content="נבחרי השנה בטראנס 2025 — יוצאים לטראק" />
  <meta property="og:description" content="הצביעו לאמנים, הטראקים והאלבומים הכי טובים! 🎵🔥" />
  <meta property="og:image" content="https://tracktrip.co.il/images/logo.png" />
  <meta property="og:image:width" content="512" />
  <meta property="og:image:height" content="512" />
  <meta property="og:locale" content="he_IL" />
  
  {/* Twitter */}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="נבחרי השנה בטראנס 2025" />
  <meta name="twitter:description" content="הצביעו לאמנים האהובים עליכם!" />
  <meta name="twitter:image" content="https://tracktrip.co.il/images/logo.png" />
  
  {/* Additional */}
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="keywords" content="טראנס, פסיטראנס, מוזיקה אלקטרונית, ישראל, פרסים, הצבעה" />
</Head>

      <main className="min-h-screen neon-backdrop text-white">
        {/* Header */}
       <header className="sticky top-0 z-10 border-b border-white/10 bg-black/40 backdrop-blur">
  <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
    <Link href="/" className="flex items-center gap-2" aria-label="חזרה לעמוד ההצבעה">
      {/* Track Trip Logo */}
      <Image
        src={BRAND.logo}
        alt="יוצאים לטראק"
        width={36}
        height={36}
        className="rounded-full border border-white/15"
        priority
      />
      
      {/* Musikroom Logo - close together */}
      <Image
        src="/images/musikroom.png"
        alt="Musikroom"
        width={36}
        height={36}
        className="rounded-full border border-white/15 bg-white p-1"
      />
      
      <span className="text-sm opacity-80 hidden sm:inline">יוצאים לטראק × מיוזיק רום</span>
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
          <div className="flex items-center gap-4 mb-4 flex-wrap">
  {/* Track Trip */}
  <Image
    src={BRAND.logo}
    alt="לוגו יוצאים לטראק"
    width={64}
    height={64}
    className="rounded-2xl border border-white/15"
  />
  <span className="text-white/80 text-sm">מגישים: יוצאים לטראק</span>

  {/* Separator */}
  <span className="text-white/40 text-xl">×</span>

  {/* Musikroom */}
  <Image
    src="/images/musikroom.png"
    alt="Musikroom"
    width={64}
    height={64}
    className="rounded-2xl border border-white/15 bg-white p-2"
  />
  <span className="text-white/80 text-sm">מיוזיק רום</span>
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
    {/* Card 1 - Track Trip */}
    <div className="glass rounded-3xl p-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-500/20 blur-xl" />
          <Image
            src="/images/logo.png"
            alt="יוצאים לטראק"
            width={56}
            height={56}
            className="relative rounded-2xl border border-white/15"
          />
        </div>
        <h2 className="text-xl font-[700]">מי אנחנו - יוצאים לטראק</h2>
      </div>
      <p className="text-white/75">
        תכנית הטראנס הגדולה בישראל, הצטרפו לקהילה שלנו.
      </p>
    </div>
    
    {/* Card 2 - Musikroom */}
    <div className="glass rounded-3xl p-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 blur-xl" />
          <Image
            src="/images/musikroom.png"
            alt="Musikroom"
            width={56}
            height={56}
            className="relative rounded-2xl border border-white/15 bg-white p-2"
          />
        </div>
        <h2 className="text-xl font-[700]">בשיתוף - המיוזיק רום</h2>
      </div>
      <p className="text-white/75">
       אולפן פודקאסטים ייחודי ומרחב יצירתי ל־DJs להפקות וידאו מקצועיות.
      </p>
    </div>
  </div>
</section>

      {/* SOCIALS */}
<section className="max-w-6xl mx-auto px-4 pb-16">
  <h3 className="text-lg font-[700] mb-3">עקבו אחרינו</h3>
 <div className="flex flex-wrap gap-3">
  {SOCIALS.map((social) => (
    <a
      key={social.name}
      href={social.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-4 py-2 rounded-full text-white font-medium hover:scale-105 transition-transform shadow-md"
      style={{ backgroundColor: social.color }}
      aria-label={social.name}
    >
      <social.Icon className="w-5 h-5" />
      <span>{social.name}</span>
    </a>
  ))}
</div>

</section>


         {/* WHY VOTE - New stunning section */}
<section className="max-w-6xl mx-auto px-4 py-16">
  {/* Section Header */}
  <div className="text-center mb-12">
    <h2 className="gradient-title text-3xl sm:text-4xl font-[700] mb-3">
      למה כדאי להצביע?
    </h2>
    <p className="text-white/70 text-lg">
      הקול שלכם משנה את הסצנה הישראלית
    </p>
  </div>

  {/* Cards Grid */}
  <div className="grid md:grid-cols-3 gap-6">
    
    {/* Card 1 */}
    <div className="glass rounded-3xl p-8 text-center group hover:border-cyan-400/50 transition-all hover:shadow-xl hover:shadow-cyan-400/10">
      {/* Icon with glow */}
      <div className="relative inline-block mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-purple-500 blur-2xl opacity-50 group-hover:opacity-75 transition" />
        <div className="relative text-6xl sm:text-7xl">🎵</div>
      </div>
      
      <h3 className="text-xl font-bold mb-3 text-white">
        תמכו באמנים שלכם
      </h3>
      <p className="text-white/70 leading-relaxed">
        עזרו לאמנים האהובים עליכם לקבל את ההכרה שמגיעה להם ולהמשיך ליצור מוזיקה מדהימה
      </p>
      
      {/* Decorative line */}
      <div className="mt-6 h-1 w-16 mx-auto bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50 group-hover:opacity-100 transition" />
    </div>

    {/* Card 2 */}
    <div className="glass rounded-3xl p-8 text-center group hover:border-purple-400/50 transition-all hover:shadow-xl hover:shadow-purple-400/10">
      <div className="relative inline-block mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-500 blur-2xl opacity-50 group-hover:opacity-75 transition" />
        <div className="relative text-6xl sm:text-7xl">🏆</div>
      </div>
      
      <h3 className="text-xl font-bold mb-3 text-white">
        השפיעו על הסצנה
      </h3>
      <p className="text-white/70 leading-relaxed">
        הקול שלכם קובע מי יהיו הכוכבים הבאים של הטראנס הישראלי ומה המוזיקה שנשמע ברחבות
      </p>
      
      <div className="mt-6 h-1 w-16 mx-auto bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-50 group-hover:opacity-100 transition" />
    </div>

    {/* Card 3 */}
    <div className="glass rounded-3xl p-8 text-center group hover:border-pink-400/50 transition-all hover:shadow-xl hover:shadow-pink-400/10">
      <div className="relative inline-block mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-orange-500 blur-2xl opacity-50 group-hover:opacity-75 transition" />
        <div className="relative text-6xl sm:text-7xl">🎉</div>
      </div>
      
      <h3 className="text-xl font-bold mb-3 text-white">
        תהיו חלק מההיסטוריה
      </h3>
      <p className="text-white/70 leading-relaxed">
        נבחרי השנה הראשונים של הקהילה! אתם עושים היסטוריה במוזיקה האלקטרונית בישראל
      </p>
      
      <div className="mt-6 h-1 w-16 mx-auto bg-gradient-to-r from-transparent via-pink-400 to-transparent opacity-50 group-hover:opacity-100 transition" />
    </div>

  </div>

  {/* Bottom CTA */}
  <div className="mt-12 text-center">
    <Link
      href="/awards"
      className="btn-primary rounded-2xl px-8 py-4 text-lg font-bold inline-flex items-center justify-center gap-2 hover:scale-105 transition-transform"
    >
      <span>מוכנים להצביע?</span>
      <span>🚀</span>
    </Link>
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

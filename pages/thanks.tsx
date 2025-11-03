// pages/thanks.tsx
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import React from "react";

const BRAND = {
  title: "פרסי השנה 2025",
  logo: "/images/logo.png",
};

export default function Thanks() {
  React.useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
  }, []);

  return (
    <>
      <Head>
        <title>תודה שהצבעת — יוצאים לטראק</title>
        <meta name="theme-color" content="#090a0f" />
        <meta name="description" content="תודה על ההצבעה לפרסי השנה של יוצאים לטראק" />
        <meta property="og:title" content="תודה שהצבעת — יוצאים לטראק" />
        <meta property="og:image" content={BRAND.logo} />
      </Head>

      <main className="min-h-screen neon-backdrop text-white">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b border-white/10 bg-black/40 backdrop-blur">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
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
          </div>
        </header>

        {/* Content */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="glass rounded-3xl p-8 md:p-12 text-center max-w-2xl mx-auto">
            <div className="flex justify-center mb-6">
              <Image
                src={BRAND.logo}
                alt="לוגו יוצאים לטראק"
                width={80}
                height={80}
                className="rounded-2xl border border-white/15"
              />
            </div>
            <h1 className="gradient-title text-3xl sm:text-4xl font-[700] mb-3">
              תודה שהצבעת!
            </h1>
            <p className="text-white/80 text-base sm:text-lg mb-8">
              הקול שלך נקלט. נחבר את התוצאות ונפרסם בהמשך ✨
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/" className="btn-primary rounded-2xl px-6 py-3 text-base">
                חזרה לדף הראשי
              </Link>
              <Link href="/awards" className="btn-ghost rounded-2xl px-6 py-3 text-base">
                חזרה לטופס
              </Link>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/10 bg-black/40">
          <div className="max-w-6xl mx-auto px-4 py-6 text-xs text-white/60 text-center">
            © {new Date().getFullYear()} יוצאים לטראק — פרסי השנה.
          </div>
        </footer>
      </main>
    </>
  );
}

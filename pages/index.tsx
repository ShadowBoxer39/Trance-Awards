// pages/index.tsx
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { Heebo } from "next/font/google";
import React from "react";

const heebo = Heebo({
  subsets: ["latin", "hebrew"],
  weight: ["400", "600", "800"],
});

const BRAND = {
  primary: "#FF3E80", // pink/orange vibe
  secondary: "#00E5FF", // cyan
  dark: "#0B0B0F",
  siteTitle: "פרסי הטרנס הישראלי 2025 – יוצאים לטראק",
  logo: "/logo.png", // put your logo at public/logo.png
};

export default function Landing() {
  React.useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
  }, []);

  return (
    <>
      <Head>
        <title>{BRAND.siteTitle}</title>
        <meta
          name="description"
          content="דף נחיתה לפרסי הטרנס הישראלי 2025 — יוצאים לטראק. בואו להצביע ולכבד את האמנים והטראקים הבולטים של השנה."
        />
        <meta property="og:title" content={BRAND.siteTitle} />
        <meta
          property="og:description"
          content="דף נחיתה לפרסי הטרנס הישראלי 2025 — יוצאים לטראק."
        />
        <meta property="og:image" content="/logo.png" />
        <meta name="theme-color" content={BRAND.dark} />
      </Head>

      <main
        className={`${heebo.className} min-h-screen text-white`}
        style={{
          background:
            `radial-gradient(90rem 60rem at 15% -10%, ${BRAND.secondary}14, transparent),` +
            `radial-gradient(90rem 60rem at 85% 10%, ${BRAND.primary}18, ${BRAND.dark})`,
        }}
      >
        {/* Header */}
        <header className="sticky top-0 z-10 bg-black/40 backdrop-blur border-b border-white/10">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
            <Image
              src={BRAND.logo}
              alt="יוצאים לטראק"
              width={40}
              height={40}
              className="rounded-full border border-white/15"
              priority
            />
            <div className="font-bold tracking-tight">יוצאים לטראק</div>
            <div className="ms-auto">
              <Link
                href="/awards"
                className="px-4 py-2 rounded-xl text-black font-semibold"
                style={{ backgroundColor: BRAND.secondary }}
              >
                התחילו הצבעה
              </Link>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src={BRAND.logo}
                  alt="לוגו יוצאים לטראק"
                  width={64}
                  height={64}
                  className="rounded-2xl border border-white/15"
                />
                <span className="text-sm text-white/70">מגישים:</span>
                <span className="text-base font-semibold">יוצאים לטראק</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight mb-4">
                פרסי הטרנס הישראלי 2025
              </h1>
              <p className="text-white/80 text-lg mb-8">
                ברוכים הבאים לדף ההצבעה הרשמי! כאן אתם מחליטים מי האמנים,
                הטרקים והאלבומים שעשו לכם את השנה. ההצבעה קצרה, מהנה, ומכבדת את
                הקהילה.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/awards"
                  className="px-6 py-3 rounded-2xl text-black font-semibold shadow"
                  style={{ backgroundColor: BRAND.primary }}
                >
                  התחילו הצבעה
                </Link>
                <a
                  href="#about"
                  className="px-6 py-3 rounded-2xl border border-white/20 hover:border-white/40"
                >
                  על המיזם
                </a>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <Feature
                  title="שקוף ופשוט"
                  text="הצבעה קצרה ומדויקת — חוויה מהירה לכל קהל הטרנס."
                />
                <Feature
                  title="מכבדים את הקהילה"
                  text="מטרת המיזם היא להאיר באור חיובי את היוצרים והיוצרות."
                />
                <Feature
                  title="מוזיקה במרכז"
                  text="שמים פוקוס על האמנים, הטראקים והאלבומים שעשו את השנה."
                />
                <Feature
                  title="אווירה טובה"
                  text="בכיף, בנימוס, ובלי מלחמות. משפחה אחת של טרנס."
                />
              </div>
            </div>
          </div>
        </section>

        {/* About */}
        <section id="about" className="max-w-6xl mx-auto px-4 pb-6">
          <div className="grid lg:grid-cols-2 gap-8">
            <Card>
              <h2 className="text-2xl font-extrabold mb-3">מה זה המיזם?</h2>
              <p className="text-white/80">
                “פרסי הטרנס הישראלי” הוא סקר קהילתי שנועד לכבד ולהוקיר את היוצרים,
                היוצרות וההפקות שפעלו השנה. כל אחד ואחת בקהילה מוזמנים להצביע,
                לשתף, ולהפיץ אהבה. אין פה “פרסים רשמיים” — אלא מחוות הערכה
                משותפת.
              </p>
            </Card>
            <Card>
              <h2 className="text-2xl font-extrabold mb-3">מי אנחנו — יוצאים לטראק</h2>
              <p className="text-white/80">
                “יוצאים לטראק” הוא פודקאסט/קהילה שמכבדת את תרבות הטרנס בישראל,
                את החלוצים והחלוצות, ואת הדור החדש. אנחנו מספרים סיפורים, מארחים
                אמנים, וחוגגים יחד את המוזיקה שמחברת אותנו.
              </p>
            </Card>
          </div>
        </section>

        {/* Socials */}
        <section className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-2xl font-extrabold mb-4">עקבו אחרינו</h2>
          <div className="flex flex-wrap gap-3">
            <Social
              label="Instagram"
              href="https://instagram.com/"
              bg={BRAND.primary}
            />
            <Social
              label="YouTube"
              href="https://youtube.com/"
              bg="#FF0000"
            />
            <Social
              label="Spotify"
              href="https://open.spotify.com/"
              bg="#1DB954"
            />
            <Social
              label="TikTok"
              href="https://tiktok.com/"
              bg="#000000"
              border
            />
          </div>
        </section>

        {/* Call to Action */}
        <section className="max-w-6xl mx-auto px-4 pb-16">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-10 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h3 className="text-xl md:text-2xl font-bold">
                מוכנים לבחור את ה-Highlights של השנה?
              </h3>
              <p className="text-white/70">
                ההצבעה פתוחה — בואו נרים יחד את הטרנס הישראלי.
              </p>
            </div>
            <Link
              href="/awards"
              className="px-6 py-3 rounded-2xl text-black font-semibold"
              style={{ backgroundColor: BRAND.secondary }}
            >
              המשך להצבעה
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-black/40">
          <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-white/60">
            © {new Date().getFullYear()} יוצאים לטראק — פרסי הטרנס הישראלי. כל הזכויות שמורות.
          </div>
        </footer>
      </main>
    </>
  );
}

/** ——— Small presentational components ——— */
function Feature({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-lg font-bold mb-1">{title}</div>
      <div className="text-white/70 text-sm">{text}</div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      {children}
    </div>
  );
}

function Social({
  label,
  href,
  bg,
  border,
}: {
  label: string;
  href: string;
  bg?: string;
  border?: boolean;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`px-4 py-2 rounded-xl font-semibold ${
        border ? "border border-white/20" : "text-black"
      }`}
      style={!border ? { backgroundColor: bg || "#fff" } : {}}
    >
      {label}
    </a>
  );
}

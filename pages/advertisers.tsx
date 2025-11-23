// pages/advertisers.tsx - ADVERTISERS & SPONSORS PAGE (REVERTED TO DIRECT CONTACT)
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import React from "react";
import Navigation from "../components/Navigation";

export default function Advertisers() {
  React.useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
  }, []);

  return (
    <>
      <Head>
        <title>למפרסמים - יוצאים לטראק</title>
        <meta
          name="description"
          content="הצטרפו לפודקאסט הטראנס המוביל בישראל. הזדמנויות פרסום וחסויות למותגים המעוניינים להגיע לקהילת הטראנס."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/images/logo.png" />
      </Head>

      <div className="trance-backdrop min-h-screen text-gray-100">
       {/* FIX 1: Corrected currentPage prop to highlight the correct nav link */}
       <Navigation currentPage="advertisers" />

        {/* Hero Section */}
        <header className="max-w-7xl mx-auto px-6 pt-20 pb-8"> {/* PB reduced to move stats down */}
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gradient">
              הצטרפו למסע שלנו
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              פודקאסט הטראנס המוביל בישראל מחפש שותפים עסקיים
            </p>
          </div>
        </header>
        
        {/* ENHANCEMENT 5: Moved Stats Section down for better flow - NOW WITH 4 STATS */}
        <section className="max-w-7xl mx-auto px-6 pb-16">
            <div className="flex flex-wrap justify-center gap-4 text-lg">
                <div className="glass-card px-6 py-3 rounded-lg">
                    <span className="text-purple-400 font-semibold">50+</span> פרקים
                </div>
                <div className="glass-card px-6 py-3 rounded-lg">
                    <span className="text-purple-400 font-semibold">200+</span> שעות תוכן
                </div>
                <div className="glass-card px-6 py-3 rounded-lg">
                    <span className="text-purple-400 font-semibold">אלפי</span> מאזינים נאמנים
                </div>
                 {/* NEW STAT: WhatsApp Community */}
                <div className="glass-card px-6 py-3 rounded-lg">
                    <span className="text-purple-400 font-semibold">500+</span> בווצאפ
                </div>
            </div>
        </section>

        {/* Why Partner With Us */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold mb-12 text-center">למה לפרסם אצלנו?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card p-8 rounded-xl border border-purple-500/30">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-3">קהל ממוקד</h3>
              <p className="text-gray-400">
                גישה ישירה לקהילת הטראנס והאלקטרוניקה בישראל - קהל צעיר, פעיל ומחובר
              </p>
            </div>

            <div className="glass-card p-8 rounded-xl border border-purple-500/30">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-semibold mb-3">חשיפה מקסימלית</h3>
              <p className="text-gray-400">
                נוכחות בכל הפלטפורמות - YouTube, Spotify, ורשתות החברתיות
              </p>
            </div>

            <div className="glass-card p-8 rounded-xl border border-purple-500/30">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold mb-3">שיתוף פעולה אותנטי</h3>
              <p className="text-gray-400">
                אנחנו מאמינים בשיתופי פעולה אמיתיים שמתאימים למותג שלכם ולקהל שלנו
              </p>
            </div>
          </div>
        </section>

        {/* Partnership Opportunities */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold mb-12 text-center">אפשרויות שיתוף פעולה</h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="glass-card p-8 rounded-xl">
              <h3 className="text-2xl font-semibold mb-4 text-purple-400">חסות פרקים</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-purple-400 mt-1">✓</span>
                  <span>אזכור המותג בפתיחת וסגירת הפרק</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-400 mt-1">✓</span>
                  <span>לוגו בתיאור הפרק ובתמונת השער</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-400 mt-1">✓</span>
                  <span>קוד קופון ייחודי למאזינים</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-400 mt-1">✓</span>
                  <span>פוסטים באינסטגרם ובפייסבוק</span>
                </li>
              </ul>
            </div>

            <div className="glass-card p-8 rounded-xl">
              <h3 className="text-2xl font-semibold mb-4 text-purple-400">שיתופי פעולה ארוכי טווח</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-purple-400 mt-1">✓</span>
                  <span>חסות עונתית לסדרת פרקים</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-400 mt-1">✓</span>
                  <span>נוכחות באירועי הפודקאסט</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-400 mt-1">✓</span>
                  <span>תוכן ממותג מיוחד</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-400 mt-1">✓</span>
                  <span>קמפיינים משולבים ברשתות החברתיות</span>
                </li>
              </ul>
            </div>

            <div className="glass-card p-8 rounded-xl">
              <h3 className="text-2xl font-semibold mb-4 text-purple-400">פרסום דיגיטלי</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-purple-400 mt-1">✓</span>
                  <span>באנרים באתר הפודקאסט</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-400 mt-1">✓</span>
                  <span>סטוריז ופוסטים ממומנים</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-400 mt-1">✓</span>
                  <span>קמפיין במייל למנויים</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-400 mt-1">✓</span>
                  <span>קישור באפליקציות הפודקאסט</span>
                </li>
              </ul>
            </div>

            <div className="glass-card p-8 rounded-xl">
              <h3 className="text-2xl font-semibold mb-4 text-purple-400">אירועים ופעילויות</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-purple-400 mt-1">✓</span>
                  <span>חסות לאירועי השקה והקלטות</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-400 mt-1">✓</span>
                  <span>דוכן במיטאפים של הקהילה</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-400 mt-1">✓</span>
                  <span>שיתופי פעולה עם אמנים צעירים</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-400 mt-1">✓</span>
                  <span>פעילויות ייחודיות למותג שלכם</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Our Partners */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold mb-8 text-center">השותפים שלנו</h2>
          <div className="glass-card rounded-xl p-12 max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <div className="w-40 h-40 rounded-full bg-white flex items-center justify-center mx-auto shadow-lg border-2 border-purple-500/30"> {/* FIX: Restored white BG for contrast */}
                <Image
                  src="/images/musikroom.png"
                  alt="Music Room Studio"
                  width={150}
                  height={150}
                  className="object-contain p-2"
                />
              </div>
            </div>
            <h3 className="text-2xl font-semibold mb-4">המיוזיק רום</h3>
            <p className="text-gray-300 leading-relaxed">
              התכנית מוקלטת באולפני המיוזיק רום – אולפן פודקאסטים ייחודי ומרחב יצירתי ל־DJs להפקות וידאו מקצועיות.
            </p>
          </div>
        </section>

        {/* Contact Section - Reverted to direct links */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="glass-card rounded-xl p-12 max-w-3xl mx-auto border-2 border-purple-500/30">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-4">בואו נדבר</h2>
              <p className="text-xl text-gray-300">
                מעוניינים לשמוע עוד? צרו איתנו קשר ונבנה ביחד משהו מדהים
              </p>
            </div>
            
            {/* DIRECT CONTACT LINKS */}
            <div className="space-y-6 max-w-sm mx-auto">
                <div className="flex flex-wrap justify-center gap-4">
                     {/* Email Button */}
                    <a 
                      href="mailto:tracktripil@gmail.com" 
                      className="w-full btn-primary px-8 py-3 rounded-lg font-medium text-lg flex items-center justify-center gap-3"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      שלח אימייל
                    </a>
                     {/* WhatsApp Button */}
                    <a 
                      href="https://wa.me/972509218090" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full btn-secondary px-8 py-3 rounded-lg font-medium text-lg flex items-center justify-center gap-3"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      שלח הודעה
                    </a>
                </div>

                <div className="text-center pt-4 border-t border-gray-700">
                    <h3 className="text-lg font-semibold text-white/90 mb-2">מספר טלפון ישיר</h3>
                    <p className="text-xl text-purple-400">050-921-8090</p>
                </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-800 mt-16">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
              <div>© 2025 יוצאים לטראק</div>
              <div className="flex gap-6">
                <Link href="/" className="hover:text-gray-300 transition">בית</Link>
                <Link href="/episodes" className="hover:text-gray-300 transition">פרקים</Link>
                <Link href="/young-artists" className="hover:text-gray-300 transition">אמנים צעירים</Link>
                <Link href="/about" className="hover:text-gray-300 transition">אודות</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

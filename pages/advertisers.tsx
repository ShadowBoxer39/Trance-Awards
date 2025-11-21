// pages/advertisers.tsx - ADVERTISERS & SPONSORS PAGE (IMPROVED)
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import React, { useState } from "react";
import Navigation from "../components/Navigation";

// Mock contact form component for simplicity (no server integration here)
function ContactForm() {
    const [status, setStatus] = useState<'initial' | 'sent'>('initial');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real application, this would call an API route (e.g., /api/contact)
        setStatus('sent');
        setTimeout(() => setStatus('initial'), 5000);
    };

    if (status === 'sent') {
        return (
            <div className="text-center py-12 bg-green-900/40 rounded-xl border border-green-500/30">
                <div className="text-4xl mb-4">✅</div>
                <h3 className="text-xl font-semibold mb-2 text-green-400">ההודעה נשלחה בהצלחה!</h3>
                <p className="text-gray-300">תודה. נחזור אליכם בהקדם.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="company" className="block text-sm font-medium mb-2 text-gray-300">
                    שם חברה/מותג (אופציונלי)
                </label>
                <input
                    type="text"
                    id="company"
                    name="company"
                    className="w-full px-4 py-3 bg-gray-900/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60 transition"
                    placeholder="הכנס שם חברה"
                />
            </div>
            <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2 text-gray-300">
                    שם איש קשר *
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full px-4 py-3 bg-gray-900/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60 transition"
                    placeholder="שם מלא"
                />
            </div>
            <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-300">
                    אימייל *
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 bg-gray-900/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60 transition"
                    placeholder="your.email@example.com"
                />
            </div>
            <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2 text-gray-300">
                    פרטי שיתוף הפעולה *
                </label>
                <textarea
                    id="message"
                    name="message"
                    required
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60 transition resize-none"
                    placeholder="ספרו לנו על המותג והתקציב המשוער"
                />
            </div>
            <button
                type="submit"
                className="w-full btn-primary px-8 py-3 rounded-lg font-medium text-lg"
            >
                שלח פניה
            </button>
        </form>
    );
}
// END ContactForm component

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
        
        {/* ENHANCEMENT 5: Moved Stats Section down for better flow */}
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
              <div className="w-40 h-40 rounded-full bg-white/10 flex items-center justify-center mx-auto shadow-lg border-2 border-purple-500/30"> {/* C-Enhancement: Updated styling */}
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

        {/* Contact Section - Now includes a form */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="glass-card rounded-xl p-12 max-w-3xl mx-auto border-2 border-purple-500/30">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">בואו נדבר</h2>
              <p className="text-xl text-gray-300">
                מעוניינים לשמוע עוד? צרו איתנו קשר ונבנה ביחד משהו מדהים
              </p>
            </div>
            
            {/* ENHANCEMENT: Contact Form replaces hard contact details */}
            <ContactForm />

            <div className="mt-8 pt-6 border-t border-gray-700">
              <h3 className="text-lg font-semibold mb-4 text-center">או צרו קשר ישירות</h3>
              <div className="space-y-4 max-w-xs mx-auto">
                 {/* Email */}
                <div className="flex items-center gap-4 p-3 bg-gray-900/50 rounded-lg">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a 
                    href="mailto:tracktripil@gmail.com" 
                    className="text-base text-white hover:text-purple-400 transition"
                  >
                    tracktripil@gmail.com
                  </a>
                </div>

                {/* WhatsApp - FIX 2: Corrected the wa.me link format */}
                <div className="flex items-center gap-4 p-3 bg-gray-900/50 rounded-lg">
                  <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <a 
                    href="https://wa.me/972509218090" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base text-white hover:text-purple-400 transition"
                  >
                    050-921-8090
                  </a>
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">עקבו אחרינו ברשתות</p>
            </div>
            
            <div className="flex justify-center gap-4 mt-4">
              {/* Instagram */}
              <a
                href="https://www.instagram.com/tracktrip.il/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-purple-400 transition"
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              {/* Facebook */}
              <a
                href="https://www.facebook.com/tracktrip.il"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-purple-400 transition"
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a
              >
              {/* YouTube */}
              <a
                href="https://www.youtube.com/@tracktripil"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-purple-400 transition"
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              {/* Spotify - FIX 2: Corrected URL to dummy */}
              <a
                href="https://open.spotify.com/artist/4cpLog6uK5HawBNvdc1W5d?si=HKqy7XX0TkWVNnQIQ_QEBw"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-purple-400 transition"
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
              </a>
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

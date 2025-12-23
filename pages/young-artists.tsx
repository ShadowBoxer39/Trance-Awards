// pages/young-artists.tsx - Landing Page for "פרק במה לאמנים 2"
import { GetServerSideProps } from 'next';
import { createClient } from "@supabase/supabase-js";
import Head from "next/head";
import Link from "next/link";
import React from "react";
import Navigation from "../components/Navigation";
import SEO from "@/components/SEO";
import { FaInstagram, FaSpotify, FaSoundcloud, FaYoutube, FaWhatsapp, FaCheck, FaChevronDown } from "react-icons/fa";

interface AlumniArtist {
  id: number;
  artist_id: string;
  name: string;
  stage_name: string;
  bio: string;
  profile_photo_url: string;
  instagram_url?: string;
  soundcloud_profile_url?: string;
  spotify_url?: string;
}

interface PageProps {
  alumniArtists: AlumniArtist[];
}

const ARTIST_QUOTES: { [key: string]: string } = {
  nardia: "ההזדמנות הזו פתחה לי דלתות שלא ידעתי שקיימות",
  modulation: "הפרק היה נקודת מפנה בקריירה שלנו",
  shaprut: "הקהילה של יוצאים לטראק היא משפחה אמיתית",
  tanoma: "חוויה שלא אשכח לעולם",
};

const FAQ_ITEMS = [
  { question: "מתי הפרק מוקלט?", answer: "הפרק יוקלט באביב 2025, התאריך המדויק יפורסם בקרוב לאמנים שייבחרו." },
  { question: "איך תהליך הבחירה עובד?", answer: "אנחנו מאזינים לכל הטראקים שנשלחים, ובוחרים 4 אמנים שהמוזיקה שלהם מדברת אלינו. אנחנו מחפשים מקוריות, איכות הפקה ופוטנציאל." },
  { question: "איך אדע אם התקבלתי?", answer: "ניצור איתכם קשר ישירות דרך הטלפון או הוואטסאפ. אם לא שמעתם מאיתנו אתם מוזמנים לשלוח הודעה בקהילה." },
  { question: "איפה מקליטים את הפרק?", answer: "ההקלטה מתבצעת באולפן מקצועי באזור המרכז. הפרטים המדויקים יימסרו לאמנים שייבחרו." },
  { question: "האם אני צריך כמות מסוימת של טראקים בחוץ?", answer: "לא! אנחנו מחפשים פוטנציאל ואיכות, לא כמות. גם אם יש לכם רק טראק אחד או שניים, שלחו אותם." },
];

const DEADLINE_DATE: string | null = null;

export default function YoungArtistsLanding({ alumniArtists }: PageProps) {
  const [formData, setFormData] = React.useState({ fullName: "", stageName: "", age: "", phone: "", experienceYears: "", inspirations: "", trackLink: "" });
  const [formSubmitted, setFormSubmitted] = React.useState(false);
  const [formLoading, setFormLoading] = React.useState(false);
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  React.useEffect(() => { document.documentElement.setAttribute("dir", "rtl"); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const response = await fetch("/api/submit-artist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Submission failed");
      setFormSubmitted(true);
      setTimeout(() => { setFormSubmitted(false); setFormData({ fullName: "", stageName: "", age: "", phone: "", experienceYears: "", inspirations: "", trackLink: "" }); }, 10000);
    } catch (error: any) {
      alert(`שגיאה בשליחת הטופס. אנא נסו שוב.`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const scrollToForm = () => {
    document.getElementById('apply-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <SEO title="פרק במה לאמנים 2 | יוצאים לטראק" description="הצטרפו לפרק המיוחד השני של יוצאים לטראק! 4 אמנים צעירים יקבלו במה להציג את המוזיקה שלהם. אביב 2025." url="https://www.tracktrip.co.il/young-artists" />
      <Head>
        <title>פרק במה לאמנים 2 | יוצאים לטראק</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/images/logo.png" />
      </Head>

      <div className="min-h-screen bg-black text-white">
        <Navigation currentPage="young-artists" />

        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-black to-cyan-900/20" />
            <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[150px] animate-pulse" />
            <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-600/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 rounded-full text-amber-300 text-sm font-medium mb-8">
              <span className="text-lg">🌟</span>
              <span>אביב 2025</span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight">
              <span className="block bg-gradient-to-l from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">פרק במה לאמנים</span>
              <span className="block text-white mt-2">2</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-4 font-light">4 אמנים. במה אחת. הזדמנות אמיתית.</p>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">קהילת יוצאים לטראק מזמינה אמנים צעירים ומבטיחים להצטרף לפרק מיוחד שיתן לכם במה להציג את המוזיקה שלכם בפני אלפי אנשים</p>

            <button onClick={scrollToForm} className="group inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-lg py-4 px-10 rounded-2xl transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105">
              להגשת מועמדות
              <svg className="w-5 h-5 transform group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
            </button>

            {DEADLINE_DATE && (
              <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-full text-red-300 text-sm">
                <span>⏰</span><span>הגשות עד {DEADLINE_DATE}</span>
              </div>
            )}
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <svg className="w-8 h-8 text-purple-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
          </div>
        </section>

        {/* Episode 1 Success Section */}
        <section className="py-20 px-6 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-950/20 to-black" />
          <div className="relative max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-4xl mb-4 block">🎉</span>
              <h2 className="text-3xl md:text-5xl font-bold mb-4"><span className="bg-gradient-to-l from-purple-400 to-cyan-400 bg-clip-text text-transparent">הפרק הראשון היה הצלחה אדירה</span></h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">בפרק הראשון אירחנו 4 אמנים מוכשרים שקיבלו במה וסיפרו לנו ולקהל על המסע שלהם</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              <div className="glass-card rounded-2xl p-8 text-center border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:scale-105">
                <div className="text-5xl mb-3">🎧</div>
                <div className="text-4xl font-black text-purple-400 mb-2">10,000+</div>
                <div className="text-gray-400">צפיות והאזנות</div>
              </div>
              <div className="glass-card rounded-2xl p-8 text-center border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 hover:scale-105">
                <div className="text-5xl mb-3">🎤</div>
                <div className="text-4xl font-black text-cyan-400 mb-2">4</div>
                <div className="text-gray-400">אמנים שקיבלו במה</div>
              </div>
              <div className="glass-card rounded-2xl p-8 text-center border border-pink-500/20 hover:border-pink-500/40 transition-all duration-300 hover:scale-105">
                <div className="text-5xl mb-3">📸</div>
                <div className="text-4xl font-black text-pink-400 mb-2">אלפי צפיות</div>
                <div className="text-gray-400">ברשתות החברתיות</div>
              </div>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition duration-500" />
                <div className="relative bg-black rounded-2xl overflow-hidden border border-gray-800">
                  <div className="aspect-video">
                    <iframe width="100%" height="100%" src="https://www.youtube.com/embed/leIABciiXK4?start=1450" title="פרק במה לאמנים 1" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full" />
                  </div>
                  <div className="p-6 bg-gradient-to-t from-gray-900 to-transparent">
                    <a href="https://www.youtube.com/watch?v=leIABciiXK4" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition font-medium">
                      <FaYoutube className="text-xl" />צפו בפרק המלא ביוטיוב
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Alumni Artists Section */}
        <section className="py-20 px-6 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-4xl mb-4 block">⭐</span>
              <h2 className="text-3xl md:text-5xl font-bold mb-4"><span className="bg-gradient-to-l from-amber-400 to-orange-400 bg-clip-text text-transparent">הכירו את האמנים מהפרק הראשון</span></h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">4 אמנים מוכשרים שקיבלו במה והפכו לחלק מהמשפחה</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {alumniArtists.map((artist) => (
                <Link key={artist.id} href={`/artist/${artist.artist_id}`} className="group relative block">
                  <div className="absolute -inset-1 bg-gradient-to-br from-purple-600/50 to-cyan-600/50 rounded-3xl blur-lg opacity-0 group-hover:opacity-30 transition duration-500" />
                  <div className="relative glass-card rounded-2xl overflow-hidden border border-gray-800 group-hover:border-purple-500/50 transition-all duration-300">
                    <div className="flex flex-col sm:flex-row">
                      <div className="relative w-full sm:w-48 h-64 sm:h-auto flex-shrink-0 overflow-hidden">
                        <img src={artist.profile_photo_url} alt={artist.stage_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black/60 via-transparent to-transparent" />
                      </div>
                      <div className="flex-1 p-6 flex flex-col">
                        <div className="mb-4">
                          <span className="text-2xl font-bold text-white group-hover:text-purple-400 transition">{artist.stage_name}</span>
                          <p className="text-gray-400 text-sm">{artist.name}</p>
                        </div>
                        <blockquote className="text-gray-300 italic mb-4 flex-1">&ldquo;{ARTIST_QUOTES[artist.artist_id] || "חוויה מדהימה להיות חלק מהפרק"}&rdquo;</blockquote>
                        <div className="flex items-center gap-3">
                          {artist.soundcloud_profile_url && <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center"><FaSoundcloud className="text-white" /></div>}
                          {artist.spotify_url && <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center"><FaSpotify className="text-white" /></div>}
                          {artist.instagram_url && <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center"><FaInstagram className="text-white" /></div>}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link href="/featured-artists" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition font-medium">
                לכל האמנים הצעירים שלנו
                <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
            </div>
          </div>
        </section>

        {/* What You Get Section */}
        <section className="py-20 px-6 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-cyan-950/10 to-black" />
          <div className="relative max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-4xl mb-4 block">🎁</span>
              <h2 className="text-3xl md:text-5xl font-bold mb-4"><span className="bg-gradient-to-l from-cyan-400 to-purple-400 bg-clip-text text-transparent">מה מקבלים?</span></h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">להיבחר לפרק במה לאמנים זה הרבה יותר מסתם הופעה בפודקאסט</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { icon: "🎙️", title: "פרק שלם", description: "תהיו חלק מפרק שלם של תכנית הטראנס הגדולה בישראל", gradient: "from-purple-500/20 to-purple-600/20", border: "border-purple-500/30 hover:border-purple-500/60" },
                { icon: "📺", title: "חשיפה לאלפי אנשים", description: "הפרק יעלה ליוטיוב, ספוטיפיי ולכל הפלטפורמות עם חשיפה לקהילה ענקית", gradient: "from-cyan-500/20 to-cyan-600/20", border: "border-cyan-500/30 hover:border-cyan-500/60" },
                { icon: "📸", title: "תוכן לרשתות", description: "חלקים נבחרים מהפרק יעלו בכל הרשתות החברתיות בשיתוף איתכם", gradient: "from-pink-500/20 to-pink-600/20", border: "border-pink-500/30 hover:border-pink-500/60" },
                { icon: "🤝", title: "קשרים בקהילה", description: "תהפכו לחלק מהמשפחה של יוצאים לטראק ותיצרו קשרים עם אמנים ואנשי תעשייה", gradient: "from-amber-500/20 to-amber-600/20", border: "border-amber-500/30 hover:border-amber-500/60" }
              ].map((benefit, index) => (
                <div key={index} className={`glass-card rounded-2xl p-8 bg-gradient-to-br ${benefit.gradient} border ${benefit.border} transition-all duration-300 hover:scale-[1.02]`}>
                  <div className="text-5xl mb-4">{benefit.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{benefit.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Apply Section */}
        <section id="apply-section" className="py-20 px-6 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-950/20 to-black" />
          <div className="relative max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-4xl mb-4 block">📝</span>
              <h2 className="text-3xl md:text-5xl font-bold mb-4"><span className="bg-gradient-to-l from-purple-400 to-pink-400 bg-clip-text text-transparent">הגישו מועמדות</span></h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">שני צעדים פשוטים וההרשמה שלכם תישלח אלינו</p>
            </div>

            {/* Step 1: WhatsApp */}
            <div className="mb-8">
              <div className="glass-card rounded-2xl p-8 border-2 border-green-500/30 bg-gradient-to-br from-green-500/10 to-green-600/5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0"><span className="text-2xl font-bold text-white">1</span></div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">הצטרפו לקהילת הוואטסאפ</h3>
                    <p className="text-gray-300 mb-6 leading-relaxed">חובה להיות חבר בקהילת הוואטסאפ שלנו כדי להגיש מועמדות. זה המקום שבו אנחנו מתקשרים עם האמנים ומפרסמים עדכונים.</p>
                    <a href="https://chat.whatsapp.com/LSZaHTgYXPn4HRvrsCnmTc" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-green-500/30">
                      <FaWhatsapp className="text-2xl" />הצטרפו לקהילה
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Form */}
            <div className="glass-card rounded-2xl p-8 border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-purple-600/5">
              <div className="flex items-start gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0"><span className="text-2xl font-bold text-white">2</span></div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">מלאו את הטופס</h3>
                  <p className="text-gray-300">ספרו לנו על עצמכם ושלחו לנו את המוזיקה שלכם</p>
                </div>
              </div>

              {!formSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium mb-2 text-gray-300">שם מלא <span className="text-red-400">*</span></label>
                      <input type="text" id="fullName" name="fullName" required value={formData.fullName} onChange={handleChange} className="w-full px-5 py-4 bg-black/50 border-2 border-gray-700 focus:border-purple-500 rounded-xl text-white placeholder-gray-500 focus:outline-none transition-colors" placeholder="הכנס את שמך המלא" />
                    </div>
                    <div>
                      <label htmlFor="stageName" className="block text-sm font-medium mb-2 text-gray-300">שם במה <span className="text-red-400">*</span></label>
                      <input type="text" id="stageName" name="stageName" required value={formData.stageName} onChange={handleChange} className="w-full px-5 py-4 bg-black/50 border-2 border-gray-700 focus:border-purple-500 rounded-xl text-white placeholder-gray-500 focus:outline-none transition-colors" placeholder="הכנס את שם הבמה שלך" />
                    </div>
                    <div>
                      <label htmlFor="age" className="block text-sm font-medium mb-2 text-gray-300">גיל <span className="text-red-400">*</span></label>
                      <input type="number" id="age" name="age" required min="16" max="99" value={formData.age} onChange={handleChange} className="w-full px-5 py-4 bg-black/50 border-2 border-gray-700 focus:border-purple-500 rounded-xl text-white placeholder-gray-500 focus:outline-none transition-colors" placeholder="הכנס את גילך" />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium mb-2 text-gray-300">מספר טלפון <span className="text-red-400">*</span></label>
                      <input type="tel" id="phone" name="phone" required value={formData.phone} onChange={handleChange} className="w-full px-5 py-4 bg-black/50 border-2 border-gray-700 focus:border-purple-500 rounded-xl text-white placeholder-gray-500 focus:outline-none transition-colors" placeholder="05X-XXXXXXX" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="experienceYears" className="block text-sm font-medium mb-2 text-gray-300">כמה זמן את/ה עושה מוזיקה? <span className="text-red-400">*</span></label>
                    <input type="text" id="experienceYears" name="experienceYears" required value={formData.experienceYears} onChange={handleChange} className="w-full px-5 py-4 bg-black/50 border-2 border-gray-700 focus:border-purple-500 rounded-xl text-white placeholder-gray-500 focus:outline-none transition-colors" placeholder="לדוגמה: 3 שנים, מ-2020" />
                  </div>
                  <div>
                    <label htmlFor="inspirations" className="block text-sm font-medium mb-2 text-gray-300">מי ההשראות שלך? (אופציונלי)</label>
                    <textarea id="inspirations" name="inspirations" value={formData.inspirations} onChange={handleChange} rows={3} className="w-full px-5 py-4 bg-black/50 border-2 border-gray-700 focus:border-purple-500 rounded-xl text-white placeholder-gray-500 focus:outline-none transition-colors resize-none" placeholder="ספר/י לנו על האמנים והסגנונות שמשפיעים עליך" />
                  </div>
                  <div>
                    <label htmlFor="trackLink" className="block text-sm font-medium mb-2 text-gray-300">לינק לטראק שאת/ה רוצה שנשמע <span className="text-red-400">*</span></label>
                    <input type="url" id="trackLink" name="trackLink" required value={formData.trackLink} onChange={handleChange} className="w-full px-5 py-4 bg-black/50 border-2 border-gray-700 focus:border-purple-500 rounded-xl text-white placeholder-gray-500 focus:outline-none transition-colors" placeholder="https://soundcloud.com/... או https://youtube.com/..." />
                    <p className="text-xs text-gray-500 mt-2">SoundCloud, YouTube, Spotify או כל פלטפורמה אחרת</p>
                  </div>
                  <button type="submit" disabled={formLoading} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-lg py-5 rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3">
                    {formLoading ? (<><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>שולח...</>) : (<>שלח מועמדות<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></>)}
                  </button>
                </form>
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-6"><FaCheck className="text-3xl text-white" /></div>
                  <h3 className="text-2xl font-bold text-white mb-2">המועמדות נשלחה בהצלחה! 🎉</h3>
                  <p className="text-gray-400">מבטיחים לשמוע את המוזיקה שלך ולחזור אליך בקרוב</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-6 relative">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-4xl mb-4 block">❓</span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4"><span className="bg-gradient-to-l from-purple-400 to-cyan-400 bg-clip-text text-transparent">שאלות נפוצות</span></h2>
            </div>
            <div className="space-y-4">
              {FAQ_ITEMS.map((item, index) => (
                <div key={index} className="glass-card rounded-xl border border-gray-800 overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === index ? null : index)} className="w-full px-6 py-5 flex items-center justify-between text-right hover:bg-white/5 transition-colors">
                    <span className="font-semibold text-white text-lg">{item.question}</span>
                    <FaChevronDown className={`text-purple-400 transition-transform duration-300 flex-shrink-0 mr-4 ${openFaq === index ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${openFaq === index ? 'max-h-96' : 'max-h-0'}`}>
                    <div className="px-6 pb-5 text-gray-300 leading-relaxed">{item.answer}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-6 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition duration-500" />
              <div className="relative glass-card rounded-3xl p-12 border border-gray-800">
                <div className="text-6xl mb-6">🚀</div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">מוכנים להתחיל את המסע?</h2>
                <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">אל תפספסו את ההזדמנות להיות חלק מהפרק הבא. הגישו מועמדות עכשיו!</p>
                <button onClick={scrollToForm} className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-lg py-4 px-10 rounded-2xl transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105">
                  להגשת מועמדות
                  <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-800 py-8">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
              <div>© 2025 יוצאים לטראק • כל הזכויות שמורות</div>
              <div className="flex gap-6">
                <Link href="/" className="hover:text-gray-300 transition">בית</Link>
                <Link href="/episodes" className="hover:text-gray-300 transition">פרקים</Link>
                <Link href="/featured-artists" className="hover:text-gray-300 transition">אמנים צעירים</Link>
                <Link href="/about" className="hover:text-gray-300 transition">אודות</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>

      <style jsx>{`
        .glass-card {
          background: rgba(15, 15, 35, 0.6);
          backdrop-filter: blur(10px);
        }
      `}</style>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const alumniIds = ['nardia', 'modulation', 'shaprut', 'tanoma'];

  try {
    const { data: artists, error } = await supabase
      .from('featured_artists')
      .select('id, artist_id, name, stage_name, bio, profile_photo_url, instagram_url, soundcloud_profile_url, spotify_url')
      .in('artist_id', alumniIds);

    if (error) {
      console.error('Error fetching alumni artists:', error);
      return { props: { alumniArtists: [] } };
    }

    const sortedArtists = alumniIds.map(id => artists?.find(a => a.artist_id === id)).filter(Boolean) as AlumniArtist[];
    return { props: { alumniArtists: sortedArtists } };
  } catch (err) {
    console.error('getServerSideProps error:', err);
    return { props: { alumniArtists: [] } };
  }
};

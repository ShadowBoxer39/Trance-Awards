// pages/young-artists.tsx - Landing Page for Artist Stage submissions
import Head from "next/head";
import Link from "next/link";
import React from "react";
import Navigation from "../components/Navigation";
import SEO from "@/components/SEO";
import { FaCheck, FaChevronDown } from "react-icons/fa";

const FAQ_ITEMS = [
  { question: "מי יכול להגיש מועמדות?", answer: "כל אמן/ית טראנס שמפיק/ה מוזיקה ורוצה לקבל במה. לא משנה כמה טראקים יש לכם בחוץ - אנחנו מחפשים פוטנציאל ואיכות." },
  { question: "איך תהליך הבחירה עובד?", answer: "אנחנו מאזינים לכל הטראקים שנשלחים, ובוחרים אמנים שהמוזיקה שלהם מדברת אלינו. אנחנו מחפשים מקוריות, איכות הפקה ופוטנציאל." },
  { question: "איך אדע אם התקבלתי?", answer: "ניצור איתכם קשר ישירות דרך הטלפון שתשאירו בטופס. אם לא שמעתם מאיתנו תוך מספר שבועות, אתם מוזמנים לשלוח לנו הודעה." },
  { question: "איפה מקליטים את הפרק?", answer: "ההקלטה מתבצעת באולפן מקצועי באזור המרכז. הפרטים המדויקים יימסרו לאמנים שייבחרו." },
  { question: "כמה אמנים משתתפים בכל פרק?", answer: "בדרך כלל אנחנו אמן אחד בכל פרק רגיל. המספר המדויק משתנה בהתאם לפורמט של הפרק." },
];

export default function YoungArtistsLanding() {
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
      <SEO title="במה לאמנים | יוצאים לטראק" description="אמנים צעירים? הגישו מועמדות והצטרפו לפרק של יוצאים לטראק. הבמה שלכם מחכה." url="https://www.tracktrip.co.il/young-artists" />
      <Head>
        <title>במה לאמנים | יוצאים לטראק</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/images/logo.png" />
      </Head>

      <div className="min-h-screen bg-black text-white">
        <Navigation currentPage="young-artists" />

        {/* Hero Section */}
        <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-black to-cyan-900/20" />
            <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[150px] animate-pulse" />
            <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-600/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center py-20">
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-purple-500/15 border border-purple-500/30 rounded-full text-purple-300 text-sm font-medium mb-8">
              <span className="text-lg">🎤</span>
              <span>הגשות פתוחות</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-l from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">במה לאמנים</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-4 font-light">הבמה שלכם מחכה.</p>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              אנחנו מחפשים אמני טראנס מוכשרים שרוצים לקבל במה בפרק  של יוצאים לטראק,
              שלחו לנו את המוזיקה שלכם ואולי נראה אתכם בפרק הבא
            </p>

            <button onClick={scrollToForm} className="group inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-lg py-4 px-10 rounded-2xl transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105">
              להגשת מועמדות
              <svg className="w-5 h-5 transform group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
            </button>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 px-6 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-950/10 to-black" />
          <div className="relative max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4"><span className="bg-gradient-to-l from-purple-400 to-cyan-400 bg-clip-text text-transparent">איך זה עובד?</span></h2>
              <p className="text-gray-400 text-lg">שני צעדים פשוטים וההרשמה שלכם תישלח אלינו</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="glass-card rounded-2xl p-8 text-center border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center mx-auto mb-5">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">שלחו מועמדות</h3>
                <p className="text-gray-400 leading-relaxed">מלאו את הטופס עם הפרטים שלכם ולינק למוזיקה שלכם</p>
              </div>

              <div className="glass-card rounded-2xl p-8 text-center border border-pink-500/20 hover:border-pink-500/40 transition-all duration-300">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-600 to-pink-800 flex items-center justify-center mx-auto mb-5">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">אנחנו מאזינים</h3>
                <p className="text-gray-400 leading-relaxed">הצוות שלנו מאזין לכל הגשה ובוחר את האמנים לפרק הבא</p>
              </div>

              <div className="glass-card rounded-2xl p-8 text-center border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-600 to-cyan-800 flex items-center justify-center mx-auto mb-5">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">עולים לאוויר</h3>
                <p className="text-gray-400 leading-relaxed">אם נבחרתם, ניצור איתכם קשר ונזמין אתכם לאולפן להקלטת פרק</p>
              </div>
            </div>
          </div>
        </section>

        {/* What You Get Section */}
        <section className="py-20 px-6 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-cyan-950/10 to-black" />
          <div className="relative max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4"><span className="bg-gradient-to-l from-cyan-400 to-purple-400 bg-clip-text text-transparent">מה מקבלים?</span></h2>
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
          <div className="relative max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-4xl mb-4 block">📝</span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4"><span className="bg-gradient-to-l from-purple-400 to-pink-400 bg-clip-text text-transparent">הגישו מועמדות</span></h2>
              <p className="text-gray-400 text-lg">ספרו לנו על עצמכם ושלחו לנו את המוזיקה שלכם</p>
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
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.37 0-4.567-.818-6.303-2.187l-.44-.362-3.091 1.036 1.036-3.091-.362-.44A9.953 9.953 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
                      הצטרפו לקהילה
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
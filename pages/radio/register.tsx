// pages/radio/register.tsx - Aesthetic Artist Landing Page with YouTube CTAs
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import Navigation from '@/components/Navigation';
import GoogleLoginButton from '@/components/GoogleLoginButton';
import { FaMicrophoneAlt, FaChevronDown, FaPlay, FaYoutube, FaCheckCircle, FaRocket, FaQuestionCircle, FaBell } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const YOUTUBE_SUBSCRIBE_URL = 'https://www.youtube.com/@tracktripil?sub_confirmation=1';

const FAQ_ITEMS = [
  {
    question: 'מי יכול להגיש מוזיקה?',
    answer: 'כל אמן/ית טראנס ישראלי/ת! לא משנה אם יש לך טראק אחד או עשרים, אנחנו רוצים לשמוע את היצירה שלך.',
  },
  {
    question: 'מה האיכות הנדרשת?',
    answer: 'קובץ MP3 איכותי (320kbps). חשוב מאוד שהקובץ יכיל Metadata (שם אמן, שם שיר ועטיפה) מוטמעים בתוכו.',
  },
  {
    question: 'כמה זמן לוקח עד שהטראק עולה לרדיו?',
    answer: 'אנחנו מאזינים לכל הגשה ומאשרים לפי מה שמתאים לרדיו. ברגע שהטראק מאושר, הוא נכנס לרוטציה מיד.',
  },
  {
    question: 'האם יש תשלום?',
    answer: 'ממש לא. הרדיו הוא פרויקט קהילתי ללא מטרות רווח. המטרה היא נטו חשיפה וקידום הסצנה הישראלית.',
  },
  {
    question: 'האם אני שומר על הזכויות?',
    answer: 'בוודאי. כל הזכויות נשארות שלך בלבד. אנחנו רק מקבלים ממך רשות לשדר את הטראק בשידורי הרדיו שלנו.',
  },
];

const FloatingNotes = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="absolute text-purple-500/10 animate-float-slow"
        style={{ left: `${15 + i * 15}%`, top: `${20 + (i % 3) * 25}%`, animationDelay: `${i * 0.8}s`, fontSize: `${24 + i * 8}px` }}
      > ♪ </div>
    ))}
  </div>
);

export default function RadioRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    if (!router.isReady) return;
    document.documentElement.setAttribute('dir', 'rtl');

    const checkUser = async () => {
      try {
        // Handle potential Google callback first
        const url = window.location.href;
        if (url.includes('code=') || url.includes('access_token=')) {
          await supabase.auth.exchangeCodeForSession(url);
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // If logged in, replace current history entry so "Back" doesn't loop
          router.replace('/radio/dashboard');
          return;
        }
        
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        router.replace('/radio/dashboard');
      }
      if (event === 'SIGNED_OUT') {
        setLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router.isReady]);

  const scrollToSignup = () => {
    document.getElementById('signup-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a12] text-white flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>הצטרפו לרדיו | יוצאים לטראק</title>
        <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <style jsx global>{`
        @keyframes float-slow { 0%, 100% { transform: translateY(0); opacity: 0.1; } 50% { transform: translateY(-30px); opacity: 0.2; } }
        @keyframes gradient-shift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 20px rgba(255, 0, 0, 0.3); } 50% { box-shadow: 0 0 40px rgba(255, 0, 0, 0.6); } }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-gradient { background-size: 200% 200%; animation: gradient-shift 8s ease infinite; }
        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        .glass-warm {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(59, 130, 246, 0.05) 50%, rgba(236, 72, 153, 0.08) 100%);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
      `}</style>

      <div className="min-h-screen bg-[#0a0a12] text-white font-['Rubik',sans-serif]">
        <Navigation />

        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-6">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] animate-gradient" />
            <FloatingNotes />
          </div>

          <div className="relative z-10 max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in">
              <HiSparkles className="text-purple-400" />
              <span className="text-xs font-medium tracking-wide uppercase">במה לאמני טראנס ישראלים</span>
            </div>

            <h1 className="text-5xl md:text-8xl font-black mb-8 leading-tight tracking-tighter">
              <span className="block text-white">הרדיו של</span>
              <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                יוצאים לטראק
              </span>
            </h1>

            <div className="flex flex-wrap items-center justify-center gap-6 mb-12">
               {['שידור 24/7', 'קרדיט מלא לאמן', '100% בחינם'].map((text, i) => (
                 <div key={i} className="flex items-center gap-2">
                   <FaCheckCircle className="text-green-500/80 text-sm" />
                   <span className="text-gray-300 font-medium">{text}</span>
                 </div>
               ))}
            </div>

            {/* Main CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <button onClick={scrollToSignup} className="w-full sm:w-auto group inline-flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-5 px-10 rounded-[2rem] transition-all shadow-xl shadow-purple-500/20 active:scale-95">
                <FaMicrophoneAlt />
                <span>הצטרפו עכשיו</span>
              </button>
              <Link href="/radio" className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 text-white font-bold py-5 px-10 rounded-[2rem] border border-white/10 transition-all">
                <FaPlay className="text-xs" />
                <span>האזינו לרדיו</span>
              </Link>
            </div>

            {/* YouTube Subscribe CTA - Secondary */}
            <a 
              href={YOUTUBE_SUBSCRIBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 text-gray-400 hover:text-white transition-all group"
            >
              <FaYoutube className="text-red-500 text-xl group-hover:scale-110 transition-transform" />
              <span className="text-sm">עקבו אחרינו ביוטיוב לשידורים חיים</span>
              <FaBell className="text-yellow-500 text-sm animate-bounce" />
            </a>
          </div>
        </section>

        {/* YouTube Promo Section - Enhanced */}
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="glass-warm rounded-[3rem] p-8 md:p-16 relative overflow-hidden border border-red-500/20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 blur-[80px]" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-600/10 blur-[80px]" />
              
              <div className="relative z-10">
                {/* Header */}
                <div className="text-center mb-10">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-600/20 mb-6 animate-pulse-glow">
                    <FaYoutube className="text-5xl text-red-500" />
                  </div>
                  <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">שידור חי 24/7 ביוטיוב</h2>
                  <p className="text-gray-400 text-lg leading-relaxed max-w-2xl mx-auto">
                    הטראקים שלכם משודרים עם <span className="text-white font-semibold">קרדיט מלא</span> וקישורים ישירים לסושיאל שלכם. 
                    <br className="hidden md:block" />
                    הירשמו לערוץ כדי לא לפספס!
                  </p>
                </div>

                {/* Video Preview */}
                <div className="aspect-video bg-black/60 rounded-3xl border border-white/10 flex items-center justify-center shadow-2xl mb-10 overflow-hidden relative group">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="relative text-center">
                    <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-red-600/30">
                      <FaPlay className="text-white text-2xl ml-1" />
                    </div>
                    <span className="text-gray-300 font-medium">השידור החי יעלה בקרוב</span>
                  </div>
                </div>

                {/* Subscribe Button - Main CTA */}
                <div className="text-center">
                  <a 
                    href={YOUTUBE_SUBSCRIBE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-4 bg-red-600 hover:bg-red-500 text-white font-bold py-5 px-12 rounded-full transition-all shadow-xl shadow-red-600/30 hover:shadow-red-500/40 active:scale-95 text-lg"
                  >
                    <FaYoutube className="text-2xl" />
                    <span>הירשמו לערוץ היוטיוב</span>
                    <FaBell className="text-lg" />
                  </a>
                  <p className="text-gray-500 text-sm mt-4">
                    🔔 הפעילו התראות כדי לדעת מתי הטראק שלכם בשידור
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section - NEW */}
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="glass-warm rounded-3xl p-8 text-center border border-purple-500/10 hover:border-purple-500/30 transition-all">
                <div className="text-4xl mb-4">🎵</div>
                <h3 className="text-xl font-bold text-white mb-2">רוטציה ברדיו</h3>
                <p className="text-gray-400 text-sm leading-relaxed">הטראקים שלכם משודרים 24/7 ברדיו עם אלפי מאזינים</p>
              </div>
              <div className="glass-warm rounded-3xl p-8 text-center border border-red-500/10 hover:border-red-500/30 transition-all">
                <div className="text-4xl mb-4">📺</div>
                <h3 className="text-xl font-bold text-white mb-2">חשיפה ביוטיוב</h3>
                <p className="text-gray-400 text-sm leading-relaxed">השם והלינקים שלכם מופיעים בשידור החי לכל הצופים</p>
              </div>
              <div className="glass-warm rounded-3xl p-8 text-center border border-cyan-500/10 hover:border-cyan-500/30 transition-all">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-xl font-bold text-white mb-2">קידום הקריירה</h3>
                <p className="text-gray-400 text-sm leading-relaxed">הצטרפו לקהילת האמנים שלנו וקבלו חשיפה לקהל חדש</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <FaQuestionCircle className="text-4xl text-purple-500 mx-auto mb-4" />
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">שאלות נפוצות</h2>
            </div>
            <div className="space-y-4">
              {FAQ_ITEMS.map((item, index) => (
                <div key={index} className="glass-warm rounded-3xl overflow-hidden border border-white/5">
                  <button onClick={() => setOpenFaq(openFaq === index ? null : index)} className="w-full px-8 py-6 flex items-center justify-between text-right hover:bg-white/5 transition-colors">
                    <span className="font-bold text-white">{item.question}</span>
                    <FaChevronDown className={`text-purple-400 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === index && <div className="px-8 pb-8 text-gray-400 leading-relaxed text-sm animate-fade-in">{item.answer}</div>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA with Signup */}
        <section id="signup-section" className="py-32 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="glass-warm rounded-[3rem] p-12 border border-purple-500/20 shadow-2xl shadow-purple-500/10">
              <FaRocket className="text-5xl text-purple-500 mx-auto mb-8 animate-bounce" />
              <h2 className="text-3xl md:text-4xl font-black mb-6">מוכנים לשיגור?</h2>
              <p className="text-gray-400 mb-10 text-lg">הצטרפו למשפחת "יוצאים לטראק" והתחילו לשדר היום</p>
              <div className="flex justify-center mb-6">
                <GoogleLoginButton />
              </div>
              <p className="text-[10px] text-gray-600">בלחיצה על התחברות אתם מאשרים את תנאי השימוש</p>
            </div>
          </div>
        </section>

        {/* Bottom YouTube CTA - For non-artists */}
        <section className="py-16 px-6 border-t border-white/5">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-gray-500 mb-6">עדיין לא מוכנים להגיש מוזיקה? אפשר בינתיים לעקוב 👇</p>
            <a 
              href={YOUTUBE_SUBSCRIBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 bg-white/5 hover:bg-red-600/20 border border-white/10 hover:border-red-500/30 text-white font-semibold py-4 px-8 rounded-full transition-all"
            >
              <FaYoutube className="text-red-500 text-xl" />
              <span>הירשמו לערוץ היוטיוב</span>
            </a>
          </div>
        </section>
      </div>
    </>
  );
}

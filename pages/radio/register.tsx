// pages/radio/register.tsx - Aesthetic Artist Landing Page
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import Navigation from '@/components/Navigation';
import GoogleLoginButton from '@/components/GoogleLoginButton';
import { FaMicrophoneAlt, FaChevronDown, FaPlay, FaYoutube, FaCheckCircle, FaRocket, FaQuestionCircle } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
    answer: 'אנחנו מאזינים לכל הגשה ומאשרים תוך 24-48 שעות. ברגע שהטראק מאושר, הוא נכנס לרוטציה מיד.',
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
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          router.push('/radio/dashboard');
          return;
        }
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };
    checkUser();
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
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-gradient { background-size: 200% 200%; animation: gradient-shift 8s ease infinite; }
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

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={scrollToSignup} className="w-full sm:w-auto group inline-flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-5 px-10 rounded-[2rem] transition-all shadow-xl shadow-purple-500/20 active:scale-95">
                <FaMicrophoneAlt />
                <span>הצטרפו עכשיו</span>
              </button>
              <Link href="/radio" className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 text-white font-bold py-5 px-10 rounded-[2rem] border border-white/10 transition-all">
                <FaPlay className="text-xs" />
                <span>האזינו לרדיו</span>
              </Link>
            </div>
          </div>
        </section>

        {/* YouTube Cross Promo */}
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="glass-warm rounded-[3rem] p-8 md:p-16 relative overflow-hidden border border-red-500/10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 blur-[80px]" />
              <div className="relative z-10 text-center">
                <FaYoutube className="text-6xl text-red-600 mx-auto mb-6" />
                <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">גם ביוטיוב לייב!</h2>
                <p className="text-gray-400 text-lg mb-10 leading-relaxed max-w-2xl mx-auto">
                  הרדיו משודר בשידור חי 24/7 גם ביוטיוב, עם תצוגת Now Playing מתקדמת וקישורים ישירים לסושיאל של האמנים.
                </p>
                <div className="aspect-video bg-black rounded-3xl border border-white/5 flex items-center justify-center shadow-2xl">
                   <div className="text-center">
                      <div className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaPlay className="text-red-600 ml-1" />
                      </div>
                      <span className="text-gray-500 font-medium">השידור החי יעלה בקרוב</span>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Three Steps */}
        <section className="py-24 px-6 bg-white/[0.02]">
          <div className="max-w-5xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">איך זה עובד?</h2>
            <p className="text-gray-400">הדרך המהירה ביותר להביא את המוזיקה שלך לאלפי אוזניים</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { step: '01', title: 'פרופיל אמן', desc: 'מתחברים עם Google וממלאים את פרטי האמן והסושיאל.' },
              { step: '02', title: 'הגשת טראק', desc: 'מעלים קובץ MP3 עם Metadata תקין ומוסיפים את הסיפור שמאחורי הטראק.' },
              { step: '03', title: 'שידור חי', desc: 'אחרי אישור מהיר, הטראק נכנס לרוטציה ומתחיל להתנגן ברחבי הרשת.' }
            ].map((s, i) => (
              <div key={i} className="glass-warm rounded-[2.5rem] p-10 relative group border border-white/5">
                <div className="text-4xl font-black text-white/10 absolute top-8 right-10 group-hover:text-purple-500/20 transition-colors">{s.step}</div>
                <h3 className="text-xl font-bold text-white mb-4">{s.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
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

        {/* Final CTA */}
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

        <footer className="border-t border-white/5 py-12 px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-gray-600">
             <div>© 2025 יוצאים לטראק • כל הזכויות שמורות</div>
             <div className="flex gap-8">
                <Link href="/" className="hover:text-white transition">בית</Link>
                <Link href="/radio" className="hover:text-white transition">רדיו</Link>
                <Link href="/episodes" className="hover:text-white transition">פודקאסט</Link>
             </div>
          </div>
        </footer>
      </div>
    </>
  );
}

// pages/radio/register.tsx - Landing Page for Radio Artist Registration
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import Navigation from '@/components/Navigation';
import GoogleLoginButton from '@/components/GoogleLoginButton';
import { 
  FaMicrophoneAlt, FaChevronDown, FaPlay, FaYoutube
} from 'react-icons/fa';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// FAQ items
const FAQ_ITEMS = [
  {
    question: 'מי יכול להגיש מוזיקה?',
    answer: 'כל אמן/ית טראנס ישראלי/ת! לא משנה אם יש לך טראק אחד או עשרים, אנחנו רוצים לשמוע את המוזיקה שלך.',
  },
  {
    question: 'כמה זמן לוקח עד שהטראק עולה לרדיו?',
    answer: 'אנחנו מאזינים לכל הגשה ומאשרים תוך 24-48 שעות. ברגע שהטראק מאושר, הוא נכנס לרוטציה מיד.',
  },
  {
    question: 'האם יש תשלום?',
    answer: 'לא! הרדיו הוא פרויקט קהילתי והכל בחינם. המטרה שלנו היא לתת במה לאמנים ישראלים.',
  },
  {
    question: 'מה הפורמט הנדרש?',
    answer: 'קובץ MP3 באיכות גבוהה (320kbps מומלץ), עד 20MB. אפשר גם להעלות תמונת עטיפה לטראק.',
  },
  {
    question: 'האם אני שומר על הזכויות?',
    answer: 'כמובן! כל הזכויות נשארות שלך. אנחנו רק מקבלים רשות לנגן את הטראק ברדיו.',
  },
];

export default function RadioRegisterPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    if (!router.isReady) return;
    document.documentElement.setAttribute('dir', 'rtl');

    const checkUser = async () => {
      try {
        const url = window.location.href;
        if (url.includes('code=') || url.includes('access_token=')) {
          await supabase.auth.exchangeCodeForSession(url);
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user ?? null;

        if (currentUser) {
          // User is logged in - check if they have a profile
          const { data: existingArtist } = await supabase
            .from('radio_artists')
            .select('id')
            .eq('user_id', currentUser.id)
            .maybeSingle();

          if (existingArtist) {
            // Has profile - redirect to dashboard
            window.location.href = '/radio/dashboard';
            return;
          } else {
            // No profile - redirect to dashboard to create one
            window.location.href = '/radio/dashboard';
            return;
          }
        }
        
        // No user logged in - show landing page
        setUser(null);
        setLoading(false);
      } catch (err) {
        console.error("CheckUser logic failed:", err);
        setLoading(false);
      }
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Redirect to dashboard on login
        window.location.href = '/radio/dashboard';
      }
      if (event === 'SIGNED_OUT') {
        setUser(null);
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
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-xl text-gray-400">טוען...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>הצטרפו לרדיו יוצאים לטראק | במה לאמנים ישראלים</title>
        <meta name="description" content="הרדיו של יוצאים לטראק - שלחו את המוזיקה שלכם והגיעו לאלפי מאזינים. שידור 24/7, קרדיט מלא לאמן, בחינם!" />
        <meta property="og:title" content="הצטרפו לרדיו יוצאים לטראק" />
        <meta property="og:description" content="במה לאמני טראנס ישראלים. שידור 24/7, קרדיט מלא, בחינם!" />
        <meta property="og:image" content="https://tracktrip.co.il/images/radio-og.jpg" />
      </Head>

      <div className="min-h-screen bg-black text-white overflow-hidden">
        <Navigation />

        {/* Hero Section */}
        <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-black to-cyan-900/30" />
            <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[150px] animate-pulse" />
            <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-600/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-pink-600/10 rounded-full blur-[200px] animate-pulse" style={{ animationDelay: '2s' }} />
          </div>

          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-purple-400/30 rounded-full animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${5 + Math.random() * 10}s`,
                }}
              />
            ))}
          </div>

          <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
            {/* Main Title */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight animate-fade-in-up">
              <span className="block text-white">הרדיו של</span>
              <span className="block bg-gradient-to-l from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                יוצאים לטראק
              </span>
            </h1>

            {/* Subtitle - emphasis on 24/7 and FREE */}
            <p className="text-xl md:text-2xl text-gray-300 mb-4 font-light animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              🎵 במה לאמני טראנס ישראלים 🎵
            </p>
            
            {/* Key selling points */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mb-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center gap-2 text-lg md:text-xl">
                <span className="text-green-400 font-bold">✓</span>
                <span className="text-white font-semibold">שידור 24/7</span>
              </div>
              <div className="flex items-center gap-2 text-lg md:text-xl">
                <span className="text-green-400 font-bold">✓</span>
                <span className="text-white font-semibold">קרדיט מלא לאמן</span>
              </div>
              <div className="flex items-center gap-2 text-lg md:text-xl">
                <span className="text-green-400 font-bold">✓</span>
                <span className="text-white font-semibold">בחינם לגמרי</span>
              </div>
            </div>

            <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              שלחו את המוזיקה שלכם והגיעו לאלפי מאזינים בישראל ובעולם
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <button
                onClick={scrollToSignup}
                className="group inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-lg py-4 px-10 rounded-2xl transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105"
              >
                <FaMicrophoneAlt className="text-xl" />
                הצטרפו עכשיו - בחינם
                <svg className="w-5 h-5 transform group-hover:translate-x-[-4px] transition-transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
              
              <Link
                href="/radio"
                className="inline-flex items-center gap-2 text-gray-300 hover:text-white font-medium py-4 px-6 rounded-2xl border border-gray-700 hover:border-gray-500 transition-all"
              >
                <FaPlay className="text-sm" />
                האזינו לרדיו
              </Link>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <FaChevronDown className="text-2xl text-purple-400/60" />
          </div>
        </section>

        {/* YouTube Section */}
        <section className="py-20 px-6 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-red-950/10 to-black" />
          
          <div className="relative max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-700 mb-6">
                <FaYoutube className="text-4xl text-white" />
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-l from-red-400 to-pink-400 bg-clip-text text-transparent">
                  גם ביוטיוב!
                </span>
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
                הרדיו משודר בשידור חי 24/7 גם ביוטיוב - עם קרדיט מלא לכל אמן שמתנגן
              </p>
            </div>

            {/* YouTube Embed Placeholder - Replace with actual embed when live */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition duration-500" />
              <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-2xl overflow-hidden border border-gray-800">
                <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                  {/* Placeholder - Replace with iframe when YouTube stream is live */}
                  <div className="text-center p-8">
                    <div className="w-24 h-24 rounded-full bg-red-600/20 flex items-center justify-center mx-auto mb-6 animate-pulse">
                      <FaYoutube className="text-5xl text-red-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">השידור החי בקרוב!</h3>
                    <p className="text-gray-400 mb-6">הרדיו יעלה ליוטיוב בקרוב מאוד</p>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                      <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-full">
                        <span className="text-red-400">🔴</span>
                        <span className="text-gray-300">24/7 Live</span>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-full">
                        <span className="text-purple-400">🎵</span>
                        <span className="text-gray-300">Now Playing Display</span>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-full">
                        <span className="text-cyan-400">👤</span>
                        <span className="text-gray-300">Artist Credits</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* 
                  When YouTube stream is live, replace the above div with:
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src="https://www.youtube.com/embed/live_stream?channel=YOUR_CHANNEL_ID" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  />
                  */}
                </div>
              </div>
            </div>

            <div className="text-center mt-8">
              <a 
                href="https://youtube.com/@tracktrip" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-red-400 hover:text-red-300 font-medium transition-colors"
              >
                <FaYoutube />
                עקבו אחרינו ביוטיוב
                <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 px-6 relative">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-4xl mb-4 block">🚀</span>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-l from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  איך זה עובד?
                </span>
              </h2>
              <p className="text-gray-400 text-lg">שלושה צעדים פשוטים ואתם באוויר</p>
            </div>

            <div className="space-y-6">
              {[
                { step: 1, title: 'צרו פרופיל אמן', description: 'התחברו עם Google ומלאו את הפרטים שלכם', color: 'purple' },
                { step: 2, title: 'העלו את המוזיקה', description: 'שלחו את הטראקים שלכם דרך הדשבורד האישי', color: 'pink' },
                { step: 3, title: 'אתם ברדיו!', description: 'אחרי אישור, הטראק נכנס לרוטציה ומתנגן 24/7', color: 'cyan' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-6 group">
                  <div className={`flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${
                    item.color === 'purple' ? 'from-purple-500/20 to-purple-600/20 border-purple-500/30' :
                    item.color === 'pink' ? 'from-pink-500/20 to-pink-600/20 border-pink-500/30' :
                    'from-cyan-500/20 to-cyan-600/20 border-cyan-500/30'
                  } border flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <span className="text-2xl font-black text-white">{item.step}</span>
                  </div>
                  <div className="flex-1 pt-2">
                    <h3 className="text-xl font-bold text-white mb-1">{item.title}</h3>
                    <p className="text-gray-400">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Signup Section */}
        <section id="signup-section" className="py-20 px-6 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-950/20 to-black" />
          
          <div className="relative max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-4xl mb-4 block">✨</span>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-l from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  הצטרפו עכשיו
                </span>
              </h2>
              <p className="text-gray-400 text-lg">
                התחברו עם Google ותתחילו לשדר
              </p>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition duration-500" />
              
              <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-2xl p-8 border border-gray-800">
                {/* Login prompt */}
                <div className="text-center py-8">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center mx-auto mb-6">
                    <FaMicrophoneAlt className="text-4xl text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">התחברו כדי להמשיך</h3>
                  <p className="text-gray-400 mb-8 max-w-sm mx-auto">
                    לחצו על הכפתור למטה כדי להתחבר עם חשבון Google שלכם
                  </p>
                  <div className="flex justify-center">
                    <GoogleLoginButton />
                  </div>
                  <p className="text-xs text-gray-600 mt-6">
                    בלחיצה על התחברות אתם מסכימים לתנאי השימוש
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-6 relative">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-4xl mb-4 block">❓</span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="bg-gradient-to-l from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  שאלות נפוצות
                </span>
              </h2>
            </div>

            <div className="space-y-4">
              {FAQ_ITEMS.map((item, index) => (
                <div key={index} className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-right hover:bg-white/5 transition-colors"
                  >
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
              
              <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-3xl p-12 border border-gray-800">
                <div className="text-6xl mb-6">🎧</div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  מוכנים להשמיע את המוזיקה שלכם?
                </h2>
                <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">
                  הצטרפו עכשיו - בחינם לגמרי!
                </p>
                <button
                  onClick={scrollToSignup}
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-lg py-4 px-10 rounded-2xl transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105"
                >
                  <FaMicrophoneAlt />
                  בואו נתחיל - בחינם
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
                <Link href="/radio" className="hover:text-gray-300 transition">רדיו</Link>
                <Link href="/episodes" className="hover:text-gray-300 transition">פרקים</Link>
                <Link href="/featured-artists" className="hover:text-gray-300 transition">אמנים</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-10px); }
          75% { transform: translateY(-30px) translateX(5px); }
        }
        
        @keyframes fade-in-up {
          from { 
            opacity: 0; 
            transform: translateY(30px);
          }
          to { 
            opacity: 1; 
            transform: translateY(0);
          }
        }
        
        .animate-float {
          animation: float 10s ease-in-out infinite;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
      `}</style>
    </>
  );
}

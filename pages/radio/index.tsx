// pages/radio/index.tsx - Radio Landing Page
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import Navigation from '@/components/Navigation';
import { FaHeadphones, FaMicrophoneAlt, FaMusic, FaUsers } from 'react-icons/fa';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RadioPage() {
  const [user, setUser] = useState<any>(null);
  const [hasArtistProfile, setHasArtistProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute('dir', 'rtl');
    
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Check if user has a radio artist profile
        // Using maybeSingle() instead of single() to avoid error when no row exists
        const { data: artist, error } = await supabase
          .from('radio_artists')
          .select('id')
          .eq('user_id', session.user.id)
          .maybeSingle();
        
        // Only set true if we got data without error
        setHasArtistProfile(!error && !!artist);
      }
      setLoading(false);
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data: artist, error } = await supabase
          .from('radio_artists')
          .select('id')
          .eq('user_id', session.user.id)
          .maybeSingle();
        
        setHasArtistProfile(!error && !!artist);
      } else {
        setHasArtistProfile(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <>
      <Head>
        <title>רדיו יוצאים לטראק | טראנס ישראלי 24/7</title>
        <meta name="description" content="רדיו טראנס ישראלי - האזינו למוזיקה הכי טובה מהסצנה הישראלית" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-[#050814] via-[#0a0a1f] to-black text-white">
        <Navigation />

        {/* Hero Section */}
        <section className="relative py-20 px-6 overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-cyan-500/15 rounded-full blur-[100px]" />
          </div>

          <div className="relative max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 rounded-full text-sm text-purple-300 mb-6">
              <FaHeadphones className="text-cyan-400" />
              <span>בקרוב</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black mb-6">
              <span className="bg-gradient-to-l from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                רדיו יוצאים לטראק
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
              טראנס ישראלי 24/7
              <br />
              <span className="text-gray-500">המוזיקה הכי טובה מהסצנה המקומית</span>
            </p>

            {/* Placeholder Player */}
            <div className="max-w-2xl mx-auto mb-12">
              <div className="bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl rounded-2xl p-8 border border-gray-800">
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center animate-pulse">
                    <FaMusic className="text-3xl" />
                  </div>
                </div>
                <p className="text-gray-400 mb-4">הרדיו יעלה לאוויר בקרוב!</p>
                <p className="text-sm text-gray-600">בינתיים, אמנים יכולים להירשם ולשלוח טראקים</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {loading ? (
                <div className="text-gray-500">טוען...</div>
              ) : hasArtistProfile ? (
                <Link
                  href="/radio/dashboard"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-purple-500/50 hover:scale-105"
                >
                  <FaMicrophoneAlt />
                  <span>לאזור האישי</span>
                </Link>
              ) : (
                <Link
                  href="/radio/register"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-purple-500/50 hover:scale-105"
                >
                  <FaMicrophoneAlt />
                  <span>הרשמה לאמנים</span>
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              למה להצטרף?
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl rounded-2xl p-8 border border-gray-800 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-600/20 to-purple-600/5 flex items-center justify-center">
                  <FaMusic className="text-2xl text-purple-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">חשיפה למוזיקה שלכם</h3>
                <p className="text-gray-400">הטראקים שלכם יתנגנו ברדיו ויגיעו לאלפי מאזינים</p>
              </div>

              <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl rounded-2xl p-8 border border-gray-800 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-600/20 to-cyan-600/5 flex items-center justify-center">
                  <FaUsers className="text-2xl text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">קהילה תומכת</h3>
                <p className="text-gray-400">הצטרפו לקהילת האמנים הצעירים של יוצאים לטראק</p>
              </div>

              <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl rounded-2xl p-8 border border-gray-800 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-600/20 to-pink-600/5 flex items-center justify-center">
                  <FaHeadphones className="text-2xl text-pink-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">פשוט ומהיר</h3>
                <p className="text-gray-400">תהליך הגשה פשוט - העלו טראק ואנחנו נעשה את השאר</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-800 py-8">
          <div className="max-w-6xl mx-auto px-6 text-center text-gray-500">
            <p>© 2025 יוצאים לטראק • רדיו טראנס ישראלי</p>
          </div>
        </footer>
      </div>
    </>
  );
}

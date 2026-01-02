// pages/radio/dashboard.tsx - Responsive Artist Dashboard
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js'; 
import Navigation from '@/components/Navigation';
import { FaMusic, FaPlus, FaClock, FaCheckCircle, FaTimesCircle, FaSignOutAlt, FaUser, FaHeadphones } from 'react-icons/fa';
import { HiSparkles, HiMusicNote } from 'react-icons/hi';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface RadioArtist {
  id: string;
  name: string;
  slug: string;
  email: string;
  instagram: string | null;
  soundcloud: string | null;
  image_url: string | null;
  bio: string | null;
  approved: boolean;
  created_at: string;
}

interface Submission {
  id: string;
  track_name: string;
  bpm: number | null;
  genre: string | null;
  status: 'pending' | 'approved' | 'declined';
  submitted_at: string;
  admin_notes: string | null;
  art_url: string | null;
}

const FloatingNotes = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute text-purple-500/10 animate-float-slow"
          style={{
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
            animationDelay: `${i * 0.8}s`,
            fontSize: `${24 + i * 8}px`,
          }}
        >
          ♪
        </div>
      ))}
    </div>
  );
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 6) return { text: 'לילה טוב', emoji: '🌙' };
  if (hour < 12) return { text: 'בוקר טוב', emoji: '☀️' };
  if (hour < 17) return { text: 'צהריים טובים', emoji: '🌤️' };
  if (hour < 21) return { text: 'ערב טוב', emoji: '🌅' };
  return { text: 'לילה טוב', emoji: '🌙' };
};

export default function RadioDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [artist, setArtist] = useState<RadioArtist | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  const greeting = getGreeting();

  useEffect(() => {
    document.documentElement.setAttribute('dir', 'rtl');

    const handleOAuthCallback = async () => {
      const url = window.location.href;
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const queryParams = new URLSearchParams(window.location.search);

      if (hashParams.get('access_token') || queryParams.get('code')) {
        await supabase.auth.exchangeCodeForSession(url);
        window.history.replaceState({}, document.title, '/radio/dashboard');
      }
    };

    const loadData = async () => {
      await handleOAuthCallback();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        router.push('/radio/register');
        return;
      }

      setUser(session.user);

      const { data: artistData, error: artistError } = await supabase
        .from('radio_artists')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (artistError || !artistData) {
        router.push('/radio/register');
        return;
      }

      setArtist(artistData);

      const { data: submissionsData } = await supabase
        .from('radio_submissions')
        .select('*')
        .eq('artist_id', artistData.id)
        .order('submitted_at', { ascending: false });

      setSubmissions(submissionsData || []);
      setLoading(false);

      if (router.query.welcome === '1') {
        setShowWelcome(true);
        setTimeout(() => setShowWelcome(false), 5000);
      }
    };

    loadData();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push('/radio/register');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

const handleLogout = async () => {
    try {
      // 1. Force the sign out and wait for it to complete
      await supabase.auth.signOut();
      
      // 2. Manually clear any leftover auth keys just in case (fixes mobile persistence)
      for (const key in localStorage) {
        if (key.includes('supabase.auth.token')) {
          localStorage.removeItem(key);
        }
      }
      
      // 3. HARD REDIRECT to the register page. 
      // This is much more reliable than router.push for clearing session state.
      window.location.href = '/radio/register';
    } catch (err) {
      console.error("Logout error:", err);
      window.location.href = '/radio/register';
    }
  };
  const approvedCount = submissions.filter(s => s.status === 'approved').length;
  const pendingCount = submissions.filter(s => s.status === 'pending').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a12] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-500/30 rounded-full" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" />
          </div>
          <div className="text-lg text-purple-300/80 font-light text-center px-4">טוען את הסטודיו שלך...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>הסטודיו שלי | רדיו יוצאים לטראק</title>
        <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <style jsx global>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.1; }
          50% { transform: translateY(-30px) rotate(10deg); opacity: 0.2; }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-shimmer { background-size: 200% auto; animation: shimmer 3s linear infinite; }
        .animate-gradient { background-size: 200% 200%; animation: gradient-shift 8s ease infinite; }
        .glass-warm {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(59, 130, 246, 0.05) 50%, rgba(236, 72, 153, 0.08) 100%);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .card-hover { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 20px 40px -15px rgba(139, 92, 246, 0.3); }
      `}</style>

      <div className="min-h-screen bg-[#0a0a12] text-white font-['Rubik',sans-serif]">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] animate-gradient" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-gradient" style={{ animationDelay: '2s' }} />
          <FloatingNotes />
        </div>

        <Navigation />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
          {showWelcome && (
            <div className="mb-8 glass-warm rounded-3xl p-6 text-center border border-green-500/20 animate-fade-in">
              <div className="text-4xl mb-3">🎉</div>
              <h2 className="text-xl font-semibold text-green-400 mb-2">ברוכים הבאים למשפחה!</h2>
              <p className="text-gray-400">הפרופיל נוצר בהצלחה. הסטודיו שלך מוכן!</p>
            </div>
          )}

          {/* Header */}
          <div className="mb-8 sm:mb-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="relative flex-shrink-0">
                  {artist?.approved && (
                    <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full opacity-60 blur-sm" />
                  )}
                  <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 ${
                    artist?.approved ? 'border-green-500/50' : 'border-yellow-500/50'
                  }`}>
                    {artist?.image_url ? (
                      <img src={artist.image_url} alt={artist.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                        <span className="text-2xl font-bold">{artist?.name?.charAt(0) || '?'}</span>
                      </div>
                    )}
                  </div>
                  <div className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-[#0a0a12] flex items-center justify-center text-[10px] ${
                    artist?.approved ? 'bg-green-500' : 'bg-yellow-500'
                  }`}>
                    {artist?.approved ? '✓' : '⏳'}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 text-gray-400 text-xs sm:text-sm mb-1">
                    <span>{greeting.emoji}</span>
                    <span>{greeting.text}</span>
                  </div>
                  <h1 className="text-xl sm:text-3xl font-bold text-white truncate max-w-[200px] sm:max-w-none">
                    {artist?.name}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                    {artist?.approved ? (
                      <span className="text-green-400/80">פרופיל מאושר • מוכן לשדר</span>
                    ) : (
                      <span className="text-yellow-400/80">ממתין לאישור הפרופיל</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 sm:gap-3">
                <Link
                  href="/radio/submit"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium py-3 px-4 sm:px-6 rounded-2xl transition-all shadow-lg shadow-purple-500/20"
                >
                  <HiSparkles className="text-lg" />
                  <span className="whitespace-nowrap">העלה טראק</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-medium py-3 px-4 sm:px-5 rounded-2xl transition-all border border-white/5"
                >
                  <FaSignOutAlt className="text-sm" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-10">
            <div className="glass-warm rounded-2xl p-4 sm:p-5 card-hover flex sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <FaMusic className="text-purple-400" />
              </div>
              <div className="flex-1 sm:flex-none text-right sm:text-left">
                <div className="text-2xl sm:text-3xl font-bold text-white leading-none mb-1">{submissions.length}</div>
                <div className="text-xs sm:text-sm text-gray-400">טראקים שהוגשו</div>
              </div>
            </div>
            
            <div className="glass-warm rounded-2xl p-4 sm:p-5 card-hover flex sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <FaHeadphones className="text-green-400" />
              </div>
              <div className="flex-1 sm:flex-none text-right sm:text-left">
                <div className="text-2xl sm:text-3xl font-bold text-white leading-none mb-1">{approvedCount}</div>
                <div className="text-xs sm:text-sm text-gray-400">משודרים ברדיו</div>
              </div>
            </div>
            
            <div className="glass-warm rounded-2xl p-4 sm:p-5 card-hover flex sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                <FaClock className="text-yellow-400" />
              </div>
              <div className="flex-1 sm:flex-none text-right sm:text-left">
                <div className="text-2xl sm:text-3xl font-bold text-white leading-none mb-1">{pendingCount}</div>
                <div className="text-xs sm:text-sm text-gray-400">בהמתנה</div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="glass-warm rounded-3xl p-5 sm:p-8">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <HiMusicNote className="text-xl text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-white">הטראקים שלי</h2>
                  <p className="text-xs sm:text-sm text-gray-500">המוזיקה שהגשת לרדיו</p>
                </div>
              </div>
              
              {submissions.length > 0 && (
                <Link href="/radio/submit" className="text-xs sm:text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1">
                  <FaPlus className="text-[10px]" />
                  <span>הוסף עוד</span>
                </Link>
              )}
            </div>

            {submissions.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-2xl opacity-30 animate-pulse" />
                  <div className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/20 flex items-center justify-center text-3xl sm:text-4xl">
                    <FaMusic className="text-purple-400" />
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-white mb-2">הסטודיו ריק...</h3>
                <p className="text-sm sm:text-base text-gray-400 mb-8 max-w-sm mx-auto leading-relaxed">
                  עדיין לא העלית טראקים. זה הזמן להשמיע את המוזיקה שלך לעולם! 🎵
                </p>
                <Link
                  href="/radio/submit"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-2xl transition-all shadow-lg shadow-purple-500/25"
                >
                  <HiSparkles className="text-lg sm:text-xl" />
                  העלה את הטראק הראשון
                </Link>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {submissions.map((submission, index) => (
                  <div
                    key={submission.id}
                    className="group relative bg-white/[0.02] hover:bg-white/[0.05] rounded-2xl p-4 sm:p-5 border border-white/5 hover:border-purple-500/20 transition-all duration-300"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      {/* Artwork */}
                      <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden flex-shrink-0">
                        {submission.art_url ? (
                          <img src={submission.art_url} alt={submission.track_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-600/30 to-pink-600/30 flex items-center justify-center text-purple-400/60">
                            <FaMusic />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                           <span className="text-white text-[10px]">▶</span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base font-medium text-white truncate group-hover:text-purple-300 transition-colors">
                          {submission.track_name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-[10px] sm:text-sm text-gray-500">
                          {submission.bpm && (
                            <span className="flex items-center gap-0.5">
                              <span className="text-purple-400/60">♪</span> {submission.bpm}
                            </span>
                          )}
                          {submission.genre && (
                            <span className="px-1.5 py-0.5 rounded-full bg-white/5 text-[9px] sm:text-xs">
                              {submission.genre}
                            </span>
                          )}
                          <span className="text-gray-600">
                            {new Date(submission.submitted_at).toLocaleDateString('he-IL')}
                          </span>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="flex-shrink-0 flex items-center">
                        {submission.status === 'approved' && (
                          <div className="flex items-center gap-1.5 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full bg-green-500/10 border border-green-500/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] sm:text-sm text-green-400 font-medium">אושר</span>
                          </div>
                        )}
                        {submission.status === 'pending' && (
                          <div className="flex items-center gap-1.5 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                            <span className="text-[10px] sm:text-sm text-yellow-400 font-medium">ממתין</span>
                          </div>
                        )}
                        {submission.status === 'declined' && (
                          <div className="flex items-center gap-1.5 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full bg-red-500/10 border border-red-500/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            <span className="text-[10px] sm:text-sm text-red-400 font-medium">נדחה</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {submission.status === 'declined' && submission.admin_notes && (
                      <div className="mt-3 pt-3 border-t border-white/5">
                        <p className="text-[11px] sm:text-sm text-red-400/80 flex items-start gap-2">
                          <span className="mt-0.5 flex-shrink-0">💬</span>
                          <span>{submission.admin_notes}</span>
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600 text-xs sm:text-sm">
              🎧 המוזיקה שלך מגיעה לאוזניים חדשות כל יום
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// pages/radio/dashboard.tsx - Artist Dashboard
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import Navigation from '@/components/Navigation';
import { getGoogleUserInfo } from '@/lib/googleAuthHelpers';
import { FaMusic, FaPlus, FaClock, FaCheckCircle, FaTimesCircle, FaSignOutAlt, FaUser } from 'react-icons/fa';

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
}

export default function RadioDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [artist, setArtist] = useState<RadioArtist | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

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

      // Fetch artist profile
      const { data: artistData, error: artistError } = await supabase
        .from('radio_artists')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (artistError || !artistData) {
        // No artist profile, redirect to register
        router.push('/radio/register');
        return;
      }

      setArtist(artistData);

      // Fetch submissions
      const { data: submissionsData } = await supabase
        .from('radio_submissions')
        .select('*')
        .eq('artist_id', artistData.id)
        .order('submitted_at', { ascending: false });

      setSubmissions(submissionsData || []);
      setLoading(false);

      // Show welcome message if new registration
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
    await supabase.auth.signOut();
    router.push('/radio');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm">
            <FaCheckCircle />
            אושר
          </span>
        );
      case 'declined':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-sm">
            <FaTimesCircle />
            נדחה
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-sm">
            <FaClock />
            ממתין לאישור
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">טוען...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>האזור האישי | רדיו יוצאים לטראק</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-[#050814] via-[#0a0a1f] to-black text-white">
        <Navigation />

        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Welcome Message */}
          {showWelcome && (
            <div className="mb-8 bg-gradient-to-r from-green-500/20 to-cyan-500/20 border border-green-500/30 rounded-2xl p-6 text-center animate-pulse">
              <div className="text-3xl mb-2">🎉</div>
              <h2 className="text-xl font-bold text-green-400">ברוכים הבאים!</h2>
              <p className="text-gray-300">הפרופיל נוצר בהצלחה. עכשיו אפשר להגיש טראקים!</p>
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-12">
            <div className="flex items-center gap-4">
              {artist?.image_url ? (
                <img
                  src={artist.image_url}
                  alt={artist.name}
                  className="w-16 h-16 rounded-full border-2 border-purple-500"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center">
                  <FaUser className="text-2xl" />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold">{artist?.name}</h1>
                <p className="text-gray-400">
                  {artist?.approved ? (
                    <span className="text-green-400">✓ פרופיל מאושר</span>
                  ) : (
                    <span className="text-yellow-400">⏳ ממתין לאישור</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                href="/radio/submit"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold py-3 px-6 rounded-xl transition-all"
              >
                <FaPlus />
                הגש טראק
              </Link>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-xl transition-all"
              >
                <FaSignOutAlt />
                התנתק
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-800">
              <div className="text-3xl font-bold text-purple-400 mb-2">{submissions.length}</div>
              <div className="text-gray-400">טראקים שהוגשו</div>
            </div>
            <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-800">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {submissions.filter(s => s.status === 'approved').length}
              </div>
              <div className="text-gray-400">טראקים שאושרו</div>
            </div>
            <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-800">
              <div className="text-3xl font-bold text-yellow-400 mb-2">
                {submissions.filter(s => s.status === 'pending').length}
              </div>
              <div className="text-gray-400">ממתינים לאישור</div>
            </div>
          </div>

          {/* Submissions List */}
          <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl rounded-2xl p-8 border border-gray-800">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <FaMusic className="text-purple-400" />
              הטראקים שלי
            </h2>

            {submissions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">🎵</div>
                <h3 className="text-xl font-bold mb-2">עדיין אין טראקים</h3>
                <p className="text-gray-400 mb-6">הגישו את הטראק הראשון שלכם!</p>
                <Link
                  href="/radio/submit"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold py-3 px-6 rounded-xl transition-all"
                >
                  <FaPlus />
                  הגש טראק
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="bg-black/30 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1">{submission.track_name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          {submission.bpm && <span>{submission.bpm} BPM</span>}
                          {submission.genre && <span>{submission.genre}</span>}
                          <span>
                            {new Date(submission.submitted_at).toLocaleDateString('he-IL')}
                          </span>
                        </div>
                        {submission.admin_notes && submission.status === 'declined' && (
                          <p className="mt-2 text-sm text-red-400">
                            הערה: {submission.admin_notes}
                          </p>
                        )}
                      </div>
                      <div>
                        {getStatusBadge(submission.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

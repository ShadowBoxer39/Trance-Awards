// pages/radio/register.tsx - Artist Registration Page
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import Navigation from '@/components/Navigation';
import GoogleLoginButton from '@/components/GoogleLoginButton';
import { getGoogleUserInfo } from '@/lib/googleAuthHelpers';
import { FaMicrophoneAlt, FaInstagram, FaUser, FaEnvelope } from 'react-icons/fa';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RadioRegisterPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    instagram: '',
    bio: '',
  });

  useEffect(() => {
    document.documentElement.setAttribute('dir', 'rtl');

    const handleOAuthCallback = async () => {
      const url = window.location.href;
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const queryParams = new URLSearchParams(window.location.search);

      if (hashParams.get('access_token') || queryParams.get('code')) {
        await supabase.auth.exchangeCodeForSession(url);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    const checkUser = async () => {
      await handleOAuthCallback();
      
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        // Check if already has artist profile
        const { data: existingArtist } = await supabase
          .from('radio_artists')
          .select('id')
          .eq('user_id', currentUser.id)
          .single();

        if (existingArtist) {
          // Already registered, redirect to dashboard
          router.push('/radio/dashboard');
          return;
        }

        // Pre-fill form with Google info
        const userInfo = getGoogleUserInfo(currentUser);
        if (userInfo) {
          setFormData(prev => ({
            ...prev,
            name: userInfo.name || '',
          }));
        }
      }

      setLoading(false);
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        const { data: existingArtist } = await supabase
          .from('radio_artists')
          .select('id')
          .eq('user_id', currentUser.id)
          .single();

        if (existingArtist) {
          router.push('/radio/dashboard');
          return;
        }

        const userInfo = getGoogleUserInfo(currentUser);
        if (userInfo) {
          setFormData(prev => ({
            ...prev,
            name: prev.name || userInfo.name || '',
          }));
        }
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    setError('');

    try {
      const userInfo = getGoogleUserInfo(user);
      const slug = generateSlug(formData.name);

      // Check if slug is unique
      const { data: existingSlug } = await supabase
        .from('radio_artists')
        .select('id')
        .eq('slug', slug)
        .single();

      if (existingSlug) {
        setError('השם הזה כבר תפוס, נסה שם אחר');
        setSubmitting(false);
        return;
      }

      const { error: insertError } = await supabase
        .from('radio_artists')
        .insert({
          user_id: user.id,
          name: formData.name.trim(),
          slug: slug,
          email: userInfo?.email || user.email,
          instagram: formData.instagram.trim() || null,
          image_url: userInfo?.photoUrl || null,
          bio: formData.bio.trim() || null,
          approved: false,
        });

      if (insertError) {
        console.error('Insert error:', insertError);
        if (insertError.code === '23505') {
          setError('כבר יש לך פרופיל אמן');
        } else {
          setError('שגיאה ביצירת הפרופיל: ' + insertError.message);
        }
        setSubmitting(false);
        return;
      }

      // Success - redirect to dashboard
      router.push('/radio/dashboard?welcome=1');

    } catch (err: any) {
      console.error('Error:', err);
      setError('שגיאה בשרת');
      setSubmitting(false);
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
        <title>הרשמה לרדיו | יוצאים לטראק</title>
        <meta name="description" content="הרשמה לאמנים - שלחו את המוזיקה שלכם לרדיו יוצאים לטראק" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-[#050814] via-[#0a0a1f] to-black text-white">
        <Navigation />

        <div className="max-w-2xl mx-auto px-6 py-16">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-cyan-600 mb-6">
              <FaMicrophoneAlt className="text-3xl" />
            </div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              הרשמה לרדיו
            </h1>
            <p className="text-gray-400">
              צרו פרופיל אמן ושלחו את המוזיקה שלכם לרדיו
            </p>
          </div>

          {/* Not logged in */}
          {!user ? (
            <div className="bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl rounded-2xl p-8 border border-gray-800 text-center">
              <div className="text-5xl mb-6">🔐</div>
              <h2 className="text-2xl font-bold mb-4">התחברו כדי להמשיך</h2>
              <p className="text-gray-400 mb-8">
                התחברו עם Google כדי ליצור פרופיל אמן
              </p>
              <div className="flex justify-center">
                <GoogleLoginButton />
              </div>
            </div>
          ) : (
            /* Registration Form */
            <div className="bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl rounded-2xl p-8 border border-gray-800">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error message */}
                {error && (
                  <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-300 text-center">
                    {error}
                  </div>
                )}

                {/* Artist Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <FaUser className="inline ml-2" />
                    שם אמן (באנגלית) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Artist Name"
                    className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-xl focus:border-purple-500 focus:outline-none text-white placeholder-gray-500"
                    dir="ltr"
                  />
                  <p className="text-xs text-gray-500 mt-1">השם שיופיע ברדיו</p>
                </div>

                {/* Instagram */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <FaInstagram className="inline ml-2" />
                    אינסטגרם (אופציונלי)
                  </label>
                  <input
                    type="text"
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    placeholder="@username"
                    className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-xl focus:border-purple-500 focus:outline-none text-white placeholder-gray-500"
                    dir="ltr"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    קצת על עצמך (אופציונלי)
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="ספרו לנו קצת על המוזיקה שלכם..."
                    rows={3}
                    maxLength={500}
                    className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-xl focus:border-purple-500 focus:outline-none text-white placeholder-gray-500 resize-none"
                  />
                </div>

                {/* Email (readonly, from Google) */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <FaEnvelope className="inline ml-2" />
                    אימייל
                  </label>
                  <input
                    type="email"
                    value={user.email || ''}
                    disabled
                    className="w-full px-4 py-3 bg-black/30 border border-gray-800 rounded-xl text-gray-500 cursor-not-allowed"
                    dir="ltr"
                  />
                  <p className="text-xs text-gray-500 mt-1">נלקח מחשבון Google שלך</p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting || !formData.name.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold py-4 px-8 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'יוצר פרופיל...' : 'צור פרופיל אמן'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

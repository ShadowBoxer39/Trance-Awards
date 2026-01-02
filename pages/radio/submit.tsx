// pages/radio/submit.tsx - Aesthetic Track Submission Form
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import Navigation from '@/components/Navigation'; 
import { FaMusic, FaCloudUploadAlt, FaArrowRight, FaCheckCircle, FaChevronDown, FaChevronUp, FaInfoCircle } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const GENRES = ['Progressive', 'Full-On', 'Goa', 'Dark / Forest', 'Psytrance', 'Uplifting', 'Tech Trance', 'אחר'];

// Floating music notes animation (Matches Dashboard)
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

export default function RadioSubmitPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [artistId, setArtistId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  // Consent state
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  // Form state
  const [formData, setFormData] = useState({ trackName: '', bpm: '', genre: '' });
  const [mp3File, setMp3File] = useState<File | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute('dir', 'rtl');

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push('/radio/register');
        return;
      }
      setUser(session.user);

      const { data: artist } = await supabase
        .from('radio_artists')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (!artist) {
        router.push('/radio/register');
        return;
      }
      setArtistId(artist.id);
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleMp3Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('audio/mpeg') && !file.name.endsWith('.mp3')) {
      setError('יש להעלות קובץ MP3 בלבד');
      return;
    }

    if (file.size > 30 * 1024 * 1024) {
      setError('הקובץ גדול מדי. מקסימום 30MB');
      return;
    }

    setMp3File(file);
    setError('');

    if (!formData.trackName) {
      const nameWithoutExt = file.name.replace(/\.mp3$/i, '');
      setFormData(prev => ({ ...prev, trackName: nameWithoutExt }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artistId || !mp3File || !agreedToTerms) return;

    setSubmitting(true);
    setError('');

    try {
      const timestamp = Date.now();
      const safeName = formData.trackName.replace(/[^a-zA-Z0-9]/g, '_');
      const mp3FileName = `${artistId}/${timestamp}_${safeName}.mp3`;

      setUploadProgress(20);
      const { error: mp3Error } = await supabase.storage
        .from('Radio')
        .upload(mp3FileName, mp3File);

      if (mp3Error) throw mp3Error;

      setUploadProgress(70);
      const { data: mp3UrlData } = supabase.storage.from('Radio').getPublicUrl(mp3FileName);

      const { error: insertError } = await supabase
        .from('radio_submissions')
        .insert({
          artist_id: artistId,
          track_name: formData.trackName.trim(),
          bpm: formData.bpm ? parseInt(formData.bpm) : null,
          genre: formData.genre || null,
          mp3_url: mp3UrlData.publicUrl,
          status: 'pending',
          agreed_to_terms: true,
          agreed_at: new Date().toISOString(),
        });

      if (insertError) throw insertError;

      setUploadProgress(100);
      setSuccess(true);
      setTimeout(() => router.push('/radio/dashboard'), 2500);

    } catch (err: any) {
      setError('שגיאה בשליחת הטראק. נסה שנית.');
      setSubmitting(false);
    }
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
        <title>הגשת טראק | רדיו יוצאים לטראק</title>
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
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] animate-gradient" />
          <FloatingNotes />
        </div>

        <Navigation />

        <div className="relative max-w-2xl mx-auto px-6 py-12">
          <Link href="/radio/dashboard" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-8 transition-colors">
            <FaArrowRight /> <span>חזרה לסטודיו</span>
          </Link>

          <div className="text-center mb-10">
             <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-600 to-pink-600 mb-6 shadow-lg shadow-purple-500/20">
              <FaMusic className="text-3xl text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-white">הגשת טראק</h1>
            <p className="text-gray-400">המוזיקה שלך בדרך לאלפי מאזינים</p>
          </div>

          <div className="glass-warm rounded-3xl p-6 sm:p-8 shadow-2xl">
            {success ? (
              <div className="text-center py-10 animate-fade-in">
                <div className="text-6xl mb-6">✨</div>
                <h2 className="text-2xl font-bold text-green-400 mb-4">הטראק התקבל!</h2>
                <p className="text-gray-400">מעביר אותך חזרה לסטודיו...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-400 text-center text-sm">{error}</div>}

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex items-start gap-3">
                  <FaInfoCircle className="text-blue-400 mt-1 flex-shrink-0" />
                  <p className="text-xs text-blue-300 leading-relaxed">
                    <strong>טיפ:</strong> וודאו שקובץ ה-MP3 כולל "Metadata" תקין (שם אמן, שם שיר ותמונת עטיפה). זה מה שיוצג למאזינים ברדיו.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2 mr-1">שם הטראק (באנגלית) *</label>
                  <input
                    type="text" required value={formData.trackName}
                    onChange={(e) => setFormData({ ...formData, trackName: e.target.value })}
                    className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-purple-500/50 focus:outline-none text-white"
                    dir="ltr"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2 mr-1">BPM</label>
                    <input
                      type="number" value={formData.bpm}
                      onChange={(e) => setFormData({ ...formData, bpm: e.target.value })}
                      placeholder="145"
                      className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-purple-500/50 focus:outline-none text-white"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2 mr-1">ז׳אנר</label>
                    <select
                      value={formData.genre}
                      onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                      className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-purple-500/50 focus:outline-none text-white appearance-none"
                    >
                      <option value="">בחר ז׳אנר</option>
                      {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2 mr-1">קובץ MP3 *</label>
                  <input type="file" accept="audio/*,.mp3" onChange={handleMp3Change} className="hidden" id="mp3-upload" />
                  <label htmlFor="mp3-upload" className={`flex flex-col items-center justify-center gap-3 w-full p-8 border-2 border-dashed rounded-3xl cursor-pointer transition-all ${
                    mp3File ? 'border-green-500/50 bg-green-500/5' : 'border-white/10 hover:border-purple-500/40 bg-white/5'
                  }`}>
                    {mp3File ? (
                      <><FaCheckCircle className="text-green-500 text-2xl" /><span className="text-green-400 text-sm truncate max-w-xs">{mp3File.name}</span></>
                    ) : (
                      <><FaCloudUploadAlt className="text-gray-500 text-3xl" /><span className="text-gray-400 text-sm">לחץ לבחירת קובץ (עד 30MB)</span></>
                    )}
                  </label>
                </div>

                <div className="border border-white/5 rounded-2xl overflow-hidden bg-white/5">
                  <button type="button" onClick={() => setShowTerms(!showTerms)} className="w-full flex items-center justify-between px-4 py-4 hover:bg-white/5 transition-colors">
                    <span className="text-sm text-gray-300">תנאי שימוש והצהרת זכויות</span>
                    {showTerms ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
                  </button>
                  {showTerms && (
                    <div className="px-4 pb-4 text-[11px] text-gray-500 space-y-2 border-t border-white/5 pt-4 leading-relaxed">
                      <p>1. אני מצהיר/ה שאני בעל/ת הזכויות המלאות על הטראק המוגש.</p>
                      <p>2. אני מעניק/ה לרדיו רישיון לא-בלעדי לשידור הטראק בפלטפורמות השונות של "יוצאים לטראק".</p>
                      <p>3. ידוע לי שהשמעת הטראק היא ללא תמורה כספית ומטרתה קידום וחשיפה.</p>
                    </div>
                  )}
                  <div className="px-4 py-4 bg-purple-500/5 border-t border-white/5">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="w-5 h-5 rounded border-white/10 bg-white/5 text-purple-600 focus:ring-purple-500" />
                      <span className="text-xs text-gray-300">אני מאשר/ת את תנאי השימוש ומצהיר/ה על בעלות הזכויות *</span>
                    </label>
                  </div>
                </div>

                {submitting && (
                  <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 h-full transition-all duration-500" style={{ width: `${uploadProgress}%` }} />
                  </div>
                )}

                <button
                  type="submit" disabled={submitting || !mp3File || !agreedToTerms}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 px-8 rounded-2xl transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-purple-500/20"
                >
                  {submitting ? <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> <span>מעלה...</span></> : <><HiSparkles className="text-xl" /> <span>שלח טראק לרדיו</span></>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

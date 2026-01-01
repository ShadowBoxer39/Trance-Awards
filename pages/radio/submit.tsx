// pages/radio/submit.tsx - Track Submission Form
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import Navigation from '@/components/Navigation';
import { FaMusic, FaCloudUploadAlt, FaArrowRight, FaCheckCircle } from 'react-icons/fa';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const GENRES = [
  'Progressive',
  'Full-On',
  'Goa',
  'Dark / Forest',
  'Psytrance',
  'Uplifting',
  'Tech Trance',
  'אחר'
];

export default function RadioSubmitPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [artistId, setArtistId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    trackName: '',
    bpm: '',
    genre: '',
    downloadLink: '', // External download link (SoundCloud, Google Drive, etc.)
  });

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

      // Check if has artist profile
      const { data: artist } = await supabase
        .from('radio_artists')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (!artist) {
        router.push('/radio/register');
        return;
      }

      setArtistId(artist.id);
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.includes('audio/mpeg') && !file.name.endsWith('.mp3')) {
      setError('יש להעלות קובץ MP3 בלבד');
      return;
    }

    // Validate file size (20MB max)
    if (file.size > 20 * 1024 * 1024) {
      setError('הקובץ גדול מדי. מקסימום 20MB');
      return;
    }

    setMp3File(file);
    setError('');

    // Auto-fill track name from filename
    if (!formData.trackName) {
      const nameWithoutExt = file.name.replace(/\.mp3$/i, '');
      setFormData(prev => ({ ...prev, trackName: nameWithoutExt }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artistId) return;

    // Require either file upload OR download link
    if (!mp3File && !formData.downloadLink.trim()) {
      setError('יש להעלות קובץ MP3 או לספק קישור להורדה');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      let mp3Url = formData.downloadLink.trim();

      // Upload file if provided
      if (mp3File) {
        setUploadProgress(10);
        
        const fileExt = 'mp3';
        const fileName = `${artistId}/${Date.now()}_${formData.trackName.replace(/[^a-zA-Z0-9]/g, '_')}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('radio')
          .upload(fileName, mp3File, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          setError('שגיאה בהעלאת הקובץ: ' + uploadError.message);
          setSubmitting(false);
          return;
        }

        setUploadProgress(70);

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('radio')
          .getPublicUrl(fileName);

        mp3Url = urlData.publicUrl;
      }

      setUploadProgress(80);

      // Create submission record
      const { error: insertError } = await supabase
        .from('radio_submissions')
        .insert({
          artist_id: artistId,
          track_name: formData.trackName.trim(),
          bpm: formData.bpm ? parseInt(formData.bpm) : null,
          genre: formData.genre || null,
          mp3_url: mp3Url,
          download_link: formData.downloadLink.trim() || null,
          status: 'pending',
        });

      if (insertError) {
        console.error('Insert error:', insertError);
        setError('שגיאה בשליחת הטראק: ' + insertError.message);
        setSubmitting(false);
        return;
      }

      setUploadProgress(100);
      setSuccess(true);

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/radio/dashboard');
      }, 2000);

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

  if (success) {
    return (
      <>
        <Head>
          <title>הטראק נשלח! | רדיו יוצאים לטראק</title>
        </Head>
        <div className="min-h-screen bg-gradient-to-b from-[#050814] via-[#0a0a1f] to-black text-white">
          <Navigation />
          <div className="max-w-2xl mx-auto px-6 py-20 text-center">
            <div className="text-6xl mb-6">✅</div>
            <h1 className="text-4xl font-bold mb-4 text-green-400">הטראק נשלח בהצלחה!</h1>
            <p className="text-gray-400 mb-8">נבדוק את הטראק ונעדכן אותך בהקדם</p>
            <Link
              href="/radio/dashboard"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold py-3 px-6 rounded-xl transition-all"
            >
              <FaArrowRight className="rotate-180" />
              חזרה לאזור האישי
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>הגשת טראק | רדיו יוצאים לטראק</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-[#050814] via-[#0a0a1f] to-black text-white">
        <Navigation />

        <div className="max-w-2xl mx-auto px-6 py-12">
          {/* Back link */}
          <Link
            href="/radio/dashboard"
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-8 transition-colors"
          >
            <FaArrowRight />
            חזרה לאזור האישי
          </Link>

          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-cyan-600 mb-6">
              <FaMusic className="text-3xl" />
            </div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              הגשת טראק
            </h1>
            <p className="text-gray-400">
              שלחו את המוזיקה שלכם לרדיו
            </p>
          </div>

          {/* Form */}
          <div className="bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl rounded-2xl p-8 border border-gray-800">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error message */}
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-300 text-center">
                  {error}
                </div>
              )}

              {/* Track Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  שם הטראק (באנגלית) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.trackName}
                  onChange={(e) => setFormData({ ...formData, trackName: e.target.value })}
                  placeholder="Track Name"
                  className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-xl focus:border-purple-500 focus:outline-none text-white placeholder-gray-500"
                  dir="ltr"
                />
              </div>

              {/* BPM */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  BPM (אופציונלי)
                </label>
                <input
                  type="number"
                  min="100"
                  max="200"
                  value={formData.bpm}
                  onChange={(e) => setFormData({ ...formData, bpm: e.target.value })}
                  placeholder="145"
                  className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-xl focus:border-purple-500 focus:outline-none text-white placeholder-gray-500"
                  dir="ltr"
                />
              </div>

              {/* Genre */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  ז׳אנר
                </label>
                <select
                  value={formData.genre}
                  onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                  className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-xl focus:border-purple-500 focus:outline-none text-white"
                >
                  <option value="">בחרו ז׳אנר</option>
                  {GENRES.map((genre) => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  קובץ MP3
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".mp3,audio/mpeg"
                    onChange={handleFileChange}
                    className="hidden"
                    id="mp3-upload"
                  />
                  <label
                    htmlFor="mp3-upload"
                    className={`flex items-center justify-center gap-3 w-full px-6 py-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                      mp3File
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-gray-700 hover:border-purple-500 bg-black/30'
                    }`}
                  >
                    {mp3File ? (
                      <>
                        <FaCheckCircle className="text-green-500 text-xl" />
                        <span className="text-green-400">{mp3File.name}</span>
                      </>
                    ) : (
                      <>
                        <FaCloudUploadAlt className="text-gray-500 text-2xl" />
                        <span className="text-gray-400">לחצו להעלאת קובץ MP3 (עד 20MB)</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* OR divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 border-t border-gray-700"></div>
                <span className="text-gray-500 text-sm">או</span>
                <div className="flex-1 border-t border-gray-700"></div>
              </div>

              {/* Download Link */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  קישור להורדה (SoundCloud, Google Drive, Dropbox)
                </label>
                <input
                  type="url"
                  value={formData.downloadLink}
                  onChange={(e) => setFormData({ ...formData, downloadLink: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-xl focus:border-purple-500 focus:outline-none text-white placeholder-gray-500"
                  dir="ltr"
                />
                <p className="text-xs text-gray-500 mt-1">ודאו שהקישור מאפשר הורדה ישירה</p>
              </div>

              {/* Progress bar */}
              {submitting && uploadProgress > 0 && (
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-cyan-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || !formData.trackName.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold py-4 px-8 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    מעלה...
                  </>
                ) : (
                  <>
                    <FaMusic />
                    שלח טראק
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

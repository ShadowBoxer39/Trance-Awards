// pages/radio/submit.tsx - Track Submission Form with Consent
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import Navigation from '@/components/Navigation'; 
import { FaMusic, FaCloudUploadAlt, FaArrowRight, FaCheckCircle, FaImage, FaChevronDown, FaChevronUp } from 'react-icons/fa';

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

  // Consent state
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    trackName: '',
    bpm: '',
    genre: '',
  });

  const [mp3File, setMp3File] = useState<File | null>(null);
  const [artFile, setArtFile] = useState<File | null>(null);
  const [artPreview, setArtPreview] = useState<string | null>(null);

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

  const handleArtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.includes('image/')) {
      setError('יש להעלות קובץ תמונה בלבד (JPG, PNG)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('התמונה גדולה מדי. מקסימום 5MB');
      return;
    }

    setArtFile(file);
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setArtPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artistId) return;

    // Require MP3 file
    if (!mp3File) {
      setError('יש להעלות קובץ MP3');
      return;
    }

    // Require consent
    if (!agreedToTerms) {
      setError('יש לאשר את תנאי השימוש');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const timestamp = Date.now();
      const safeName = formData.trackName.replace(/[^a-zA-Z0-9]/g, '_');

      // Upload MP3
      setUploadProgress(10);
      const mp3FileName = `${artistId}/${timestamp}_${safeName}.mp3`;

      const { error: mp3Error } = await supabase.storage
        .from('Radio')
        .upload(mp3FileName, mp3File, {
          cacheControl: '3600',
          upsert: false,
        });

      if (mp3Error) {
        console.error('MP3 upload error:', mp3Error);
        setError('שגיאה בהעלאת קובץ ה-MP3: ' + mp3Error.message);
        setSubmitting(false);
        return;
      }

      setUploadProgress(50);

      // Get MP3 public URL
      const { data: mp3UrlData } = supabase.storage
        .from('Radio')
        .getPublicUrl(mp3FileName);

      const mp3Url = mp3UrlData.publicUrl;

      // Upload art if provided
      let artUrl: string | null = null;
      if (artFile) {
        setUploadProgress(60);
        const artExt = artFile.name.split('.').pop() || 'jpg';
        const artFileName = `${artistId}/${timestamp}_${safeName}_art.${artExt}`;

        const { error: artError } = await supabase.storage
          .from('Radio')
          .upload(artFileName, artFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (artError) {
          console.error('Art upload error:', artError);
          // Don't fail the whole submission, just skip the art
        } else {
          const { data: artUrlData } = supabase.storage
            .from('Radio')
            .getPublicUrl(artFileName);
          artUrl = artUrlData.publicUrl;
        }
      }

      setUploadProgress(80);

      // Create submission record with consent timestamp
      const { error: insertError } = await supabase
        .from('radio_submissions')
        .insert({
          artist_id: artistId,
          track_name: formData.trackName.trim(),
          bpm: formData.bpm ? parseInt(formData.bpm) : null,
          genre: formData.genre || null,
          mp3_url: mp3Url,
          art_url: artUrl,
          status: 'pending',
          agreed_to_terms: true,
          agreed_at: new Date().toISOString(),
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

              {/* MP3 File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  קובץ MP3 *
                </label>
                <div className="relative">
                <input
  type="file"
  accept="audio/*,.mp3,audio/mpeg"
  onChange={handleMp3Change}
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

              {/* Track Art Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  תמונת עטיפה (אופציונלי)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleArtChange}
                    className="hidden"
                    id="art-upload"
                  />
                  <label
                    htmlFor="art-upload"
                    className={`flex items-center justify-center gap-3 w-full px-6 py-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                      artFile
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-gray-700 hover:border-purple-500 bg-black/30'
                    }`}
                  >
                    {artPreview ? (
                      <div className="flex items-center gap-4">
                        <img
                          src={artPreview}
                          alt="Track art preview"
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <span className="text-green-400">{artFile?.name}</span>
                      </div>
                    ) : (
                      <>
                        <FaImage className="text-gray-500 text-2xl" />
                        <span className="text-gray-400">לחצו להעלאת תמונה (עד 5MB)</span>
                      </>
                    )}
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">מומלץ: תמונה ריבועית 500x500 פיקסלים</p>
              </div>

              {/* Consent Section */}
              <div className="border border-gray-700 rounded-xl overflow-hidden">
                {/* Expandable Terms Header */}
                <button
                  type="button"
                  onClick={() => setShowTerms(!showTerms)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-800/50 hover:bg-gray-800/70 transition-colors text-right"
                >
                  <span className="text-sm text-gray-300">תנאי שימוש להגשת טראקים</span>
                  {showTerms ? (
                    <FaChevronUp className="text-gray-500" />
                  ) : (
                    <FaChevronDown className="text-gray-500" />
                  )}
                </button>

                {/* Expandable Terms Content */}
                {showTerms && (
                  <div className="px-4 py-4 bg-black/30 text-sm text-gray-400 space-y-3 border-t border-gray-700">
                    <p><strong className="text-gray-300">1. בעלות על הזכויות</strong><br />
                    אני מצהיר/ה שאני בעל/ת הזכויות המלאות על הטראק המוגש, או שקיבלתי אישור מפורש מבעל/ת הזכויות להגיש אותו.</p>
                    
                    <p><strong className="text-gray-300">2. רישיון שימוש</strong><br />
                    אני מעניק/ה לרדיו יוצאים לטראק רישיון לא-בלעדי לנגן את הטראק בשידורי הרדיו, כולל באתר, באפליקציות, וברשתות החברתיות.</p>
                    
                    <p><strong className="text-gray-300">3. ללא תשלום</strong><br />
                    אני מבין/ה שהגשת הטראק והשמעתו ברדיו הינם ללא תמורה כספית, ומטרתם היא חשיפה וקידום האמן/ית.</p>
                    
                    <p><strong className="text-gray-300">4. שמירת זכויות</strong><br />
                    כל הזכויות על הטראק נשארות בבעלותי המלאה. אני רשאי/ת להמשיך להשתמש בטראק בכל דרך שאבחר.</p>
                    
                    <p><strong className="text-gray-300">5. הסרת טראק</strong><br />
                    אני רשאי/ת לבקש את הסרת הטראק מהרדיו בכל עת על ידי פנייה לצוות.</p>
                    
                    <p><strong className="text-gray-300">6. אישור הגשות</strong><br />
                    צוות הרדיו שומר לעצמו את הזכות לאשר או לדחות הגשות על פי שיקול דעתו.</p>
                  </div>
                )}

                {/* Checkbox */}
                <div className="px-4 py-4 bg-black/20">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative mt-0.5">
                      <input
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        agreedToTerms 
                          ? 'bg-purple-600 border-purple-600' 
                          : 'border-gray-600 group-hover:border-purple-500'
                      }`}>
                        {agreedToTerms && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-gray-300 leading-relaxed">
                      קראתי ואני מסכים/ה ל
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowTerms(true);
                        }}
                        className="text-purple-400 hover:text-purple-300 underline mx-1"
                      >
                        תנאי השימוש
                      </button>
                      להגשת טראקים לרדיו יוצאים לטראק *
                    </span>
                  </label>
                </div>
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
                disabled={submitting || !formData.trackName.trim() || !mp3File || !agreedToTerms}
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

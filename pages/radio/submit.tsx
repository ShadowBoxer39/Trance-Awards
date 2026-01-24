// pages/radio/submit.tsx - Quality-Focused Track Submission with Monthly Limit
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import Navigation from '@/components/Navigation';  
import { FaMusic, FaCloudUploadAlt, FaArrowRight, FaCheckCircle, FaChevronDown, FaChevronUp, FaInfoCircle, FaPenNib, FaGem, FaLock } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const MAX_SUBMISSIONS_PER_MONTH = 3;

const FloatingNotes = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="absolute text-purple-500/10 animate-float-slow"
          style={{ left: `${15 + i * 15}%`, top: `${20 + (i % 3) * 25}%`, animationDelay: `${i * 0.8}s`, fontSize: `${24 + i * 8}px` }}
        > ♪ </div>
      ))}
    </div>
  );
};

export default function RadioSubmitPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [artist, setArtist] = useState<{ id: string; name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  // Monthly submission tracking
  const [submissionsThisMonth, setSubmissionsThisMonth] = useState(0);
  const [remainingSubmissions, setRemainingSubmissions] = useState(MAX_SUBMISSIONS_PER_MONTH);

  // Form State
  const [formData, setFormData] = useState({ trackName: '', description: '', isPremiere: false });
  const [mp3File, setMp3File] = useState<File | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute('dir', 'rtl');
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { router.push('/radio/register'); return; }
      setUser(session.user);
      
      // Fetch artist data including name and email for the notification
      const { data: artistData } = await supabase
        .from('radio_artists')
        .select('id, name, email')
        .eq('user_id', session.user.id)
        .maybeSingle();
      
      if (!artistData) { router.push('/radio/register'); return; }
      setArtist(artistData);

      // Count submissions this month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

      const { count } = await supabase
        .from('radio_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('artist_id', artistData.id)
        .gte('submitted_at', startOfMonth)
        .lte('submitted_at', endOfMonth);

      const monthlyCount = count || 0;
      setSubmissionsThisMonth(monthlyCount);
      setRemainingSubmissions(Math.max(0, MAX_SUBMISSIONS_PER_MONTH - monthlyCount));

      setLoading(false);
    };
    checkAuth();
  }, [router]);

  const handleMp3Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.includes('audio/mpeg') && !file.name.endsWith('.mp3')) { setError('יש להעלות קובץ MP3 בלבד'); return; }
    if (file.size > 35 * 1024 * 1024) { setError('הקובץ גדול מדי. מקסימום 35MB'); return; }
    setMp3File(file);
    setError('');
    if (!formData.trackName) { setFormData(prev => ({ ...prev, trackName: file.name.replace(/\.mp3$/i, '') })); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artist || !mp3File || !agreedToTerms || remainingSubmissions <= 0) return;
    setSubmitting(true);
    setError('');

    try {
      const timestamp = Date.now();
      const safeName = formData.trackName.replace(/[^a-zA-Z0-9]/g, '_');
      const mp3FileName = `${artist.id}/${timestamp}_${safeName}.mp3`;

      setUploadProgress(20);
      const { error: mp3Error } = await supabase.storage.from('Radio').upload(mp3FileName, mp3File);
      if (mp3Error) throw mp3Error;

      setUploadProgress(70);
      const { data: mp3UrlData } = supabase.storage.from('Radio').getPublicUrl(mp3FileName);

      const { error: insertError } = await supabase.from('radio_submissions').insert({
        artist_id: artist.id,
        track_name: formData.trackName.trim(),
        description: formData.description.trim(),
        is_premiere: formData.isPremiere,
        mp3_url: mp3UrlData.publicUrl,
        status: 'pending',
        agreed_to_terms: true,
        agreed_at: new Date().toISOString(),
      });

      if (insertError) throw insertError;
      
      setUploadProgress(90);
      
      // Send email notification (non-blocking - don't fail submission if email fails)
      try {
        await fetch('/api/radio/send-track-submitted', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: artist.email,
            artistName: artist.name,
            trackName: formData.trackName.trim(),
          }),
        });
      } catch (emailErr) {
        console.error('Email notification failed:', emailErr);
      }
      
      setUploadProgress(100);
      setSuccess(true);
      setTimeout(() => router.push('/radio/dashboard'), 2500);
    } catch (err: any) {
      setError('שגיאה בשליחת הטראק. נסה שנית.');
      setSubmitting(false);
    }
  };

  const canSubmit = remainingSubmissions > 0;

  if (loading) return <div className="min-h-screen bg-[#0a0a12] text-white flex items-center justify-center"><div className="w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" /></div>;

  return (
    <>
      <Head>
        <title>הגשת טראק | רדיו יוצאים לטראק</title>
        <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="min-h-screen bg-[#0a0a12] text-white font-['Rubik',sans-serif]">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] animate-gradient" />
          <FloatingNotes />
        </div>

        <Navigation />

        <div className="relative max-w-2xl mx-auto px-6 py-12">
          <Link href="/radio/dashboard" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-8 transition-colors">
            <FaArrowRight /> <span>חזרה לאזור האישי</span>
          </Link>

          {/* Header with Quality Message */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/20 mb-6">
              <FaGem className="text-3xl text-purple-400" />
            </div>
            <h1 className="text-4xl font-bold mb-3 text-white">שלחו את הטראק הטוב ביותר שלכם</h1>
            <p className="text-gray-400 max-w-md mx-auto leading-relaxed">
              אנחנו מעדיפים טראק אחד מושקע על פני עשרה בינוניים. קחו את הזמן, תבחרו נכון.
            </p>
          </div>

          {/* Monthly Submissions Counter */}
          <div className={`mb-8 p-5 rounded-2xl border ${canSubmit ? 'bg-purple-500/10 border-purple-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {canSubmit ? (
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <HiSparkles className="text-purple-400" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                    <FaLock className="text-red-400" />
                  </div>
                )}
                <div>
                  <p className={`font-bold ${canSubmit ? 'text-purple-300' : 'text-red-300'}`}>
                    {canSubmit ? `נשארו לך ${remainingSubmissions} הגשות החודש` : 'הגעת למגבלת ההגשות החודשית'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {canSubmit 
                      ? 'בחרו בחוכמה - שלחו רק את מה שאתם הכי גאים בו' 
                      : 'המגבלה מתאפסת בתחילת החודש הבא'}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                {[...Array(MAX_SUBMISSIONS_PER_MONTH)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-3 h-3 rounded-full ${i < submissionsThisMonth ? 'bg-gray-600' : 'bg-purple-500'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Blocked State */}
          {!canSubmit && (
            <div className="glass-warm rounded-3xl p-10 text-center border border-red-500/10">
              <FaLock className="text-5xl text-red-400/50 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-4">הגעת למגבלה 🎵</h2>
              <p className="text-gray-400 leading-relaxed mb-6">
                כבר שלחת {MAX_SUBMISSIONS_PER_MONTH} טראקים החודש. המגבלה קיימת כדי לשמור על איכות גבוהה ולתת לכולם הזדמנות שווה.
              </p>
              <p className="text-gray-500 text-sm">
                בינתיים, אפשר לעבוד על הטראק הבא ולהכין אותו להגשה בחודש הבא 💪
              </p>
              <Link href="/radio/dashboard" className="inline-flex items-center gap-2 mt-8 text-purple-400 hover:text-purple-300 transition">
                <FaArrowRight /> חזרה לאזור האישי
              </Link>
            </div>
          )}

          {/* Submission Form */}
          {canSubmit && (
            <div className="glass-warm rounded-3xl p-6 sm:p-10 shadow-2xl border border-white/5">
              {success ? (
                <div className="text-center py-10 animate-fade-in">
                  <div className="text-6xl mb-6">✨</div>
                  <h2 className="text-2xl font-bold text-green-400 mb-4">הטראק הוגש בהצלחה!</h2>
                  <p className="text-gray-400 leading-relaxed">אנחנו כבר מתים להקשיב.<br />מעביר אותך חזרה לאזור האישי...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  {error && <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-400 text-center text-sm">{error}</div>}

                  {/* Quality Reminder */}
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-5">
                    <div className="flex items-start gap-4">
                      <FaGem className="text-purple-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-purple-200 font-medium mb-1">לפני שמגישים, שאלו את עצמכם:</p>
                        <ul className="text-xs text-gray-400 space-y-1">
                          <li>• האם זה הטראק הכי טוב שלי כרגע?</li>
                          <li>• האם המיקס והמאסטר ברמה מקצועית?</li>
                          <li>• האם אני גאה להציג אותו לקהילה?</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex items-start gap-4">
                    <FaInfoCircle className="text-blue-400 mt-1 flex-shrink-0" />
                    <p className="text-xs text-blue-200 leading-relaxed">
                      <strong>טיפ חשוב:</strong> וודאו שקובץ ה-MP3 כולל "Metadata" (שם אמן, שם שיר ותמונת עטיפה). זה מה שהמאזינים יראו בנגן.
                    </p>
                  </div>

                  {/* Track Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-3 mr-1">שם הטראק (באנגלית) *</label>
                    <input
                      type="text" required value={formData.trackName}
                      onChange={(e) => setFormData({ ...formData, trackName: e.target.value })}
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 focus:outline-none text-white transition-all"
                      dir="ltr"
                    />
                  </div>

                  {/* Track Story */}
<div>
  <label className="block text-sm font-medium text-gray-400 mb-3 mr-1">
    <FaPenNib className="inline ml-2 text-purple-400/80" />
    ספרו לנו על הטראק (אופציונלי)
  </label>
  <textarea
    rows={4}
    value={formData.description}
    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
    placeholder="מה ההשראה לטראק? משהו שתרצו שנגיד עליו בשידור?"
    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 focus:outline-none text-white resize-none transition-all placeholder:text-gray-600"
  />
  <div className="mt-3 bg-purple-500/10 border border-purple-500/20 rounded-xl p-3">
    <p className="text-xs text-purple-300">
      💬 <span className="font-bold">הטקסט הזה יופיע בשידור!</span> המאזינים יראו אותו מתחת לשם הטראק בזמן שהוא מתנגן. זו ההזדמנות שלכם לספר את הסיפור מאחורי המוזיקה.
    </p>
  </div>
</div>

                  {/* Premiere Toggle */}
                  <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🚀</span>
                      <div>
                        <h4 className="text-sm font-medium text-gray-200">האם זו השמעת בכורה?</h4>
                        <p className="text-[10px] text-gray-500">טראק שטרם שוחרר או הושמע במקום אחר</p>
                      </div>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={formData.isPremiere} 
                      onChange={(e) => setFormData({...formData, isPremiere: e.target.checked})}
                      className="w-6 h-6 rounded-lg accent-purple-500 cursor-pointer"
                    />
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-3 mr-1">קובץ MP3 *</label>
                 <input 
  type="file" 
  accept=".mp3,audio/mpeg" 
  onChange={handleMp3Change} 
  className="hidden" 
  id="mp3-upload" 
/>
                    <label htmlFor="mp3-upload" className={`flex flex-col items-center justify-center gap-4 w-full p-10 border-2 border-dashed rounded-[2.5rem] cursor-pointer transition-all ${
                      mp3File ? 'border-green-500/50 bg-green-500/5' : 'border-white/10 hover:border-purple-500/40 bg-white/5'
                    }`}>
                      {mp3File ? (
                        <><FaCheckCircle className="text-green-500 text-3xl" /><span className="text-green-400 text-sm font-medium truncate max-w-xs">{mp3File.name}</span></>
                      ) : (
                        <><FaCloudUploadAlt className="text-gray-600 text-4xl" /><span className="text-gray-400 text-sm">לחץ לבחירת קובץ (עד 35MB)</span></>
                      )}
                    </label>
                  </div>

                  {/* Terms and Consent */}
                  <div className="border border-white/5 rounded-3xl overflow-hidden bg-white/5">
                    <button type="button" onClick={() => setShowTerms(!showTerms)} className="w-full flex items-center justify-between px-6 py-5 hover:bg-white/5 transition-colors">
                      <span className="text-sm text-gray-300 font-medium">הצהרת זכויות ותנאי שימוש</span>
                      {showTerms ? <FaChevronUp className="text-xs text-gray-500" /> : <FaChevronDown className="text-xs text-gray-500" />}
                    </button>
                    {showTerms && (
                      <div className="px-6 pb-6 text-[11px] text-gray-500 space-y-3 border-t border-white/5 pt-4 leading-relaxed">
                        <p>1. הנני מצהיר/ה כי אני בעל/ת מלוא הזכויות בטראק המוגש.</p>
                        <p>2. הנני מעניק/ה לרדיו יוצאים לטראק רישיון לשידור היצירה כחלק מלוח השידורים והתוכן של התחנה.</p>
                        <p>3. ידוע לי כי ההשמעה היא ללא תמורה כספית ומיועדת לקידום וחשיפה בלבד.</p>
                      </div>
                    )}
                    <div className="px-6 py-5 bg-purple-500/5 border-t border-white/5">
                      <label className="flex items-center gap-4 cursor-pointer group">
                        <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="w-6 h-6 rounded border-white/10 bg-white/5 text-purple-600 focus:ring-purple-500" />
                        <span className="text-xs text-gray-300 group-hover:text-white transition-colors">אני מאשר/ת את התנאים ומצהיר/ה על בעלות הזכויות *</span>
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
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-5 rounded-[1.5rem] transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl shadow-purple-500/20 active:scale-[0.98]"
                  >
                    {submitting ? <><span className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" /> <span>מעלה טראק...</span></> : <><HiSparkles className="text-2xl" /> <span>שלח טראק לרדיו</span></>}
                  </button>

                  {/* Remaining submissions reminder */}
                  <p className="text-center text-xs text-gray-500">
                    לאחר הגשה זו יישארו לך {remainingSubmissions - 1} הגשות החודש
                  </p>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

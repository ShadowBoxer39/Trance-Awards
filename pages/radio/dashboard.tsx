import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js'; 
import Navigation from '@/components/Navigation'; 
import { FaMusic, FaClock, FaCheckCircle, FaTrash, FaInfoCircle, FaSignOutAlt, FaRocket, FaHeadphones, FaInstagram, FaSoundcloud, FaCamera, FaEdit } from 'react-icons/fa';
import { HiSparkles, HiMusicNote } from 'react-icons/hi';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface RadioArtist {
  id: string; name: string; slug: string; email: string; instagram: string | null;
  soundcloud: string | null; bio: string | null; image_url: string | null; approved: boolean; created_at: string;
}

interface Submission {
  id: string; track_name: string; bpm: number | null; genre: string | null;
  status: 'pending' | 'approved' | 'declined'; submitted_at: string;
  admin_notes: string | null; art_url: string | null;
}

const FloatingNotes = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="absolute text-purple-500/10 animate-float-slow"
        style={{ left: `${15 + i * 15}%`, top: `${20 + (i % 3) * 25}%`, animationDelay: `${i * 0.8}s`, fontSize: `${24 + i * 8}px` }}
      > ♪ </div>
    ))}
  </div>
);

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
  
  // EDIT MODE STATE
  const [isEditing, setIsEditing] = useState(false);

  // FORM STATE
  const [formData, setFormData] = useState({
    name: '',
    instagram: '',
    soundcloud: '',
    bio: '',
    termsAgreed: false
  });
  const [file, setFile] = useState<File | null>(null);
  const [creatingProfile, setCreatingProfile] = useState(false);

  const greeting = getGreeting();

  useEffect(() => {
    if (!router.isReady) return;
    document.documentElement.setAttribute('dir', 'rtl');

    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { router.push('/radio/register'); return; }
      setUser(session.user);

      const { data: artistData, error: artistError } = await supabase
        .from('radio_artists').select('*').eq('user_id', session.user.id).maybeSingle();

      if (!artistData) { 
        setLoading(false);
        return; 
      }

      setArtist(artistData);

      // --- 📧 WELCOME EMAIL TRIGGER ---
      if (router.query.welcome === '1') {
         fetch('/api/radio/send-welcome', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              email: session.user.email, 
              name: artistData.name 
            }),
         }).catch(err => console.error("Email error:", err));
         
         router.replace('/radio/dashboard', undefined, { shallow: true });
      }
      // ----------------------------------------

      const { data: submissionsData } = await supabase
        .from('radio_submissions').select('*').eq('artist_id', artistData.id).order('submitted_at', { ascending: false });

      setSubmissions(submissionsData || []);
      setLoading(false);
    };

    loadData();
  }, [router.isReady]); 

  // Populate form when clicking Edit
  const handleStartEdit = () => {
    if (!artist) return;
    setFormData({
      name: artist.name,
      instagram: artist.instagram || '',
      soundcloud: artist.soundcloud || '',
      bio: artist.bio || '',
      termsAgreed: true // Already agreed on signup
    });
    setFile(null); // Reset file input
    setIsEditing(true);
  };

  // Handle Create OR Update Profile
  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !user || !formData.termsAgreed) {
        alert("נא למלא את כל שדות החובה ולאשר את התנאים");
        return;
    }
    
    setCreatingProfile(true);
    
    try {
      let publicUrl = artist?.image_url || null;

      // 1. Upload Image (If selected)
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('artist-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl: url } } = supabase.storage
          .from('artist-images')
          .getPublicUrl(filePath);
          
        publicUrl = url;
      }

      // 2. CHECK: Update or Insert?
      if (artist) {
        // === UPDATE EXISTING ===
        const { error } = await supabase
          .from('radio_artists')
          .update({
            name: formData.name,
            image_url: publicUrl,
            instagram: formData.instagram || null,
            soundcloud: formData.soundcloud || null,
            bio: formData.bio || null,
          })
          .eq('id', artist.id);

        if (error) throw error;
        
        // Update local state immediately
        setArtist({ 
           ...artist, 
           name: formData.name, 
           image_url: publicUrl, 
           instagram: formData.instagram || null, 
           soundcloud: formData.soundcloud || null, 
           bio: formData.bio || null 
        });
        
        setIsEditing(false);
        setCreatingProfile(false);
        // Do not redirect, just close modal
      } else {
        // === INSERT NEW (WITH DUPLICATE CHECK) ===
        // Generate base slug
        let slug = formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        
        // --- DUPLICATE CHECK START ---
        // Check if slug already exists
        const { data: existingArtist } = await supabase
            .from('radio_artists')
            .select('id')
            .eq('slug', slug)
            .maybeSingle();

        // If it exists, append a random number (e.g., nova-4812)
        if (existingArtist) {
            slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
        }
        // --- DUPLICATE CHECK END ---
        
        const { error } = await supabase
          .from('radio_artists')
          .insert([
            {
              user_id: user.id,
              name: formData.name,
              email: user.email,
              slug: slug,
              image_url: publicUrl,
              instagram: formData.instagram || null,
              soundcloud: formData.soundcloud || null,
              bio: formData.bio || null,
              approved: false
            }
          ]);

        if (error) throw error;

        // Redirect with ?welcome=1
        window.location.href = '/radio/dashboard?welcome=1';
      }
      
    } catch (err: any) {
      console.error('Error:', err);
      alert('שגיאה: ' + (err.message || 'נסה שנית'));
      setCreatingProfile(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/radio/register';
  };

  const handleDeleteSubmission = async (submissionId: string) => {
    const track = submissions.find(s => s.id === submissionId);
    if (track?.status === 'approved') {
      alert('לא ניתן למחוק טראק שאושר ונמצא בשידור. לביטול השמעה יש ליצור קשר עם הנהלת הרדיו.');
      return;
    }
    if (!artist || !confirm('בטוח שברצונך למחוק את הטראק מהרשימה?')) return;
    try {
      const { error } = await supabase.from('radio_submissions').delete().eq('id', submissionId).eq('artist_id', artist.id);
      if (error) throw error;
      setSubmissions(prev => prev.filter(s => s.id !== submissionId));
    } catch (err) {
      alert('שגיאה במחיקת הטראק.');
    }
  };

  const approvedCount = submissions.filter(s => s.status === 'approved').length;
  const pendingCount = submissions.filter(s => s.status === 'pending').length;

  if (loading) return <div className="min-h-screen bg-[#0a0a12] text-white flex items-center justify-center"><div className="w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" /></div>;

  // --- SHOW FORM IF NO ARTIST OR EDITING ---
  if (!artist || isEditing) {
    return (
      <div className="min-h-screen bg-[#0a0a12] text-white font-['Rubik',sans-serif] flex items-center justify-center px-4 py-12">
        <div className="glass-warm max-w-lg w-full rounded-3xl p-8 md:p-10 border border-purple-500/20 relative overflow-hidden">
           <FloatingNotes />
           <div className="relative z-10">
             <div className="text-center mb-8">
               <h2 className="text-2xl md:text-3xl font-bold mb-2">{artist ? 'עריכת פרופיל' : 'הקמת פרופיל אמן'}</h2>
               <p className="text-gray-400 text-sm">{artist ? 'עדכון פרטים אישיים' : 'הצעד הראשון לשידור ברדיו'}</p>
             </div>
             
             <form onSubmit={handleCreateProfile} className="space-y-4">
               
               {/* Image Upload */}
               <div className="flex justify-center mb-6">
                 <label className="relative cursor-pointer group">
                   <div className="w-24 h-24 rounded-full bg-white/10 border-2 border-dashed border-white/20 flex items-center justify-center overflow-hidden group-hover:border-purple-500 transition-all">
                     {file ? (
                       <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                     ) : (artist?.image_url ? (
                       <img src={artist.image_url} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                     ) : (
                       <div className="text-center">
                         <FaCamera className="mx-auto mb-1 text-gray-400" />
                         <span className="text-[10px] text-gray-500">העלה תמונה</span>
                       </div>
                     ))}
                   </div>
                   <input 
                     type="file" 
                     className="hidden" 
                     accept="image/*"
                     onChange={(e) => setFile(e.target.files?.[0] || null)}
                   />
                 </label>
               </div>

               {/* Artist Name */}
               <div>
                 <label className="block text-xs text-gray-500 mb-1 mr-1">שם האמן *</label>
                 <input 
                   type="text" 
                   className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                   value={formData.name}
                   onChange={(e) => setFormData({...formData, name: e.target.value})}
                   required
                 />
               </div>

               {/* Bio */}
               <div>
                 <label className="block text-xs text-gray-500 mb-1 mr-1">ביוגרפיה קצרה</label>
                 <textarea 
                   className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none h-24 resize-none"
                   placeholder="ספרו קצת על עצמכם..."
                   value={formData.bio}
                   onChange={(e) => setFormData({...formData, bio: e.target.value})}
                 />
               </div>

               {/* Socials */}
               <div className="grid grid-cols-2 gap-4">
                 <input 
                    type="text" 
                    placeholder="Instagram Link" 
                    className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-purple-500 focus:outline-none"
                    dir="ltr"
                    value={formData.instagram}
                    onChange={(e) => setFormData({...formData, instagram: e.target.value})}
                 />
                 <input 
                    type="text" 
                    placeholder="SoundCloud Link" 
                    className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-purple-500 focus:outline-none"
                    dir="ltr"
                    value={formData.soundcloud}
                    onChange={(e) => setFormData({...formData, soundcloud: e.target.value})}
                 />
               </div>

               {/* Legal Checkbox */}
               <div className="flex items-start gap-3 mt-4 px-1">
                 <input 
                   type="checkbox" 
                   id="terms"
                   className="mt-1 accent-purple-500"
                   checked={formData.termsAgreed}
                   onChange={(e) => setFormData({...formData, termsAgreed: e.target.checked})}
                 />
                 <label htmlFor="terms" className="text-xs text-gray-400 cursor-pointer select-none">
                   אני מאשר/ת שאני בעל/ת הזכויות במוזיקה שאעלה, ומאשר/ת לרדיו "יוצאים לטראק" לשדר את התכנים.
                 </label>
               </div>

               <div className="flex gap-3 pt-2">
                 {isEditing && (
                    <button 
                      type="button" 
                      onClick={() => setIsEditing(false)}
                      className="w-1/3 bg-white/5 text-gray-300 font-bold py-4 rounded-xl hover:bg-white/10 transition-all border border-white/10"
                    >
                      ביטול
                    </button>
                 )}
                 <button 
                   type="submit" 
                   disabled={creatingProfile || !formData.termsAgreed}
                   className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-900/20"
                 >
                   {creatingProfile ? 'שומר...' : (artist ? 'שמור שינויים' : 'יצירת פרופיל 🚀')}
                 </button>
               </div>
             </form>
             
             {!artist && (
               <button onClick={handleLogout} className="mt-4 w-full text-center text-xs text-gray-500 hover:text-white transition-colors">
                 התנתק
               </button>
             )}
           </div>
        </div>
      </div>
    );
  }

  // --- DASHBOARD RENDER ---
  return (
    <>
      <Head>
        <title>האזור האישי שלי | רדיו יוצאים לטראק</title>
        <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <style jsx global>{`
        @keyframes float-slow { 0%, 100% { transform: translateY(0); opacity: 0.1; } 50% { transform: translateY(-30px); opacity: 0.2; } }
        @keyframes gradient-shift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-gradient { background-size: 200% 200%; animation: gradient-shift 8s ease infinite; }
        .glass-warm { background: linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(59, 130, 246, 0.05) 50%, rgba(236, 72, 153, 0.08) 100%); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); }
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
          {/* Header Section */}
          <div className="mb-8 sm:mb-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="relative flex-shrink-0">
                  <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 ${artist?.approved ? 'border-green-500/50' : 'border-yellow-500/50'}`}>
                    {artist?.image_url ? <img src={artist.image_url} alt={artist.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center"><span className="text-2xl font-bold">{artist?.name?.charAt(0) || '?'}</span></div>}
                  </div>
                  <div className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-[#0a0a12] flex items-center justify-center text-[10px] ${artist?.approved ? 'bg-green-500' : 'bg-yellow-500'}`}>{artist?.approved ? '✓' : '⏳'}</div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-gray-400 text-xs sm:text-sm mb-1"><span>{greeting.emoji}</span><span>{greeting.text}</span></div>
                  <div className="flex items-center gap-3">
                     <h1 className="text-xl sm:text-3xl font-bold text-white truncate max-w-[200px] sm:max-w-none">{artist?.name}</h1>
                     <button onClick={handleStartEdit} className="text-gray-400 hover:text-white p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition" title="ערוך פרופיל"><FaEdit /></button>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{artist?.approved ? <span className="text-green-400/80">פרופיל מאושר • מוכן לשדר</span> : <span className="text-yellow-400/80">ממתין לאישור הפרופיל</span>}</p>
                </div>
              </div>
              <div className="flex gap-2 sm:gap-3">
                <Link href="/radio/submit" className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium py-3 px-4 sm:px-6 rounded-2xl transition-all shadow-lg shadow-purple-500/20"><HiSparkles className="text-lg" /> העלה טראק</Link>
                <button onClick={handleLogout} className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-medium py-3 px-4 sm:px-5 rounded-2xl transition-all border border-white/5"><FaSignOutAlt className="text-sm" /></button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-10">
            <div className="glass-warm rounded-2xl p-4 sm:p-5 flex sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0"><FaMusic className="text-purple-400" /></div>
              <div className="flex-1 sm:flex-none text-right sm:text-left"><div className="text-2xl sm:text-3xl font-bold text-white mb-1">{submissions.length}</div><div className="text-xs sm:text-sm text-gray-400">טראקים שהוגשו</div></div>
            </div>
            <div className="glass-warm rounded-2xl p-4 sm:p-5 flex sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0"><FaHeadphones className="text-green-400" /></div>
              <div className="flex-1 sm:flex-none text-right sm:text-left"><div className="text-2xl sm:text-3xl font-bold text-white mb-1">{approvedCount}</div><div className="text-xs sm:text-sm text-gray-400">טראקים מאושרים</div></div>
            </div>
            <div className="glass-warm rounded-2xl p-4 sm:p-5 flex sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center flex-shrink-0"><FaClock className="text-yellow-400" /></div>
              <div className="flex-1 sm:flex-none text-right sm:text-left"><div className="text-2xl sm:text-3xl font-bold text-white mb-1">{pendingCount}</div><div className="text-xs sm:text-sm text-gray-400">בהמתנה</div></div>
            </div>
          </div>

           {/* --- PENDING TRACKS BANNER (NEW) --- */}
           {pendingCount > 0 && (
             <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-start gap-3 animate-fade-in">
               <FaInfoCircle className="text-purple-400 mt-1 flex-shrink-0" />
               <div>
                 <p className="text-sm text-purple-100 font-bold mb-1">יש לך {pendingCount} טראקים בהמתנה</p>
                 <p className="text-xs text-purple-200/70 leading-relaxed">אנחנו משתדלים לעבור על כל הטראקים תוך 72 שעות אבל יכול להיות שאנחנו מתעכבים, תחכה למייל מאיתנו</p>
               </div>
             </div>
           )}

          {/* Submissions Section */}
          <div className="glass-warm rounded-3xl p-5 sm:p-8">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0"><HiMusicNote className="text-xl text-white" /></div>
                <div><h2 className="text-lg sm:text-xl font-semibold text-white">הטראקים שלי</h2><p className="text-xs sm:text-sm text-gray-500">ניהול המוזיקה שלך</p></div>
              </div>
            </div>

            {submissions.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <div className="relative inline-block mb-6"><div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-2xl opacity-30 animate-pulse" /><div className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/20 flex items-center justify-center text-3xl sm:text-4xl"><FaMusic className="text-purple-400" /></div></div>
                <h3 className="text-xl sm:text-2xl font-semibold text-white mb-2">ריק פה...</h3>
                <p className="text-sm sm:text-base text-gray-400 mb-8 max-w-sm mx-auto leading-relaxed">עדיין לא העלית טראקים. זה הזמן להשמיע את המוזיקה שלך לעולם! 🎵</p>
                <Link href="/radio/submit" className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-2xl transition-all shadow-lg">העלה את הטראק הראשון</Link>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {submissions.map((submission) => (
                  <div key={submission.id} className="group relative bg-white/[0.02] hover:bg-white/[0.04] rounded-2xl p-4 sm:p-5 border border-white/5 transition-all">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-purple-600/30 to-pink-600/30 flex items-center justify-center text-purple-400/60"><FaMusic /></div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base font-medium text-white truncate">{submission.track_name}</h3>
                        <div className="mt-1 text-[10px] sm:text-sm text-gray-500 flex items-center gap-2">
                           <span className={`px-2 py-0.5 rounded-full font-bold ${submission.status === 'approved' ? 'text-green-400 bg-green-400/10' : submission.status === 'declined' ? 'text-red-400 bg-red-400/10' : 'text-yellow-400 bg-yellow-400/10'}`}>
                             {submission.status === 'approved' ? 'אושר' : submission.status === 'declined' ? 'נדחה' : 'ממתין'}
                           </span>
                           <span>•</span>
                           <span>{new Date(submission.submitted_at).toLocaleDateString('he-IL')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {submission.status !== 'approved' ? (
                          <button onClick={() => handleDeleteSubmission(submission.id)} className="p-2 sm:p-3 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-all border border-transparent hover:border-red-500/30" title="מחק טראק"><FaTrash className="text-xs sm:text-sm" /></button>
                        ) : (
                          <div className="p-2 text-gray-700" title="טראק פעיל ברדיו"><FaCheckCircle className="text-green-500/50" /></div>
                        )}
                      </div>
                    </div>
                    {submission.status === 'declined' && submission.admin_notes && (
                      <div className="mt-3 pt-3 border-t border-white/5 text-[11px] sm:text-sm text-red-400/80 flex items-start gap-2">💬 {submission.admin_notes}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* HIGH-VISIBILITY DISCLAIMER */}
          <div className="mt-8 flex items-center justify-center gap-3 text-gray-400 text-xs sm:text-sm bg-white/10 backdrop-blur-md py-4 px-6 rounded-3xl border border-white/10 shadow-lg">
            <FaInfoCircle className="text-purple-400 flex-shrink-0 text-base" />
            <span className="leading-relaxed">טראקים שאושרו נמצאים בסבב השידורים. להסרה מהרדיו, יש ליצור קשר עם הצוות.</span>
          </div>
        </div>
      </div>
    </>
  );
}

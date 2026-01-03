// pages/admin/radio.tsx - Aesthetic Admin Panel with Cascading View
import { useState, useEffect, useMemo, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { FaMusic, FaUser, FaCheck, FaTimes, FaDownload, FaClock, FaUpload, FaSpinner, FaInstagram, FaSoundcloud, FaEnvelope, FaChevronDown, FaChevronUp, FaTrash, FaLayerGroup, FaList, FaPlay, FaPause, FaVolumeUp } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

interface RadioArtist {
  id: string; name: string; slug: string; email: string; instagram: string | null;
  soundcloud: string | null; bio: string | null; image_url: string | null; approved: boolean; created_at: string;
}

interface Submission {
  id: string; artist_id: string; track_name: string; bpm: number | null; genre: string | null;
  description?: string; is_premiere?: boolean; mp3_url: string; art_url: string | null;
  status: 'pending' | 'approved' | 'declined'; admin_notes: string | null;
  submitted_at: string; radio_artists: RadioArtist;
}

const FloatingNotes = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="absolute text-purple-500/5 animate-float-slow" style={{ left: `${15 + i * 15}%`, top: `${20 + (i % 3) * 25}%`, animationDelay: `${i * 0.8}s`, fontSize: `${24 + i * 8}px` }}> ♪ </div>
    ))}
  </div>
);

// Global Audio Player State
function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    // Create audio element once
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.addEventListener('timeupdate', () => {
        if (audioRef.current) {
          setProgress(audioRef.current.currentTime);
          setDuration(audioRef.current.duration || 0);
        }
      });
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setProgress(0);
      });
      audioRef.current.addEventListener('play', () => setIsPlaying(true));
      audioRef.current.addEventListener('pause', () => setIsPlaying(false));
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const play = (url: string) => {
    if (!audioRef.current) return;
    
    if (currentUrl === url) {
      // Toggle play/pause for same track
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    } else {
      // New track
      audioRef.current.src = url;
      audioRef.current.play();
      setCurrentUrl(url);
      setProgress(0);
    }
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return { play, seek, currentUrl, isPlaying, progress, duration, formatTime };
}

export default function AdminRadioPage() {
  const [adminKey, setAdminKey] = useState('');
  const [isAuthed, setIsAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [artists, setArtists] = useState<RadioArtist[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [activeTab, setActiveTab] = useState<'submissions' | 'artists'>('submissions');
  const [viewMode, setViewMode] = useState<'list' | 'grouped'>('grouped'); 
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'declined'>('pending');
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const audioPlayer = useAudioPlayer();

  useEffect(() => {
    const storedKey = localStorage.getItem('adminKey') || localStorage.getItem('ADMIN_KEY');
    if (storedKey) { setAdminKey(storedKey); handleAuth(storedKey); }
  }, []);

  const handleAuth = async (key: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/radio?key=${key}`);
      const data = await res.json();
      if (data.ok) { 
        setIsAuthed(true); 
        localStorage.setItem('adminKey', key);
        localStorage.setItem('ADMIN_KEY', key);
        setArtists(data.artists || []); 
        setSubmissions(data.submissions || []); 
      }
      else { alert('מפתח שגוי'); localStorage.removeItem('adminKey'); }
    } catch (err) { alert('שגיאה בהתחברות'); }
    setLoading(false);
  };

  const refreshData = async () => {
    const res = await fetch(`/api/admin/radio?key=${adminKey}`);
    const data = await res.json();
    if (data.ok) { setArtists(data.artists || []); setSubmissions(data.submissions || []); }
  };

  const handleSubmissionAction = async (submissionId: string, action: 'approve' | 'decline' | 'delete', notes?: string) => {
    if (action === 'delete' && !confirm('בטוח שברצונך למחוק את הטראק לצמיתות?')) return;
    
    try {
      const res = await fetch('/api/admin/radio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: adminKey,
          action: action === 'delete' ? 'deleteSubmission' : 'updateSubmission',
          submissionId,
          status: action === 'approve' ? 'approved' : action === 'decline' ? 'declined' : undefined,
          adminNotes: notes || null,
        }),
      });
      if ((await res.json()).ok) await refreshData();
    } catch (err) { alert('שגיאה בעדכון'); }
  };

  const handleApproveAndUpload = async (submission: Submission) => {
    setUploadingId(submission.id);
    try {
      const res = await fetch('/api/admin/upload-to-azuracast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminKey: adminKey, submissionId: submission.id }),
      });
      const data = await res.json();
      if (res.ok && data.success) { setMessage({ type: 'success', text: `✅ ${data.message}` }); await refreshData(); }
      else setMessage({ type: 'error', text: `❌ ${data.error}` });
    } catch (err) { setMessage({ type: 'error', text: 'שגיאה בהעלאה' }); }
    setUploadingId(null);
  };

  const handleArtistApproval = async (artistId: string, approved: boolean) => {
    try {
      const res = await fetch('/api/admin/radio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: adminKey,
          action: 'updateArtist',
          artistId,
          approved,
        }),
      });

      const data = await res.json();
      if (data.ok) {
        await refreshData();
      } else {
        alert('שגיאה: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('שגיאה בעדכון');
    }
  };

  const groupedSubmissions = useMemo(() => {
    const filtered = submissions.filter(s => filter === 'all' || s.status === filter);
    if (viewMode === 'list') return { flat: filtered };
    
    return filtered.reduce((acc, sub) => {
      const artistName = sub.radio_artists?.name || 'Unknown Artist';
      if (!acc[artistName]) acc[artistName] = [];
      acc[artistName].push(sub);
      return acc;
    }, {} as Record<string, Submission[]>);
  }, [submissions, filter, viewMode]);

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-[#0a0a12] text-white flex items-center justify-center font-['Rubik']" dir="rtl">
        <div className="glass-warm rounded-3xl p-10 max-w-md w-full mx-4 border border-white/10 shadow-2xl">
          <h1 className="text-2xl font-bold mb-8 text-center">📻 ניהול רדיו</h1>
          <input type="password" value={adminKey} onChange={(e) => setAdminKey(e.target.value)} placeholder="מפתח אדמין" className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl mb-6 text-white focus:border-purple-500/50 outline-none" onKeyDown={(e) => e.key === 'Enter' && handleAuth(adminKey)} />
          <button onClick={() => handleAuth(adminKey)} disabled={loading} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 py-4 rounded-2xl font-bold transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50">
            {loading ? 'מתחבר...' : 'כניסה למערכת'}
          </button>
          <Link href="/admin" className="block text-center mt-6 text-gray-500 hover:text-white transition text-sm">
            ← חזרה לדף ניהול ראשי
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>ניהול רדיו | Admin Studio</title>
        <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <style jsx global>{`
        @keyframes float-slow { 0%, 100% { transform: translateY(0); opacity: 0.1; } 50% { transform: translateY(-20px); opacity: 0.2; } }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .glass-warm { background: linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(236, 72, 153, 0.05) 100%); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); }
      `}</style>

      <div className="min-h-screen bg-[#0a0a12] text-white font-['Rubik'] relative" dir="rtl">
        <FloatingNotes />

        <div className="relative z-10">
          {/* Header with Back Link */}
          <div className="bg-white/5 border-b border-white/5 px-6 py-5">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/admin" className="text-gray-500 hover:text-white transition text-sm flex items-center gap-2">
                  ← חזרה לניהול
                </Link>
                <div className="w-px h-5 bg-white/10" />
                <h1 className="text-2xl font-bold flex items-center gap-3">
                  <HiSparkles className="text-purple-500" /> 
                  ניהול רדיו
                </h1>
              </div>
              <div className="flex items-center gap-6">
                <Link href="/radio" className="text-sm text-purple-400 hover:text-purple-300 transition">
                  לרדיו →
                </Link>
                <button onClick={() => { localStorage.removeItem('adminKey'); setIsAuthed(false); }} className="text-sm text-gray-500 hover:text-white transition">
                  התנתק
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 py-10">
            {message && <div className={`mb-8 p-5 rounded-2xl border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>{message.text}</div>}

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              <div className="glass-warm rounded-2xl p-6">
                <div className="text-3xl font-bold text-purple-400">{artists.length}</div>
                <div className="text-gray-500 text-sm">אמנים</div>
              </div>
              <div className="glass-warm rounded-2xl p-6">
                <div className="text-3xl font-bold text-yellow-400">{submissions.filter(s => s.status === 'pending').length}</div>
                <div className="text-gray-500 text-sm">ממתינים</div>
              </div>
              <div className="glass-warm rounded-2xl p-6">
                <div className="text-3xl font-bold text-green-400">{submissions.filter(s => s.status === 'approved').length}</div>
                <div className="text-gray-500 text-sm">מאושרים</div>
              </div>
              <div className="glass-warm rounded-2xl p-6">
                <div className="text-3xl font-bold text-gray-400">{submissions.length}</div>
                <div className="text-gray-500 text-sm">סה״כ הגשות</div>
              </div>
            </div>

            {/* Tabs and Filters */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
              <div className="flex gap-4 p-1 bg-white/5 rounded-2xl">
                <button onClick={() => setActiveTab('submissions')} className={`px-8 py-3 rounded-xl transition ${activeTab === 'submissions' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'text-gray-500 hover:text-white'}`}>הגשות</button>
                <button onClick={() => setActiveTab('artists')} className={`px-8 py-3 rounded-xl transition ${activeTab === 'artists' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'text-gray-500 hover:text-white'}`}>אמנים</button>
              </div>

              {activeTab === 'submissions' && (
                <div className="flex items-center gap-4">
                  <div className="flex bg-white/5 rounded-xl p-1 border border-white/5">
                    <button onClick={() => setViewMode('grouped')} className={`p-2 rounded-lg transition ${viewMode === 'grouped' ? 'bg-white/10 text-purple-400' : 'text-gray-500'}`} title="תצוגה לפי אמנים"><FaLayerGroup /></button>
                    <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-white/10 text-purple-400' : 'text-gray-500'}`} title="תצוגת רשימה"><FaList /></button>
                  </div>
                  <div className="flex gap-2">
                    {(['pending', 'approved', 'declined', 'all'] as const).map(f => (
                      <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-xs transition border ${filter === f ? 'bg-white/10 border-white/20 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
                        {f === 'pending' ? 'ממתין' : f === 'approved' ? 'מאושר' : f === 'declined' ? 'נדחה' : 'הכל'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submissions Tab */}
            {activeTab === 'submissions' && (
              <div className="space-y-12">
                {Object.keys(groupedSubmissions).length === 0 ? (
                  <div className="text-center py-20 text-gray-600">אין הגשות בסטטוס הנבחר</div>
                ) : (
                  Object.entries(groupedSubmissions).map(([artistName, tracks]) => (
                    <div key={artistName} className="space-y-6">
                      {viewMode === 'grouped' && (
                        <h2 className="text-lg font-bold text-gray-400 flex items-center gap-3 border-r-4 border-purple-500 pr-4">{artistName} <span className="text-xs font-normal opacity-50">({tracks.length} טראקים)</span></h2>
                      )}
                      <div className="grid grid-cols-1 gap-4">
                        {tracks.map(sub => (
                          <SubmissionCard 
                            key={sub.id} 
                            submission={sub} 
                            uploadingId={uploadingId} 
                            audioPlayer={audioPlayer}
                            onApprove={() => handleSubmissionAction(sub.id, 'approve')} 
                            onApproveAndUpload={() => handleApproveAndUpload(sub)} 
                            onDecline={n => handleSubmissionAction(sub.id, 'decline', n)} 
                            onDelete={() => handleSubmissionAction(sub.id, 'delete')} 
                          />
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Artists Tab */}
            {activeTab === 'artists' && (
              <div className="grid grid-cols-1 gap-4">
                {artists.map(a => <ArtistCard key={a.id} artist={a} onToggleApproval={() => handleArtistApproval(a.id, !a.approved)} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function SubmissionCard({ submission, uploadingId, audioPlayer, onApprove, onApproveAndUpload, onDecline, onDelete }: any) {
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const isUploading = uploadingId === submission.id;
  
  const isCurrentTrack = audioPlayer.currentUrl === submission.mp3_url;
  const isPlaying = isCurrentTrack && audioPlayer.isPlaying;

  return (
    <div className="glass-warm rounded-[2rem] p-6 border border-white/5 hover:border-white/10 transition-all group">
      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
        {/* Play Button / Art */}
        <button 
          onClick={() => audioPlayer.play(submission.mp3_url)}
          className="relative w-16 h-16 rounded-2xl overflow-hidden bg-white/5 flex-shrink-0 group/play hover:scale-105 transition-transform"
        >
          {submission.art_url ? (
            <img src={submission.art_url} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-700">
              <FaMusic />
            </div>
          )}
          {/* Play/Pause Overlay */}
          <div className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity ${isCurrentTrack ? 'opacity-100' : 'opacity-0 group-hover/play:opacity-100'}`}>
            {isPlaying ? (
              <FaPause className="text-white text-xl" />
            ) : (
              <FaPlay className="text-white text-xl ml-1" />
            )}
          </div>
        </button>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
             {submission.is_premiere && <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-[10px] font-bold">PREMIERE 🚀</span>}
             <h3 className="font-bold text-xl text-white">{submission.track_name}</h3>
          </div>
          <p className="text-sm text-gray-500 mb-2">אמן: <span className="text-gray-300">{submission.radio_artists?.name}</span> • הוגש ב-{new Date(submission.submitted_at).toLocaleDateString('he-IL')}</p>
          {submission.description && <p className="text-xs text-gray-400 italic leading-relaxed bg-black/20 p-3 rounded-xl border border-white/5 max-w-2xl">{submission.description}</p>}
          
          {/* Progress Bar - Only show when this track is active */}
          {isCurrentTrack && (
           <div className="mt-4 flex items-center gap-3" dir="ltr">
              <span className="text-xs text-gray-500 w-10">{audioPlayer.formatTime(audioPlayer.progress)}</span>
              <div 
                className="flex-1 h-1.5 bg-white/10 rounded-full cursor-pointer overflow-hidden"
               onClick={(e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  audioPlayer.seek(percentage * audioPlayer.duration);
}}
              >
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                  style={{ width: `${audioPlayer.duration ? (audioPlayer.progress / audioPlayer.duration) * 100 : 0}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 w-10">{audioPlayer.formatTime(audioPlayer.duration)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
           <div className={`px-4 py-1.5 rounded-full text-xs font-medium ${submission.status === 'approved' ? 'bg-green-500/10 text-green-400' : submission.status === 'declined' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
             {submission.status === 'approved' ? 'מאושר' : submission.status === 'declined' ? 'נדחה' : 'ממתין'}
           </div>
        </div>

        <div className="flex items-center gap-3">
          <a href={submission.mp3_url} target="_blank" className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition text-gray-400 hover:text-white" title="הורד"><FaDownload /></a>
          
          {submission.status === 'pending' && (
            <>
              <button onClick={onApproveAndUpload} disabled={isUploading} className="p-3 bg-green-600/20 hover:bg-green-600 text-green-400 hover:text-white rounded-xl transition disabled:opacity-50" title="אשר והעלה לרדיו">{isUploading ? <FaSpinner className="animate-spin" /> : <FaUpload />}</button>
              <button onClick={onApprove} className="p-3 bg-white/5 hover:bg-green-600 text-gray-400 hover:text-white rounded-xl transition" title="אשר בלבד"><FaCheck /></button>
              <button onClick={() => setShowNotes(!showNotes)} className="p-3 bg-white/5 hover:bg-yellow-600 text-gray-400 hover:text-white rounded-xl transition" title="דחה עם הערה"><FaClock /></button>
            </>
          )}
          
          <button onClick={onDelete} className="p-3 bg-white/5 hover:bg-red-600 text-gray-500 hover:text-white rounded-xl transition" title="מחק"><FaTrash /></button>
        </div>
      </div>

      {showNotes && (
        <div className="mt-6 pt-6 border-t border-white/5">
          <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="הערות לאמן (אופציונלי)" className="w-full px-5 py-3 bg-black/40 border border-white/10 rounded-xl text-white mb-3 outline-none focus:border-purple-500/50" />
          <div className="flex gap-3">
             <button onClick={() => { onDecline(notes); setShowNotes(false); }} className="px-6 py-2 bg-red-600 rounded-xl text-sm font-bold">אשר דחייה</button>
             <button onClick={() => setShowNotes(false)} className="px-6 py-2 text-gray-500 text-sm">ביטול</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ArtistCard({ artist, onToggleApproval }: any) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="glass-warm rounded-3xl border border-white/5 overflow-hidden transition hover:border-white/10">
      <div className="p-6 flex flex-col md:flex-row md:items-center gap-6">
        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white/5 flex-shrink-0">
          {artist.image_url ? <img src={artist.image_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-700"><FaUser /></div>}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg">{artist.name}</h3>
          <p className="text-xs text-gray-500">{artist.email}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${artist.approved ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>{artist.approved ? 'מאושר' : 'ממתין'}</span>
          <button onClick={onToggleApproval} className={`px-6 py-2 rounded-xl text-xs font-bold transition ${artist.approved ? 'bg-red-600/10 text-red-400' : 'bg-green-600 text-white'}`}>{artist.approved ? 'בטל אישור' : 'אשר אמן'}</button>
          <button onClick={() => setExpanded(!expanded)} className="p-3 bg-white/5 rounded-xl text-gray-500">{expanded ? <FaChevronUp /> : <FaChevronDown />}</button>
        </div>
      </div>
      {expanded && (
        <div className="px-6 pb-6 pt-2 border-t border-white/5 bg-black/20 text-sm space-y-4">
           {artist.bio && <p className="text-gray-400 leading-relaxed"><span className="text-white font-bold ml-2">ביו:</span>{artist.bio}</p>}
           <div className="flex gap-4">
              {artist.instagram && <a href={`https://instagram.com/${artist.instagram}`} target="_blank" className="text-pink-400 flex items-center gap-2"><FaInstagram /> {artist.instagram}</a>}
              {artist.soundcloud && <a href={artist.soundcloud} target="_blank" className="text-orange-400 flex items-center gap-2"><FaSoundcloud /> SoundCloud</a>}
           </div>
        </div>
      )}
    </div>
  );
}

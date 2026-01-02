// pages/admin/radio.tsx - Admin panel for radio submissions
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { createClient } from '@supabase/supabase-js';
import Navigation from '@/components/Navigation';
import GoogleLoginButton from '@/components/GoogleLoginButton';
import { FaMusic, FaCheck, FaTimes, FaDownload, FaPlay, FaPause, FaUpload, FaSpinner } from 'react-icons/fa';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Admin emails
const ADMIN_EMAILS = ['tracktripil@gmail.com'];

interface Submission {
  id: string;
  track_name: string;
  bpm: number | null;
  genre: string | null;
  mp3_url: string;
  art_url: string | null;
  status: string;
  created_at: string;
  agreed_to_terms: boolean;
  agreed_at: string | null;
  radio_artists: {
    name: string;
    email: string;
    instagram: string | null;
  };
}

export default function AdminRadioPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute('dir', 'rtl');
    checkAuth();
  }, []);

  useEffect(() => {
    if (user && ADMIN_EMAILS.includes(user.email)) {
      fetchSubmissions();
    }
  }, [user, filter]);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    } catch (error) {
      console.error('Auth error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  };

  const fetchSubmissions = async () => {
    let query = supabase
      .from('radio_submissions')
      .select(`
        *,
        radio_artists (
          name,
          email,
          instagram
        )
      `)
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Fetch error:', error);
    }
    if (data) {
      setSubmissions(data);
    }
  };

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('radio_submissions')
      .update({ 
        status,
        ...(status === 'approved' ? { approved_at: new Date().toISOString() } : {})
      })
      .eq('id', id);

    if (!error) {
      fetchSubmissions();
    }
  };

  const approveAndUpload = async (submission: Submission) => {
    if (!user?.email) return;
    
    setUploadingId(submission.id);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/upload-to-azuracast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionId: submission.id,
          userEmail: user.email,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        fetchSubmissions();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to upload' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to upload' });
    } finally {
      setUploadingId(null);
    }
  };

  const togglePlay = (submission: Submission) => {
    if (playingId === submission.id) {
      audioRef?.pause();
      setPlayingId(null);
    } else {
      if (audioRef) {
        audioRef.pause();
      }
      const audio = new Audio(submission.mp3_url);
      audio.play();
      setAudioRef(audio);
      setPlayingId(submission.id);
      
      audio.onended = () => {
        setPlayingId(null);
      };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">טוען...</div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <>
        <Head>
          <title>ניהול רדיו | יוצאים לטראק</title>
        </Head>
        <div className="min-h-screen bg-gradient-to-b from-[#050814] via-[#0a0a1f] to-black text-white">
          <Navigation />
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6">
            <div className="text-5xl">🔐</div>
            <h1 className="text-2xl font-bold">התחברות נדרשת</h1>
            <GoogleLoginButton />
          </div>
        </div>
      </>
    );
  }

  // Not admin
  if (!ADMIN_EMAILS.includes(user.email)) {
    return (
      <>
        <Head>
          <title>ניהול רדיו | יוצאים לטראק</title>
        </Head>
        <div className="min-h-screen bg-gradient-to-b from-[#050814] via-[#0a0a1f] to-black text-white">
          <Navigation />
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
            <div className="text-5xl">🚫</div>
            <h1 className="text-2xl font-bold text-red-500">אין הרשאה</h1>
            <p className="text-gray-400">המשתמש {user.email} אינו מורשה לגשת לדף זה</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>ניהול רדיו | יוצאים לטראק</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-[#050814] via-[#0a0a1f] to-black text-white">
        <Navigation />
        
        <div className="max-w-6xl mx-auto p-8">
          <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <FaMusic className="text-purple-500" />
            ניהול הגשות לרדיו
          </h1>

          {/* Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-xl ${
              message.type === 'success' 
                ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                : 'bg-red-500/20 border border-red-500/50 text-red-400'
            }`}>
              {message.text}
            </div>
          )}

          {/* Filter tabs */}
          <div className="flex gap-2 mb-6">
            {(['pending', 'approved', 'rejected', 'all'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === f
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {f === 'pending' && 'ממתינים'}
                {f === 'approved' && 'אושרו'}
                {f === 'rejected' && 'נדחו'}
                {f === 'all' && 'הכל'}
              </button>
            ))}
            <span className="text-gray-500 self-center mr-4">
              ({submissions.length} הגשות)
            </span>
          </div>

          {/* Submissions list */}
          <div className="space-y-4">
            {submissions.length === 0 ? (
              <div className="text-center text-gray-500 py-12 bg-gray-900/30 rounded-xl">
                אין הגשות {filter === 'pending' ? 'ממתינות' : ''}
              </div>
            ) : (
              submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="bg-gray-900/50 border border-gray-800 rounded-xl p-6"
                >
                  <div className="flex items-start gap-4">
                    {/* Album art */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                      {submission.art_url ? (
                        <img
                          src={submission.art_url}
                          alt={submission.track_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FaMusic className="text-gray-600 text-2xl" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold">{submission.track_name}</h3>
                      <p className="text-purple-400">{submission.radio_artists?.name}</p>
                      <div className="flex gap-4 text-sm text-gray-500 mt-1">
                        {submission.bpm && <span>BPM: {submission.bpm}</span>}
                        {submission.genre && <span>{submission.genre}</span>}
                        <span>{new Date(submission.created_at).toLocaleDateString('he-IL')}</span>
                      </div>
                      {submission.radio_artists?.instagram && (
                        <p className="text-sm text-gray-500">
                          Instagram: {submission.radio_artists.instagram}
                        </p>
                      )}
                      {submission.agreed_to_terms && (
                        <p className="text-xs text-green-500 mt-1">
                          ✓ הסכים לתנאים ({submission.agreed_at ? new Date(submission.agreed_at).toLocaleString('he-IL') : ''})
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      {/* Play button */}
                      <button
                        onClick={() => togglePlay(submission)}
                        className="p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                        title="נגן"
                      >
                        {playingId === submission.id ? (
                          <FaPause className="text-purple-400" />
                        ) : (
                          <FaPlay className="text-purple-400" />
                        )}
                      </button>

                      {/* Download button */}
                      <a
                        href={submission.mp3_url}
                        download
                        className="p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-center"
                        title="הורד"
                      >
                        <FaDownload className="text-blue-400" />
                      </a>

                      {submission.status === 'pending' && (
                        <>
                          {/* Approve & Upload button */}
                          <button
                            onClick={() => approveAndUpload(submission)}
                            disabled={uploadingId === submission.id}
                            className="p-3 rounded-lg bg-green-600 hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="אשר והעלה לרדיו"
                          >
                            {uploadingId === submission.id ? (
                              <FaSpinner className="text-white animate-spin" />
                            ) : (
                              <FaUpload className="text-white" />
                            )}
                          </button>

                          {/* Just approve button */}
                          <button
                            onClick={() => updateStatus(submission.id, 'approved')}
                            className="p-3 rounded-lg bg-gray-800 hover:bg-green-600 transition-colors"
                            title="אשר בלבד"
                          >
                            <FaCheck className="text-green-400" />
                          </button>

                          {/* Reject button */}
                          <button
                            onClick={() => updateStatus(submission.id, 'rejected')}
                            className="p-3 rounded-lg bg-gray-800 hover:bg-red-600 transition-colors"
                            title="דחה"
                          >
                            <FaTimes className="text-red-400" />
                          </button>
                        </>
                      )}

                      {/* Status badge */}
                      <div className={`text-xs text-center py-1 px-2 rounded ${
                        submission.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                        submission.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {submission.status === 'approved' && 'אושר'}
                        {submission.status === 'rejected' && 'נדחה'}
                        {submission.status === 'pending' && 'ממתין'}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}

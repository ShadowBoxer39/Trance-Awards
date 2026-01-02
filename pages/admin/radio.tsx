// pages/admin/radio.tsx - Admin panel for radio submissions
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { FaMusic, FaUser, FaCheck, FaTimes, FaDownload, FaClock, FaUpload, FaSpinner, FaInstagram, FaSoundcloud, FaEnvelope, FaChevronDown, FaChevronUp } from 'react-icons/fa';

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
  bio: string | null;
  image_url: string | null;
  approved: boolean;
  created_at: string;
}

interface Submission {
  id: string;
  artist_id: string;
  track_name: string;
  bpm: number | null;
  genre: string | null;
  mp3_url: string;
  art_url: string | null;
  download_link: string | null;
  status: 'pending' | 'approved' | 'declined';
  admin_notes: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  agreed_to_terms: boolean;
  agreed_at: string | null;
  radio_artists: RadioArtist;
}

export default function AdminRadioPage() {
  const [adminKey, setAdminKey] = useState('');
  const [isAuthed, setIsAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [artists, setArtists] = useState<RadioArtist[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [activeTab, setActiveTab] = useState<'submissions' | 'artists'>('submissions');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'declined'>('pending');
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // Check if admin key is stored
    const storedKey = localStorage.getItem('adminKey');
    if (storedKey) {
      setAdminKey(storedKey);
      handleAuth(storedKey);
    }
  }, []);

  const handleAuth = async (key: string) => {
    setLoading(true);
    try {
      // Test the key by fetching data
      const res = await fetch(`/api/admin/radio?key=${key}`);
      const data = await res.json();
      
      if (data.ok) {
        setIsAuthed(true);
        localStorage.setItem('adminKey', key);
        setArtists(data.artists || []);
        setSubmissions(data.submissions || []);
      } else {
        alert('מפתח שגוי');
        localStorage.removeItem('adminKey');
      }
    } catch (err) {
      console.error(err);
      alert('שגיאה בהתחברות');
    }
    setLoading(false);
  };

  const refreshData = async () => {
    const res = await fetch(`/api/admin/radio?key=${adminKey}`);
    const data = await res.json();
    if (data.ok) {
      setArtists(data.artists || []);
      setSubmissions(data.submissions || []);
    }
  };

  const handleSubmissionAction = async (submissionId: string, action: 'approve' | 'decline', notes?: string) => {
    try {
      const res = await fetch('/api/admin/radio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: adminKey,
          action: 'updateSubmission',
          submissionId,
          status: action === 'approve' ? 'approved' : 'declined',
          adminNotes: notes || null,
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

  // Approve and upload to Azuracast
  const handleApproveAndUpload = async (submission: Submission) => {
    setUploadingId(submission.id);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/upload-to-azuracast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminKey: adminKey,
          submissionId: submission.id,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage({ type: 'success', text: `✅ ${data.message}` });
        await refreshData();
      } else {
        setMessage({ type: 'error', text: `❌ ${data.error || 'שגיאה בהעלאה'}` });
      }
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: `❌ שגיאה: ${err.message}` });
    } finally {
      setUploadingId(null);
    }
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

  const filteredSubmissions = submissions.filter(s => {
    if (filter === 'all') return true;
    return s.status === filter;
  });

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center" dir="rtl">
        <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full mx-4">
          <h1 className="text-2xl font-bold mb-6 text-center">ניהול רדיו</h1>
          <input
            type="password"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            placeholder="מפתח אדמין"
            className="w-full px-4 py-3 bg-black border border-gray-700 rounded-xl mb-4 text-white"
            onKeyDown={(e) => e.key === 'Enter' && handleAuth(adminKey)}
          />
          <button
            onClick={() => handleAuth(adminKey)}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-500 py-3 rounded-xl font-bold disabled:opacity-50"
          >
            {loading ? 'מתחבר...' : 'כניסה'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>ניהול רדיו | Admin</title>
      </Head>

      <div className="min-h-screen bg-black text-white" dir="rtl">
        {/* Header */}
        <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-2xl font-bold">🎵 ניהול רדיו</h1>
            <div className="flex items-center gap-4">
              <Link href="/radio" className="text-purple-400 hover:text-purple-300">
                לרדיו →
              </Link>
              <button
                onClick={() => {
                  localStorage.removeItem('adminKey');
                  setIsAuthed(false);
                }}
                className="text-gray-400 hover:text-white"
              >
                התנתק
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
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

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-900 rounded-xl p-4">
              <div className="text-3xl font-bold text-purple-400">{artists.length}</div>
              <div className="text-gray-400 text-sm">אמנים רשומים</div>
            </div>
            <div className="bg-gray-900 rounded-xl p-4">
              <div className="text-3xl font-bold text-yellow-400">
                {submissions.filter(s => s.status === 'pending').length}
              </div>
              <div className="text-gray-400 text-sm">ממתינים לאישור</div>
            </div>
            <div className="bg-gray-900 rounded-xl p-4">
              <div className="text-3xl font-bold text-green-400">
                {submissions.filter(s => s.status === 'approved').length}
              </div>
              <div className="text-gray-400 text-sm">טראקים מאושרים</div>
            </div>
            <div className="bg-gray-900 rounded-xl p-4">
              <div className="text-3xl font-bold text-gray-400">{submissions.length}</div>
              <div className="text-gray-400 text-sm">סה״כ הגשות</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab('submissions')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                activeTab === 'submissions'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <FaMusic className="inline ml-2" />
              הגשות ({submissions.length})
            </button>
            <button
              onClick={() => setActiveTab('artists')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                activeTab === 'artists'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <FaUser className="inline ml-2" />
              אמנים ({artists.length})
            </button>
          </div>

          {/* Submissions Tab */}
          {activeTab === 'submissions' && (
            <>
              {/* Filter */}
              <div className="flex gap-2 mb-6">
                {(['pending', 'approved', 'declined', 'all'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-lg text-sm transition ${
                      filter === f
                        ? 'bg-gray-700 text-white'
                        : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
                    }`}
                  >
                    {f === 'pending' && '⏳ ממתין'}
                    {f === 'approved' && '✅ מאושר'}
                    {f === 'declined' && '❌ נדחה'}
                    {f === 'all' && '📋 הכל'}
                  </button>
                ))}
              </div>

              {/* Submissions List */}
              <div className="space-y-4">
                {filteredSubmissions.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    אין הגשות {filter !== 'all' && `בסטטוס "${filter}"`}
                  </div>
                ) : (
                  filteredSubmissions.map((submission) => (
                    <SubmissionCard
                      key={submission.id}
                      submission={submission}
                      uploadingId={uploadingId}
                      onApprove={() => handleSubmissionAction(submission.id, 'approve')}
                      onApproveAndUpload={() => handleApproveAndUpload(submission)}
                      onDecline={(notes) => handleSubmissionAction(submission.id, 'decline', notes)}
                    />
                  ))
                )}
              </div>
            </>
          )}

          {/* Artists Tab */}
          {activeTab === 'artists' && (
            <div className="space-y-4">
              {artists.length === 0 ? (
                <div className="text-center py-12 text-gray-500">אין אמנים רשומים</div>
              ) : (
                artists.map((artist) => (
                  <ArtistCard
                    key={artist.id}
                    artist={artist}
                    onToggleApproval={() => handleArtistApproval(artist.id, !artist.approved)}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Submission Card Component
function SubmissionCard({
  submission,
  uploadingId,
  onApprove,
  onApproveAndUpload,
  onDecline,
}: {
  submission: Submission;
  uploadingId: string | null;
  onApprove: () => void;
  onApproveAndUpload: () => void;
  onDecline: (notes?: string) => void;
}) {
  const [showDeclineNotes, setShowDeclineNotes] = useState(false);
  const [declineNotes, setDeclineNotes] = useState('');
  const [expanded, setExpanded] = useState(false);
  const isUploading = uploadingId === submission.id;

  const handleDecline = () => {
    onDecline(declineNotes || undefined);
    setShowDeclineNotes(false);
    setDeclineNotes('');
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Album Art */}
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
          {submission.art_url ? (
            <img
              src={submission.art_url}
              alt={submission.track_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FaMusic className="text-gray-600 text-xl" />
            </div>
          )}
        </div>

        {/* Artist Info */}
        <div className="flex items-center gap-3 min-w-[200px]">
          {submission.radio_artists?.image_url ? (
            <img
              src={submission.radio_artists.image_url}
              alt={submission.radio_artists.name}
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
              <FaUser className="text-gray-500" />
            </div>
          )}
          <div>
            <div className="font-bold">{submission.radio_artists?.name}</div>
            <div className="text-sm text-gray-500">{submission.radio_artists?.email}</div>
          </div>
        </div>

        {/* Track Info */}
        <div className="flex-1">
          <div className="font-bold text-lg text-purple-400">{submission.track_name}</div>
          <div className="text-sm text-gray-400 flex flex-wrap gap-3">
            {submission.bpm && <span>{submission.bpm} BPM</span>}
            {submission.genre && <span>{submission.genre}</span>}
            <span>{new Date(submission.submitted_at).toLocaleDateString('he-IL')}</span>
          </div>
          {submission.agreed_to_terms && (
            <div className="text-xs text-green-500 mt-1">
              ✓ הסכים לתנאים {submission.agreed_at && `(${new Date(submission.agreed_at).toLocaleString('he-IL')})`}
            </div>
          )}
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {submission.status === 'pending' && (
            <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-sm flex items-center gap-1">
              <FaClock /> ממתין
            </span>
          )}
          {submission.status === 'approved' && (
            <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm flex items-center gap-1">
              <FaCheck /> מאושר
            </span>
          )}
          {submission.status === 'declined' && (
            <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-sm flex items-center gap-1">
              <FaTimes /> נדחה
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Download Button */}
          <a
            href={submission.mp3_url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
            title="הורד"
          >
            <FaDownload />
          </a>

          {submission.status === 'pending' && (
            <>
              {/* Approve & Upload Button */}
              <button
                onClick={onApproveAndUpload}
                disabled={isUploading}
                className="p-2 bg-green-600 hover:bg-green-500 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                title="אשר והעלה לרדיו"
              >
                {isUploading ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaUpload />
                )}
              </button>

              {/* Just Approve Button */}
              <button
                onClick={onApprove}
                className="p-2 bg-gray-700 hover:bg-green-600 rounded-lg transition"
                title="אשר בלבד"
              >
                <FaCheck />
              </button>

              {/* Decline Button */}
              <button
                onClick={() => setShowDeclineNotes(!showDeclineNotes)}
                className="p-2 bg-gray-700 hover:bg-red-600 rounded-lg transition"
                title="דחה"
              >
                <FaTimes />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Decline Notes Input */}
      {showDeclineNotes && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <input
            type="text"
            value={declineNotes}
            onChange={(e) => setDeclineNotes(e.target.value)}
            placeholder="סיבת הדחייה (אופציונלי)"
            className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white mb-2"
          />
          <div className="flex gap-2">
            <button
              onClick={handleDecline}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm"
            >
              אשר דחייה
            </button>
            <button
              onClick={() => setShowDeclineNotes(false)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
            >
              ביטול
            </button>
          </div>
        </div>
      )}

      {/* Admin Notes (if declined) */}
      {submission.status === 'declined' && submission.admin_notes && (
        <div className="mt-4 pt-4 border-t border-gray-800 text-sm text-red-400">
          סיבת דחייה: {submission.admin_notes}
        </div>
      )}
    </div>
  );
}

// Artist Card Component with expanded details
function ArtistCard({
  artist,
  onToggleApproval,
}: {
  artist: RadioArtist;
  onToggleApproval: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      {/* Main Row */}
      <div className="p-6">
        <div className="flex items-center gap-4">
          {artist.image_url ? (
            <img
              src={artist.image_url}
              alt={artist.name}
              className="w-14 h-14 rounded-full"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center">
              <FaUser className="text-gray-500 text-xl" />
            </div>
          )}

          <div className="flex-1">
            <div className="font-bold text-lg">{artist.name}</div>
            <div className="text-sm text-gray-400">{artist.email}</div>
            <div className="text-xs text-gray-500">
              נרשם {new Date(artist.created_at).toLocaleDateString('he-IL')}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick info badges */}
            {artist.instagram && (
              <span className="text-pink-400" title={artist.instagram}>
                <FaInstagram />
              </span>
            )}
            {artist.soundcloud && (
              <span className="text-orange-400" title={artist.soundcloud}>
                <FaSoundcloud />
              </span>
            )}

            <span
              className={`px-3 py-1 rounded-full text-sm ${
                artist.approved
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}
            >
              {artist.approved ? '✓ מאושר' : '⏳ ממתין'}
            </span>

            <button
              onClick={onToggleApproval}
              className={`px-4 py-2 rounded-lg text-sm transition ${
                artist.approved
                  ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
                  : 'bg-green-600 text-white hover:bg-green-500'
              }`}
            >
              {artist.approved ? 'בטל אישור' : 'אשר אמן'}
            </button>

            {/* Expand button */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
              title="פרטים נוספים"
            >
              {expanded ? <FaChevronUp /> : <FaChevronDown />}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-6 pb-6 pt-2 border-t border-gray-800 bg-gray-800/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email */}
            <div className="flex items-center gap-3">
              <FaEnvelope className="text-gray-500" />
              <div>
                <div className="text-xs text-gray-500">אימייל</div>
                <div className="text-sm">{artist.email}</div>
              </div>
            </div>

            {/* Instagram */}
            <div className="flex items-center gap-3">
              <FaInstagram className="text-pink-400" />
              <div>
                <div className="text-xs text-gray-500">אינסטגרם</div>
                <div className="text-sm">
                  {artist.instagram ? (
                    <a 
                      href={`https://instagram.com/${artist.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-400 hover:underline"
                    >
                      {artist.instagram}
                    </a>
                  ) : (
                    <span className="text-gray-600">לא צוין</span>
                  )}
                </div>
              </div>
            </div>

            {/* SoundCloud */}
            <div className="flex items-center gap-3">
              <FaSoundcloud className="text-orange-400" />
              <div>
                <div className="text-xs text-gray-500">SoundCloud</div>
                <div className="text-sm">
                  {artist.soundcloud ? (
                    <a 
                      href={artist.soundcloud.startsWith('http') ? artist.soundcloud : `https://soundcloud.com/${artist.soundcloud}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-400 hover:underline"
                    >
                      {artist.soundcloud}
                    </a>
                  ) : (
                    <span className="text-gray-600">לא צוין</span>
                  )}
                </div>
              </div>
            </div>

            {/* Slug */}
            <div className="flex items-center gap-3">
              <FaUser className="text-gray-500" />
              <div>
                <div className="text-xs text-gray-500">Slug</div>
                <div className="text-sm text-gray-400">{artist.slug}</div>
              </div>
            </div>
          </div>

          {/* Bio */}
          {artist.bio && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="text-xs text-gray-500 mb-1">ביו</div>
              <div className="text-sm text-gray-300">{artist.bio}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

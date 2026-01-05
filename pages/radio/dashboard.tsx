// pages/radio/dashboard.tsx
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import Navigation from '@/components/Navigation';
import { 
  FaCloudUploadAlt, FaMusic, FaCheckCircle, FaClock, FaTimesCircle, 
  FaInstagram, FaSoundcloud, FaSignOutAlt, FaEdit, FaSpinner, FaSave, FaArrowLeft
} from 'react-icons/fa';

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface RadioArtist {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  image_url: string | null;
  instagram: string | null;
  soundcloud: string | null;
  approved: boolean;
}

interface Submission {
  id: string;
  track_name: string;
  status: 'pending' | 'approved' | 'declined';
  submitted_at: string;
  admin_notes?: string;
}

export default function ArtistDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [artist, setArtist] = useState<RadioArtist | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  
  // NEW: Toggle between "View Dashboard" and "Edit Profile"
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/radio/register');
      return;
    }
    setUser(user);
    fetchArtistData(user.id);
  };

  const fetchArtistData = async (userId: string) => {
    try {
      // 1. Fetch Artist Profile
      const { data: artistData, error } = await supabase
        .from('radio_artists')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (artistData) {
        setArtist(artistData);
        
        // 2. Fetch Submissions (Only if artist exists)
        const { data: tracks } = await supabase
          .from('radio_submissions')
          .select('*')
          .eq('artist_id', artistData.id)
          .order('submitted_at', { ascending: false });
          
        setSubmissions(tracks || []);
      }
    } catch (error) {
      console.log('No artist profile found yet');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/radio/register');
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a12] text-white flex items-center justify-center">
      <FaSpinner className="text-4xl text-purple-600 animate-spin" />
    </div>
  );

  return (
    <>
      <Head><title>Dashboard | Track Trip Radio</title></Head>
      
      <div className="min-h-screen bg-[#0a0a12] text-white font-['Rubik'] pb-20">
        <Navigation />

        <div className="max-w-4xl mx-auto px-6 py-12">
          
          {/* HEADER SECTION */}
          <div className="flex justify-between items-center mb-12">
            <div>
              <h1 className="text-3xl font-bold mb-2">Artist Dashboard</h1>
              <p className="text-gray-400">Manage your profile and submissions</p>
            </div>
            <button onClick={handleSignOut} className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition">
              <FaSignOutAlt /> Sign Out
            </button>
          </div>

          {/* MAIN CONTENT LOGIC */}
          {(!artist || isEditing) ? (
            // SHOW FORM: If no profile exists OR user clicked "Edit"
            <ProfileForm 
              user={user} 
              initialData={artist} 
              onCancel={artist ? () => setIsEditing(false) : undefined} // Only show cancel if they already have a profile
              onSuccess={() => {
                setIsEditing(false);
                fetchArtistData(user.id);
              }} 
            />
          ) : (
            // SHOW DASHBOARD: View Stats & Tracks
            <div className="grid gap-8 animate-fade-in">
              
              {/* Artist Card */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                
                {/* Avatar */}
                <div className="relative w-32 h-32 rounded-full border-4 border-white/5 overflow-hidden flex-shrink-0 shadow-2xl">
                  {artist.image_url ? (
                    <img src={artist.image_url} className="w-full h-full object-cover" alt={artist.name} />
                  ) : (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center"><FaMusic className="text-3xl text-gray-600" /></div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left z-10">
                  <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                    <h2 className="text-3xl font-bold">{artist.name}</h2>
                    {/* EDIT BUTTON */}
                    <button 
                      onClick={() => setIsEditing(true)} 
                      className="p-2 bg-white/5 hover:bg-white/20 rounded-full text-gray-400 hover:text-white transition"
                      title="Edit Profile"
                    >
                      <FaEdit />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${artist.approved ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                      {artist.approved ? 'Verified Artist' : 'Pending Verification'}
                    </span>
                    {artist.instagram && <a href={`https://instagram.com/${artist.instagram}`} target="_blank" className="text-gray-400 hover:text-pink-400"><FaInstagram /></a>}
                    {artist.soundcloud && <a href={artist.soundcloud} target="_blank" className="text-gray-400 hover:text-orange-400"><FaSoundcloud /></a>}
                  </div>
                  
                  {artist.bio && <p className="text-gray-400 text-sm max-w-xl line-clamp-2">{artist.bio}</p>}
                </div>
              </div>

              {/* Submissions Section */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">Your Tracks</h3>
                  <button 
                    onClick={() => router.push('/radio/submit')}
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 px-6 py-2.5 rounded-xl font-bold transition shadow-lg shadow-purple-900/20"
                  >
                    <FaCloudUploadAlt /> Submit New Track
                  </button>
                </div>

                <div className="space-y-4">
                  {submissions.length === 0 ? (
                    <div className="text-center py-12 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                      <FaMusic className="mx-auto text-4xl text-gray-700 mb-4" />
                      <p className="text-gray-500">No tracks submitted yet.</p>
                    </div>
                  ) : (
                    submissions.map(track => (
                      <div key={track.id} className="bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl p-5 flex items-center justify-between transition group">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                            track.status === 'approved' ? 'bg-green-500/10 text-green-400' : 
                            track.status === 'declined' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'
                          }`}>
                            {track.status === 'approved' ? <FaCheckCircle /> : track.status === 'declined' ? <FaTimesCircle /> : <FaClock />}
                          </div>
                          <div>
                            <h4 className="font-bold">{track.track_name}</h4>
                            <p className="text-xs text-gray-500">{new Date(track.submitted_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        {track.status === 'declined' && track.admin_notes && (
                           <span className="hidden md:block text-xs text-red-400 bg-red-500/10 px-3 py-1 rounded-full">Note: {track.admin_notes}</span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </>
  );
}

// === SUB-COMPONENT: PROFILE FORM (Handles Create & Update) ===
function ProfileForm({ user, initialData, onSuccess, onCancel }: { user: any, initialData?: RadioArtist | null, onSuccess: () => void, onCancel?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    bio: initialData?.bio || '',
    instagram: initialData?.instagram || '',
    soundcloud: initialData?.soundcloud || '',
    image_url: initialData?.image_url || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (initialData) {
        // === UPDATE EXISTING ===
        const { error } = await supabase
          .from('radio_artists')
          .update({
            name: formData.name,
            bio: formData.bio,
            instagram: formData.instagram,
            soundcloud: formData.soundcloud,
            image_url: formData.image_url
          })
          .eq('id', initialData.id);

        if (error) throw error;
      } else {
        // === CREATE NEW ===
        // Generate slug from name (simple version)
        const slug = formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        
        const { error } = await supabase
          .from('radio_artists')
          .insert({
            user_id: user.id,
            name: formData.name,
            slug: slug, // NOTE: We will improve duplicate handling in the next step
            bio: formData.bio,
            instagram: formData.instagram,
            soundcloud: formData.soundcloud,
            image_url: formData.image_url,
            email: user.email
          });

        if (error) throw error;
      }
      
      onSuccess();
    } catch (error) {
      alert('Error saving profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-warm rounded-3xl p-8 border border-white/10 animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold">{initialData ? 'Edit Profile' : 'Create Artist Profile'}</h2>
        {onCancel && (
          <button onClick={onCancel} className="text-sm text-gray-500 hover:text-white flex items-center gap-2">
            <FaArrowLeft /> Cancel
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Artist Name *</label>
          <input 
            required
            type="text" 
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition"
            placeholder="e.g. Infected Mushroom"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Bio</label>
          <textarea 
            rows={4}
            value={formData.bio}
            onChange={e => setFormData({...formData, bio: e.target.value})}
            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition"
            placeholder="Tell us about yourself..."
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Instagram (Username)</label>
            <div className="relative">
              <span className="absolute left-4 top-4 text-gray-500">@</span>
              <input 
                type="text" 
                value={formData.instagram}
                onChange={e => setFormData({...formData, instagram: e.target.value.replace('@', '')})}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 pl-10 text-white focus:border-purple-500 outline-none transition"
                placeholder="username"
              />
            </div>
          </div>
          <div>
             <label className="block text-sm text-gray-400 mb-2">SoundCloud (Full URL)</label>
             <input 
                type="url" 
                value={formData.soundcloud}
                onChange={e => setFormData({...formData, soundcloud: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition"
                placeholder="https://soundcloud.com/..."
              />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Profile Image URL</label>
          <input 
            type="url" 
            value={formData.image_url}
            onChange={e => setFormData({...formData, image_url: e.target.value})}
            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition"
            placeholder="https://..."
          />
          <p className="text-xs text-gray-600 mt-2">Tip: You can use a direct link from Google Drive or Dropbox.</p>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 py-4 rounded-xl font-bold text-lg hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <FaSpinner className="animate-spin" /> : <><FaSave /> Save Profile</>}
        </button>
      </form>
    </div>
  );
}

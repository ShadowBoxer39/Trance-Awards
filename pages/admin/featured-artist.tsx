import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from "@supabase/supabase-js";
import Image from 'next/image';

interface FeaturedArtist {
  id: number;
  artist_id: string;
  name: string;
  stage_name: string;
  bio: string;
  profile_photo_url: string;
  soundcloud_track_url: string;
  instagram_url?: string;
  soundcloud_profile_url?: string;
  spotify_url?: string;
  featured_at: string;
}

interface FormData {
  artist_id: string;
  name: string;
  stage_name: string;
  bio: string;
  profile_photo_url: string;
  soundcloud_track_url: string;
  instagram_url: string;
  soundcloud_profile_url: string;
  spotify_url: string;
}

export default function FeaturedArtistAdmin() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentArtist, setCurrentArtist] = useState<FeaturedArtist | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState('');

  const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
  
  const [formData, setFormData] = useState<FormData>({
    artist_id: '',
    name: '',
    stage_name: '',
    bio: '',
    profile_photo_url: '',
    soundcloud_track_url: '',
    instagram_url: '',
    soundcloud_profile_url: '',
    spotify_url: ''
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

  useEffect(() => {
    checkAuth();
    fetchCurrentArtist();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/admin');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      router.push('/admin');
      return;
    }

    setIsAdmin(true);
    setLoading(false);
  };

  const fetchCurrentArtist = async () => {
    const { data, error } = await supabase
      .from('featured_artists')
      .select('*')
      .order('featured_at', { ascending: false })
      .limit(1)
      .single();

    if (data) {
      setCurrentArtist(data);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const uploadToImgur = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        Authorization: 'Client-ID 546c25a59c58ad7',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data.data.link;
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
      alert('רק קבצי JPG או PNG מותרים');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('גודל הקובץ חייב להיות עד 5MB');
      return;
    }

    setUploadingPhoto(true);
    
    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Imgur
      const url = await uploadToImgur(file);
      setFormData(prev => ({ ...prev, profile_photo_url: url }));
      setErrors(prev => ({ ...prev, profile_photo_url: undefined }));
    } catch (error) {
      console.error('Upload error:', error);
      alert('שגיאה בהעלאת התמונה. נסה שוב.');
      setPhotoPreview('');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.artist_id.trim()) {
      newErrors.artist_id = 'שדה חובה';
    } else if (!/^[a-z0-9_-]+$/.test(formData.artist_id)) {
      newErrors.artist_id = 'רק אותיות אנגלית קטנות, מספרים, מקף ומקף תחתון';
    }

    if (!formData.name.trim()) newErrors.name = 'שדה חובה';
    if (!formData.stage_name.trim()) newErrors.stage_name = 'שדה חובה';
    
    if (!formData.bio.trim()) {
      newErrors.bio = 'שדה חובה';
    } else if (formData.bio.length < 50) {
      newErrors.bio = `צריך לפחות 50 תווים (כרגע: ${formData.bio.length})`;
    } else if (formData.bio.length > 1000) {
      newErrors.bio = `מקסימום 1000 תווים (כרגע: ${formData.bio.length})`;
    }

    if (!formData.profile_photo_url.trim()) newErrors.profile_photo_url = 'שדה חובה';
    if (!formData.soundcloud_track_url.trim()) newErrors.soundcloud_track_url = 'שדה חובה';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert('יש למלא את כל השדות החובה');
      return;
    }

    setShowConfirmDialog(true);
  };

  const confirmSubmit = async () => {
    setShowConfirmDialog(false);
    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('featured_artists')
        .insert([{
          artist_id: formData.artist_id.toLowerCase().trim(),
          name: formData.name.trim(),
          stage_name: formData.stage_name.trim(),
          bio: formData.bio.trim(),
          profile_photo_url: formData.profile_photo_url.trim(),
          soundcloud_track_url: formData.soundcloud_track_url.trim(),
          instagram_url: formData.instagram_url.trim() || null,
          soundcloud_profile_url: formData.soundcloud_profile_url.trim() || null,
          spotify_url: formData.spotify_url.trim() || null,
          featured_at: new Date().toISOString()
        }]);

      if (error) {
        if (error.code === '23505') { // Unique violation
          alert('שגיאה: Artist ID כבר קיים במערכת');
        } else {
          throw error;
        }
        return;
      }

      alert('האמן הוצג בהצלחה! ✨');
      
      // Reset form
      setFormData({
        artist_id: '',
        name: '',
        stage_name: '',
        bio: '',
        profile_photo_url: '',
        soundcloud_track_url: '',
        instagram_url: '',
        soundcloud_profile_url: '',
        spotify_url: ''
      });
      setPhotoPreview('');
      
      // Refresh current artist
      fetchCurrentArtist();
      
      // Redirect to featured artist page
      router.push('/featured-artist');
    } catch (error) {
      console.error('Error:', error);
      alert('שגיאה בשמירת האמן. נסה שוב.');
    } finally {
      setSubmitting(false);
    }
  };

  const bioLength = formData.bio.length;
  const bioColor = bioLength < 50 ? 'text-red-500' : bioLength > 1000 ? 'text-red-500' : 'text-green-500';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">טוען...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin')}
            className="text-purple-300 hover:text-white mb-4 flex items-center gap-2"
          >
            ← חזרה לדף ניהול
          </button>
          <h1 className="text-4xl font-bold mb-2">ניהול אמן מוצג</h1>
          <p className="text-purple-200">העלה אמן חדש - האמן יוצג מיד באתר</p>
        </div>

        {/* Current Artist Display */}
        {currentArtist && (
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 mb-8 border border-purple-500/30">
            <h2 className="text-2xl font-bold mb-4">האמן הנוכחי</h2>
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24 rounded-full overflow-hidden">
                <Image
                  src={currentArtist.profile_photo_url}
                  alt={currentArtist.stage_name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold">{currentArtist.stage_name}</h3>
                <p className="text-purple-200">{currentArtist.name}</p>
                <p className="text-sm text-purple-300 mt-2">
                  מוצג מאז: {new Date(currentArtist.featured_at).toLocaleDateString('he-IL')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-purple-500/30">
          <h2 className="text-2xl font-bold mb-6">הוספת אמן חדש</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Artist ID */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Artist ID * <span className="text-xs text-purple-300">(אנגלית קטנה, ללא רווחים)</span>
              </label>
              <input
                type="text"
                name="artist_id"
                value={formData.artist_id}
                onChange={handleInputChange}
                placeholder="kanok"
                className="w-full px-4 py-2 bg-white/5 border border-purple-500/30 rounded-lg focus:border-purple-500 focus:outline-none"
                dir="ltr"
              />
              {errors.artist_id && <p className="text-red-400 text-sm mt-1">{errors.artist_id}</p>}
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium mb-2">שם מלא *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="טל רנדליך"
                className="w-full px-4 py-2 bg-white/5 border border-purple-500/30 rounded-lg focus:border-purple-500 focus:outline-none"
              />
              {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Stage Name */}
            <div>
              <label className="block text-sm font-medium mb-2">שם במה *</label>
              <input
                type="text"
                name="stage_name"
                value={formData.stage_name}
                onChange={handleInputChange}
                placeholder="Kanok"
                className="w-full px-4 py-2 bg-white/5 border border-purple-500/30 rounded-lg focus:border-purple-500 focus:outline-none"
              />
              {errors.stage_name && <p className="text-red-400 text-sm mt-1">{errors.stage_name}</p>}
            </div>

            {/* Profile Photo */}
            <div>
              <label className="block text-sm font-medium mb-2">תמונת פרופיל * (JPG/PNG, עד 5MB)</label>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handlePhotoUpload}
                disabled={uploadingPhoto}
                className="w-full px-4 py-2 bg-white/5 border border-purple-500/30 rounded-lg focus:border-purple-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-500 file:text-white hover:file:bg-purple-600 file:cursor-pointer"
              />
              {uploadingPhoto && <p className="text-purple-300 text-sm mt-1">מעלה תמונה...</p>}
              {photoPreview && (
                <div className="mt-2 relative w-24 h-24 rounded-full overflow-hidden">
                  <Image src={photoPreview} alt="Preview" fill className="object-cover" />
                </div>
              )}
              {errors.profile_photo_url && <p className="text-red-400 text-sm mt-1">{errors.profile_photo_url}</p>}
            </div>
          </div>

          {/* Bio */}
          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">
              תיאור האמן * <span className={`text-sm ${bioColor}`}>({bioLength}/50-1000 תווים)</span>
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={4}
              placeholder="כתוב תיאור מרגש על האמן..."
              className="w-full px-4 py-2 bg-white/5 border border-purple-500/30 rounded-lg focus:border-purple-500 focus:outline-none resize-none"
            />
            {errors.bio && <p className="text-red-400 text-sm mt-1">{errors.bio}</p>}
          </div>

          {/* SoundCloud Track URL */}
          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">SoundCloud Track URL *</label>
            <input
              type="url"
              name="soundcloud_track_url"
              value={formData.soundcloud_track_url}
              onChange={handleInputChange}
              placeholder="https://w.soundcloud.com/player/?url=..."
              className="w-full px-4 py-2 bg-white/5 border border-purple-500/30 rounded-lg focus:border-purple-500 focus:outline-none"
              dir="ltr"
            />
            {errors.soundcloud_track_url && <p className="text-red-400 text-sm mt-1">{errors.soundcloud_track_url}</p>}
          </div>

          {/* Optional URLs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div>
              <label className="block text-sm font-medium mb-2">Instagram (אופציונלי)</label>
              <input
                type="url"
                name="instagram_url"
                value={formData.instagram_url}
                onChange={handleInputChange}
                placeholder="https://instagram.com/..."
                className="w-full px-4 py-2 bg-white/5 border border-purple-500/30 rounded-lg focus:border-purple-500 focus:outline-none"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">SoundCloud Profile (אופציונלי)</label>
              <input
                type="url"
                name="soundcloud_profile_url"
                value={formData.soundcloud_profile_url}
                onChange={handleInputChange}
                placeholder="https://soundcloud.com/..."
                className="w-full px-4 py-2 bg-white/5 border border-purple-500/30 rounded-lg focus:border-purple-500 focus:outline-none"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Spotify (אופציונלי)</label>
              <input
                type="url"
                name="spotify_url"
                value={formData.spotify_url}
                onChange={handleInputChange}
                placeholder="https://open.spotify.com/..."
                className="w-full px-4 py-2 bg-white/5 border border-purple-500/30 rounded-lg focus:border-purple-500 focus:outline-none"
                dir="ltr"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || uploadingPhoto}
            className="mt-8 w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {submitting ? 'שומר...' : 'העלה אמן חדש ✨'}
          </button>
        </form>

        {/* Confirmation Dialog */}
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-lg p-8 max-w-md w-full border border-purple-500/30">
              <h3 className="text-2xl font-bold mb-4">אישור החלפת אמן</h3>
              <p className="mb-6">
                האם אתה בטוח שברצונך להחליף את האמן הנוכחי?
              </p>
              {currentArtist && (
                <div className="bg-white/10 rounded-lg p-4 mb-6">
                  <p className="text-sm text-purple-300 mb-2">אמן נוכחי:</p>
                  <p className="font-bold text-xl">{currentArtist.stage_name}</p>
                  <p className="text-purple-200">↓</p>
                  <p className="text-sm text-purple-300 mb-2">אמן חדש:</p>
                  <p className="font-bold text-xl">{formData.stage_name}</p>
                </div>
              )}
              <div className="flex gap-4">
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-4 rounded-lg transition-all"
                >
                  ביטול
                </button>
                <button
                  onClick={confirmSubmit}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-2 px-4 rounded-lg transition-all"
                >
                  אישור
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

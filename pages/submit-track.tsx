// pages/submit-track.tsx - FIXED WITH FILE UPLOAD

import React, { useState, FormEvent } from 'react';
import Navigation from '../components/Navigation';
import SEO from '../components/SEO';

interface FormState {
  name: string;
  photo_url: string;
  track_title: string;
  youtube_url: string;
  description: string;
}

const SubmitTrackPage: React.FC = () => {
  const [formData, setFormData] = useState<FormState>({
    name: '',
    photo_url: '',
    track_title: '',
    youtube_url: '',
    description: '',
  });
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'loading' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');

  React.useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle photo file selection
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('אנא בחרו קובץ תמונה בלבד');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('גודל התמונה חייב להיות עד 5MB');
      return;
    }

    setPhotoFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Upload photo to Imgur
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
      throw new Error('Failed to upload image to Imgur');
    }

    const data = await response.json();
    return data.data.link;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmissionStatus('loading');
    setErrorMessage('');

    // Validate required fields
    if (!formData.name || !formData.track_title || !formData.youtube_url || !formData.description) {
      setErrorMessage('יש למלא את כל השדות המסומנים בכוכבית (*)');
      setSubmissionStatus('error');
      return;
    }

    // Validate description length
    if (formData.description.length < 50) {
      setErrorMessage('התיאור חייב להכיל לפחות 50 תווים');
      setSubmissionStatus('error');
      return;
    }

    if (formData.description.length > 500) {
      setErrorMessage('התיאור ארוך מדי - מקסימום 500 תווים');
      setSubmissionStatus('error');
      return;
    }

    try {
      let photoUrl = formData.photo_url;

      // Upload photo to Imgur if selected
      if (photoFile) {
        setSubmissionStatus('uploading');
        photoUrl = await uploadToImgur(photoFile);
      }

      setSubmissionStatus('loading');

      // Submit form data
      const response = await fetch('/api/submit-track-of-week', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          photo_url: photoUrl,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        let userError = 'אירעה שגיאה. אנא ודא שהקישור ליוטיוב תקין ונסה שוב.';
        if (result.error === 'invalid_youtube_url') {
          userError = 'אנא הכנס קישור תקין ליוטיוב.';
        }
        setErrorMessage(userError);
        setSubmissionStatus('error');
        return;
      }

      setSubmissionStatus('success');
      // Clear form
      setFormData({
        name: '',
        photo_url: '',
        track_title: '',
        youtube_url: '',
        description: '',
      });
      setPhotoFile(null);
      setPhotoPreview('');
    } catch (error) {
      console.error('Submission Error:', error);
      setErrorMessage('אירעה שגיאת שרת. אנא נסה שוב מאוחר יותר.');
      setSubmissionStatus('error');
    }
  };

  // Calculate description character count and validation
  const descriptionLength = formData.description.length;
  const isDescriptionValid = descriptionLength >= 50 && descriptionLength <= 500;
  const descriptionRemaining = 500 - descriptionLength;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <SEO title="הגישו טראק" description="הגישו המלצה לטראק השבועי של קהילת יוצאים לטראק" />
      <Navigation currentPage="submit-track" />
      <main className="container mx-auto p-6">
        <h1 className="text-4xl font-bold text-center text-purple-400 mb-8">
          🎧 הגישו המלצה לטראק השבועי
        </h1>
        <div className="max-w-xl mx-auto glass-card p-8 rounded-lg shadow-2xl">
          <p className="mb-6 text-center text-lg text-gray-300">
            בחרו טראק מיוטיוב שאתם חייבים שכל הקהילה תשמע, וכתבו כמה מילים אישיות על המשמעות שלו בשבילכם.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                השם או הכינוי שלכם בקהילה *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3"
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label htmlFor="photo" className="block text-sm font-medium text-gray-300 mb-2">
                תמונת פרופיל (אופציונלי)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  id="photo"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
                />
                {photoPreview && (
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-purple-500 flex-shrink-0">
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">מקסימום 5MB, פורמטים נתמכים: JPG, PNG, GIF</p>
            </div>

            {/* Track Title - NOW REQUIRED */}
            <div>
              <label htmlFor="track_title" className="block text-sm font-medium text-gray-300 mb-2">
                שם הטראק, תכתבו יפה זה יופיע באתר!*
              </label>
              <input
                type="text"
                id="track_title"
                name="track_title"
                value={formData.track_title}
                onChange={handleChange}
                required
                placeholder="שם האמן - שם הטראק"
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3"
              />
            </div>

            {/* YouTube URL */}
            <div>
              <label htmlFor="youtube_url" className="block text-sm font-medium text-gray-300 mb-2">
                קישור לטראק ביוטיוב *
              </label>
              <input
                type="url"
                id="youtube_url"
                name="youtube_url"
                value={formData.youtube_url}
                onChange={handleChange}
                required
                placeholder="לדוגמה: https://www.youtube.com/watch?v=..."
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3"
              />
            </div>

            {/* Description with character count */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-300">
                  למה בחרתם בטראק הזה? תספרו מה הוא בשבילכם * (50-500 תווים)
                </label>
                <span
                  className={`text-xs ${
                    descriptionLength < 50
                      ? 'text-gray-400'
                      : isDescriptionValid
                      ? 'text-green-400'
                      : 'text-red-400'
                  }`}
                >
                  {descriptionLength < 50 ? (
                    <>נותרו {50 - descriptionLength} תווים למינימום</>
                  ) : isDescriptionValid ? (
                    <>✓ תקין ({descriptionRemaining} תווים נותרים)</>
                  ) : (
                    <>חריגה של {descriptionLength - 500} תווים!</>
                  )}
                </span>
              </div>
              <textarea
                id="description"
                name="description"
                rows={6}
                value={formData.description}
                onChange={handleChange}
                required
                minLength={50}
                maxLength={500}
                placeholder="כתבו כמה מילים אישיות על מה שהטראק הזה גורם לכם להרגיש, איפה שמעתם אותו, למה הוא מיוחד..."
                className={`mt-1 block w-full rounded-md bg-gray-700 text-white shadow-sm p-3 ${
                  descriptionLength > 0 && !isDescriptionValid
                    ? 'border-2 border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-600 focus:border-purple-500 focus:ring-purple-500'
                }`}
              ></textarea>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submissionStatus === 'loading' || submissionStatus === 'uploading' || !isDescriptionValid}
              className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white transition ${
                submissionStatus === 'loading' || submissionStatus === 'uploading' || !isDescriptionValid
                  ? 'bg-purple-600 opacity-50 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
              }`}
            >
              {submissionStatus === 'uploading'
                ? 'מעלה תמונה...'
                : submissionStatus === 'loading'
                ? 'שולח...'
                : 'שלחו את הטראק שלי'}
            </button>
          </form>

          {/* Success Message */}
          {submissionStatus === 'success' && (
            <div className="mt-6 p-4 bg-green-900/30 border border-green-500 rounded-lg">
              <p className="text-center text-xl text-green-400 font-semibold mb-2">
                ✅ תודה רבה!
              </p>
              <p className="text-center text-gray-300">
                הטראק נשלח לבדיקה ויאושר בקרוב על ידי צוות יוצאים לטראק
              </p>
              <button
                onClick={() => {
                  setSubmissionStatus('idle');
                  setErrorMessage('');
                }}
                className="mt-4 w-full btn-secondary py-2 px-4 rounded-md"
              >
                שלחו טראק נוסף
              </button>
            </div>
          )}

          {/* Error Message */}
          {submissionStatus === 'error' && errorMessage && (
            <div className="mt-6 p-4 bg-red-900/30 border border-red-500 rounded-lg">
              <p className="text-center text-lg text-red-400 font-semibold">
                ⚠️ שגיאה: {errorMessage}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SubmitTrackPage;

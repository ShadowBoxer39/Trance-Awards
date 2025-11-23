// pages/submit-track.tsx

import React, { useState, FormEvent } from 'react';
import Navigation from '../components/Navigation';
import SEO from '../components/SEO';
// Assuming your utility components are in the root of 'components'

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
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  React.useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmissionStatus('loading');
    setErrorMessage('');

    // Client-side validation for required fields
    if (!formData.name || !formData.youtube_url || !formData.description) {
      setErrorMessage('יש למלא שם, קישור לטרק ותיאור אישי. *');
      setSubmissionStatus('error');
      return;
    }

    try {
      const response = await fetch('/api/submit-track-of-week', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        let userError = 'אירעה שגיאה. אנא ודא שהקישור ליוטיוב תקין ונסה שוב.';
        if (result.error === "invalid_youtube_url") {
            userError = 'אנא הכנס קישור תקין ליוטיוב.';
        }
        setErrorMessage(userError);
        setSubmissionStatus('error');
        return;
      }

      setSubmissionStatus('success');
      // Clear form after successful submission
      setFormData({
        name: '',
        photo_url: '',
        track_title: '',
        youtube_url: '',
        description: '',
      });

    } catch (error) {
      console.error('Submission Error:', error);
      setErrorMessage('אירעה שגיאת שרת. אנא נסה שוב מאוחר יותר.');
      setSubmissionStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <SEO title="הגישו טרק" description="הגישו המלצה לטרק השבועי של קהילת יוצאים לטראק" />
      <Navigation currentPage="submit-track" />
      <main className="container mx-auto p-6">
        <h1 className="text-4xl font-bold text-center text-purple-400 mb-8">
          🎧 הגישו המלצה לטרק השבועי
        </h1>
        <div className="max-w-xl mx-auto glass-card p-8 rounded-lg shadow-2xl">
          <p className="mb-6 text-center text-lg text-gray-300">
            בחרו טרק מיוטיוב שאתם חייבים שכל הקהילה תשמע, וכתבו כמה מילים אישיות על המשמעות שלו בשבילכם.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300">
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

            <div>
              <label htmlFor="youtube_url" className="block text-sm font-medium text-gray-300">
                קישור לטרק ביוטיוב *
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

            <div>
              <label htmlFor="track_title" className="block text-sm font-medium text-gray-300">
                שם הטרק (אופציונלי)
              </label>
              <input
                type="text"
                id="track_title"
                name="track_title"
                value={formData.track_title}
                onChange={handleChange}
                placeholder="שם האמן - שם הטרק"
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3"
              />
            </div>
            
            <div>
              <label htmlFor="photo_url" className="block text-sm font-medium text-gray-300">
                קישור לתמונת פרופיל (URL, אופציונלי)
              </label>
              <input
                type="url"
                id="photo_url"
                name="photo_url"
                value={formData.photo_url}
                onChange={handleChange}
                placeholder="לדוגמה: https://i.imgur.com/your-photo.jpg"
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300">
                הסיבה לבחירה: למה הטרק הזה חשוב לכם? *
              </label>
              <textarea
                id="description"
                name="description"
                rows={5}
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="כמה מילים אישיות שיעבירו את התחושה שאתם מקבלים מהטרק."
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submissionStatus === 'loading'}
              className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white transition ${
                submissionStatus === 'loading'
                  ? 'bg-purple-600 opacity-50 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
              }`}
            >
              {submissionStatus === 'loading' ? 'שולח המלצה...' : 'שלחו את הטרק שלי'}
            </button>
          </form>

          {submissionStatus === 'success' && (
            <p className="mt-6 text-center text-xl text-green-400 font-semibold">
              🎉 תודה רבה! הטרק נשלח לבדיקה ויאושר בקרוב.
            </p>
          )}

          {submissionStatus === 'error' && errorMessage && (
            <p className="mt-6 text-center text-lg text-red-400 font-semibold">
              שגיאה: {errorMessage}
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default SubmitTrackPage;

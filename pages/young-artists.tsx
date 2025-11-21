// pages/young-artists.tsx - REDESIGNED WITH SIGNUP FORM
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import React from "react";
import Navigation from "../components/Navigation";
import SEO from "@/components/SEO";
import { usePlayer } from "../components/PlayerProvider";

export default function YoungArtists() {
  const player = usePlayer();
  const [formData, setFormData] = React.useState({
    fullName: "",
    stageName: "",
    age: "",
    phone: "",
    experienceYears: "",
    inspirations: "",
    trackLink: "",
  });
  const [formSubmitted, setFormSubmitted] = React.useState(false);

  React.useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
  }, []);

  // --- UPDATED SUBMISSION LOGIC: Sends data to API ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Data object to send to the new API endpoint
    const submissionData = {
      fullName: formData.fullName,
      stageName: formData.stageName,
      age: formData.age,
      phone: formData.phone,
      experienceYears: formData.experienceYears,
      inspirations: formData.inspirations,
      trackLink: formData.trackLink,
    };
    
    try {
      // Step 1: Send data to the new server endpoint
      const response = await fetch("/api/submit-artist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Submission failed with status: ${response.status}`);
      }

      console.log("Form submitted successfully to server.");
      setFormSubmitted(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setFormSubmitted(false);
        setFormData({
          fullName: "",
          stageName: "",
          age: "",
          phone: "",
          experienceYears: "",
          inspirations: "",
          trackLink: "",
        });
      }, 3000);
      
    } catch (error: any) {
      console.error("Error submitting form:", error.message);
      alert(`Submission Error: Please ensure all required fields are valid and try again. (${error.message})`);
    }
  };
  // --- END UPDATED SUBMISSION LOGIC ---

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Helper to extract clean Soundcloud URL from the embed src format
  const getCleanSoundcloudUrl = (embedSrc: string) => {
    const urlMatch = embedSrc.match(/url=(.*?)&/);
    if (urlMatch && urlMatch[1]) {
      try {
        const decoded = decodeURIComponent(urlMatch[1]);
        return decoded;
      } catch (e) {
        return urlMatch[1];
      }
    }
    return embedSrc; // Fallback
  };
  
  // Previous artists data
  const previousArtists = [
    {
      name: "רון שפרוט",
      stageName: "Shaprut",
      description: "אחד האמנים הכי מיוחדים ומגוונים שתשמעו, לא הולך בתלם.",
      image: "/images/shaprut.png",
      soundcloudEmbed: "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/soundcloud%253Atracks%253A1684460661&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true",
      spotifyUrl: "https://open.spotify.com/artist/4cpLog6uK5HawBNvdc1W5d?si=HKqy7XX0TkWVNnQIQ_QEBw",
      instagramUrl: "https://www.instagram.com/shaprut_music/"
    },
    {
      name: "אריאל נרדיה",
      stageName: "Nardia",
      description: "תעצמו עיניים וצאו לטיול עם נרדיה, חוויה חוץ גופית.",
      image: "/images/nardia.jpg",
      soundcloudEmbed: "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/soundcloud%253Aplaylists%253A1980883968&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true",
      spotifyUrl: "https://open.spotify.com/artist/6DEnaflHWCeJUUkbcp1KbO?si=cc360f7341484e34",
      instagramUrl: "https://www.instagram.com/nardia_m_/"
    }
  ];

  return (
    <>
      <SEO
        title="אמנים צעירים"
        description="במה לאמנים צעירים בסצנת הטראנס הישראלית. הצטרפו והציגו את המוזיקה שלכם!"
        url="https://yourdomain.com/young-artists"
      />
      <Head>
        <title>אמנים צעירים - יוצאים לטראק</title>
        <meta name="description" content="במה לאמנים צעירים בטראנס" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/images/logo.png" />
      </Head>

      <div className="trance-backdrop min-h-screen text-gray-100">
        <Navigation currentPage="about" />

        {/* Hero */}
        <section className="max-w-7xl mx-auto px-6 pt-20 pb-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-6xl mb-6">🌟</div>
            <h1 className="text-5xl md:text-6xl font-semibold mb-5">אמנים צעירים</h1>
            <p className="text-xl md:text-2xl text-gray-400">
              במה לאמנים צעירים בסצנת הטראנס הישראלית
            </p>
          </div>
        </section>

        {/* Signup Form */}
        <section className="max-w-3xl mx-auto px-6 pb-16">
          <div className="glass-card rounded-xl p-8 md:p-10 border-2 border-purple-500/30">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">🎤</span>
              <h2 className="text-2xl md:text-3xl font-semibold text-gradient">הרשמה להופעה בתוכנית</h2>
            </div>

            <p className="text-gray-300 mb-6 leading-relaxed">
              אתה אמן צעיר בסצנת הטראנס הישראלית? רוצה במה להציג את המוזיקה שלך?
            </p>

            {/* WhatsApp Community Requirement */}
            <div className="bg-gradient-to-r from-purple-900/40 to-cyan-900/40 border-2 border-purple-500/50 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="text-4xl">⚠️</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-white">דרישה חובה להשתתפות</h3>
                  <p className="text-gray-200 leading-relaxed mb-4">
                    על מנת להגיש מועמדות, <strong className="text-purple-300">חובה להיות חבר בקהילת הוואטסאפ שלנו</strong>. 
                    זה המקום שבו אנחנו מתקשרים עם האמנים, ובו תוכלו לקבל פידבק מהקהל.
                  </p>

                  <a
                    href="https://chat.whatsapp.com/LSZaHTgYXPn4HRvrsCnmTc"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
                  >
                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    הצטרף לקהילת הוואטסאפ עכשיו
                  </a>
                </div>
              </div>
            </div>

            {!formSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium mb-2 text-gray-300">
                    שם מלא *
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60 transition"
                    placeholder="הכנס את שמך המלא"
                  />
                </div>

                {/* Stage Name */}
                <div>
                  <label htmlFor="stageName" className="block text-sm font-medium mb-2 text-gray-300">
                    שם במה *
                  </label>
                  <input
                    type="text"
                    id="stageName"
                    name="stageName"
                    required
                    value={formData.stageName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60 transition"
                    placeholder="הכנס את שם הבמה שלך"
                  />
                </div>

                {/* Age */}
                <div>
                  <label htmlFor="age" className="block text-sm font-medium mb-2 text-gray-300">
                    גיל *
                  </label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    required
                    min="16"
                    max="99"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60 transition"
                    placeholder="הכנס את גילך"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-2 text-gray-300">
                    מספר טלפון *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60 transition"
                    placeholder="05X-XXXXXXX"
                  />
                </div>

                {/* Experience Years */}
                <div>
                  <label htmlFor="experienceYears" className="block text-sm font-medium mb-2 text-gray-300">
                    כמה זמן אתה עושה מוזיקה? *
                  </label>
                  <input
                    type="text"
                    id="experienceYears"
                    name="experienceYears"
                    required
                    value={formData.experienceYears}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60 transition"
                    placeholder="לדוגמה: 3 שנים, מ-2020"
                  />
                </div>

                {/* Inspirations - NOW OPTIONAL */}
                <div>
                  <label htmlFor="inspirations" className="block text-sm font-medium mb-2 text-gray-300">
                    מי ההשראות שלך? (אופציונלי)
                  </label>
                  <textarea
                    id="inspirations"
                    name="inspirations"
                    value={formData.inspirations}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60 transition resize-none"
                    placeholder="ספר לנו על האמנים והסגנונות שמשפיעים עליך"
                  />
                </div>

                {/* Track Link */}
                <div>
                  <label htmlFor="trackLink" className="block text-sm font-medium mb-2 text-gray-300">
                    לינק לטראק שאתה רוצה שנשמע *
                  </label>
                  <input
                    type="url"
                    id="trackLink"
                    name="trackLink"
                    required
                    value={formData.trackLink}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60 transition"
                    placeholder="https://soundcloud.com/... או https://youtube.com/..."
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    SoundCloud, YouTube, Spotify או כל פלטפורמה אחרת
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full btn-primary px-6 py-4 rounded-lg font-medium text-lg"
                >
                  שלח בקשה
                </button>
              </form>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-2xl font-semibold mb-2 text-gradient">הבקשה נשלחה בהצלחה!</h3>
                <p className="text-gray-400">נחזור אליך בהקדם</p>
              </div>
            )}
          </div>
        </section>

        {/* How It Works */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <span className="text-4xl mb-4 block">🎯</span>
            <h2 className="text-3xl font-semibold mb-4">איך זה עובד?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              התהליך פשוט וישיר - מהרשמה ועד להופעה בפודקאסט
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="glass-card rounded-xl p-6 text-center">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-xl font-semibold mb-3">1. מלא טופס</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                מלא את הטופס למעלה עם הפרטים שלך והטראק שאתה רוצה להציג
              </p>
            </div>

            {/* Step 2 */}
            <div className="glass-card rounded-xl p-6 text-center">
              <div className="text-4xl mb-4">🎧</div>
              <h3 className="text-xl font-semibold mb-3">2. נבדוק את החומר</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                נקשיב לטראק שלך כמה פעמים ונגיע להחלטה
              </p>
            </div>

            {/* Step 3 */}
            <div className="glass-card rounded-xl p-6 text-center">
              <div className="text-4xl mb-4">🎤</div>
              <h3 className="text-xl font-semibold mb-3">3. הופעה בפודקאסט</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                אם תבחר, תופיע בפודקאסט ותקבל חשיפה לאלפי מאזינים
              </p>
            </div>
          </div>
        </section>

        {/* Featured Artists - REDESIGNED */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-semibold mb-8 text-center">אמנים שהופיעו אצלנו בעבר ואתם חייבים להכיר</h2>
          
          <div className="space-y-8">
            {previousArtists.map((artist, index) => (
              <div 
                key={index}
                className="glass-card rounded-xl overflow-hidden border border-purple-500/20 hover:border-purple-500/40 transition"
              >
                {/* Fixed grid: stack on mobile, side-by-side on tablet/desktop */}
                <div className="grid md:grid-cols-[250px,1fr] gap-6 p-6">
                  {/* Artist Image - Fixed aspect ratio for better mobile layout */}
                  <div className="relative aspect-square md:aspect-auto md:h-full bg-gradient-to-br from-purple-600/20 to-cyan-600/20 rounded-lg overflow-hidden">
                    <Image
                      src={artist.image}
                      alt={artist.stageName}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Artist Info */}
                  <div className="flex flex-col">
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold mb-1">{artist.stageName}</h3>
                      <p className="text-gray-400 text-sm">{artist.name}</p>
                    </div>

                    <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                      {artist.description}
                    </p>

                    {/* Soundcloud Play Button - USES GLOBAL PLAYER (FIXED) */}
                    <div className="mb-4 flex-grow">
                      <button
                        onClick={() => player.playUrl(getCleanSoundcloudUrl(artist.soundcloudEmbed))}
                        className="w-full btn-secondary px-5 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition hover:bg-purple-500/20 border-purple-400/50"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                        </svg>
                        האזן לטראק בנגן
                      </button>
                      <a
                        href={getCleanSoundcloudUrl(artist.soundcloudEmbed)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-500 hover:text-purple-400 mt-2 block text-center"
                      >
                        או פתח ב-SoundCloud
                      </a>
                    </div>


                    {/* Social Links */}
                    <div className="flex gap-3 mt-auto">
                      <a
                        href={artist.spotifyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 flex-1 justify-center"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                        </svg>
                        Spotify
                      </a>
                      <a
                        href={artist.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 flex-1 justify-center"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                        Instagram
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Special Episode - 4 Young Artists */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-semibold mb-6">פרק מיוחד - הדור הבא של הטראנס</h2>
          
          <div className="glass-card rounded-xl overflow-hidden border-2 border-purple-500/30">
            <div className="p-6 md:p-8 bg-gradient-to-r from-purple-900/30 to-transparent">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🎵</span>
                <h2 className="text-2xl md:text-3xl font-semibold text-gradient">פרק מיוחד</h2>
              </div>
              <p className="text-gray-300 mb-6">
                בפרק מיוחד זה אירחנו 4 אמנים בתחילת דרכם מהסצנה הישראלית שקיבלו הזדמנות להציג את המוזיקה שלהם
              </p>
            </div>

            {/* Video */}
            <div className="aspect-video bg-gray-900">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/leIABciiXK4?start=1450"
                title="4 אמנים צעירים"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="p-6">
              <div className="flex gap-3">
                <a
                  href="https://www.youtube.com/watch?v=leIABciiXK4&t=1450s"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary px-5 py-2.5 rounded-lg text-sm font-medium"
                >
                  צפו ביוטיוב
                </a>
                <a
                  href="https://open.spotify.com/show/0LGP2n3IGqeFVv1fIZOkeZ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary px-5 py-2.5 rounded-lg text-sm font-medium"
                >
                  האזינו בספוטיפיי
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-800 mt-16">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
              <div>© 2025 יוצאים לטראק</div>
              <div className="flex gap-6">
                <Link href="/" className="hover:text-gray-300 transition">בית</Link>
                <Link href="/episodes" className="hover:text-gray-300 transition">פרקים</Link>
                <Link href="/young-artists" className="hover:text-gray-300 transition">אמנים צעירים</Link>
                <Link href="/about" className="hover:text-gray-300 transition">אודות</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

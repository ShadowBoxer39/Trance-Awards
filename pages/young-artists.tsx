// pages/young-artists.tsx - REDESIGNED WITH SIGNUP FORM
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import React from "react";

export default function YoungArtists() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create submission object with timestamp
    const submission = {
      ...formData,
      submittedAt: new Date().toISOString(),
      id: Date.now().toString(),
    };
    
    // Get existing submissions from localStorage
    const existingSubmissions = JSON.parse(localStorage.getItem('youngArtistSignups') || '[]');
    
    // Add new submission
    existingSubmissions.push(submission);
    
    // Save back to localStorage
    localStorage.setItem('youngArtistSignups', JSON.stringify(existingSubmissions));
    
    console.log("Form submitted:", submission);
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
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <>
      <Head>
        <title>אמנים צעירים - יוצאים לטראק</title>
        <meta name="description" content="במה לאמנים צעירים בטראנס" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/images/logo.png" />
      </Head>

      <div className="trance-backdrop min-h-screen text-gray-100">
        {/* Navigation */}
        <nav className="border-b border-gray-800 bg-black/40 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition">
                <Image
                  src="/images/logo.png"
                  alt="Logo"
                  width={40}
                  height={40}
                  className="rounded-lg"
                />
                <span className="text-lg font-semibold">יוצאים לטראק</span>
              </Link>

              <div className="hidden md:flex items-center gap-6">
                <Link href="/" className="text-gray-300 hover:text-white transition text-sm font-medium">
                  בית
                </Link>
                <Link href="/episodes" className="text-gray-300 hover:text-white transition text-sm font-medium">
                  פרקים
                </Link>
                <Link href="/young-artists" className="text-white text-sm font-medium">
                  אמנים צעירים
                </Link>
                <Link href="/about" className="text-gray-300 hover:text-white transition text-sm font-medium">
                  אודות
                </Link>
                <Link href="/vote" className="btn-primary px-5 py-2 rounded-lg text-sm font-medium">
                  הצבעה
                </Link>
              </div>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-gray-300 hover:text-white"
              >
                {mobileMenuOpen ? "✕" : "☰"}
              </button>
            </div>

            {mobileMenuOpen && (
              <div className="md:hidden mt-4 pt-4 border-t border-gray-800 space-y-3">
                <Link href="/" className="block text-gray-300 hover:text-white transition text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                  בית
                </Link>
                <Link href="/episodes" className="block text-gray-300 hover:text-white transition text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                  פרקים
                </Link>
                <Link href="/young-artists" className="block text-white text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                  אמנים צעירים
                </Link>
                <Link href="/about" className="block text-gray-300 hover:text-white transition text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                  אודות
                </Link>
                <Link href="/vote" className="block btn-primary px-5 py-2 rounded-lg text-sm font-medium text-center" onClick={() => setMobileMenuOpen(false)}>
                  הצבעה
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Hero */}
        <section className="max-w-5xl mx-auto px-6 pt-20 pb-12">
          <div className="text-center">
            <div className="text-5xl mb-4">🌟</div>
            <h1 className="text-4xl md:text-5xl font-semibold mb-4">אמנים צעירים</h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
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

            <p className="text-gray-300 mb-8 leading-relaxed">
              אתה אמן צעיר בסצנת הטראנס הישראלית? רוצה במה להציג את המוזיקה שלך?
              מלא את הטופס ונחזור אליך בהקדם!
            </p>

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
                    ממתי אתה עושה מוזיקה? *
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

                {/* Inspirations */}
                <div>
                  <label htmlFor="inspirations" className="block text-sm font-medium mb-2 text-gray-300">
                    מי ההשראות שלך? *
                  </label>
                  <textarea
                    id="inspirations"
                    name="inspirations"
                    required
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
        <section className="max-w-5xl mx-auto px-6 py-16">
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
                נקשיב לטראק שלך ונחזור אליך עם משוב או הזמנה לתוכנית
              </p>
            </div>

            {/* Step 3 */}
            <div className="glass-card rounded-xl p-6 text-center">
              <div className="text-4xl mb-4">🎤</div>
              <h3 className="text-xl font-semibold mb-3">3. הופעה בפודקאסט</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                אם נבחר, תופיע בפודקאסט ותקבל חשיפה לאלפי מאזינים
              </p>
            </div>
          </div>
        </section>

        {/* Featured Episode - 4 Young Artists */}
        <section className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-semibold mb-6">אמנים שהוצגו בעבר</h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {/* Previous Artist 1 */}
            <div className="glass-card rounded-xl overflow-hidden border border-purple-500/20 hover:border-purple-500/40 transition">
              <div className="aspect-video bg-gradient-to-br from-purple-600/20 to-cyan-600/20 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-5xl">🎧</span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-xl font-semibold mb-1">שם האמן 1</h3>
                <p className="text-purple-400 text-sm mb-3">Progressive Psytrance</p>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  תיאור קצר על האמן והסגנון שלו. אמן צעיר מוכשר מהסצנה הישראלית.
                </p>
                <div className="flex gap-2">
                  <a
                    href="#"
                    className="btn-secondary px-4 py-2 rounded-lg text-xs font-medium flex-1 text-center"
                  >
                    SoundCloud
                  </a>
                  <a
                    href="#"
                    className="btn-secondary px-4 py-2 rounded-lg text-xs font-medium flex-1 text-center"
                  >
                    Instagram
                  </a>
                </div>
              </div>
            </div>

            {/* Previous Artist 2 */}
            <div className="glass-card rounded-xl overflow-hidden border border-purple-500/20 hover:border-purple-500/40 transition">
              <div className="aspect-video bg-gradient-to-br from-cyan-600/20 to-magenta-600/20 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-5xl">🎵</span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-xl font-semibold mb-1">שם האמן 2</h3>
                <p className="text-purple-400 text-sm mb-3">Full On</p>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  תיאור קצר על האמן והסגנון שלו. אמן צעיר מוכשר מהסצנה הישראלית.
                </p>
                <div className="flex gap-2">
                  <a
                    href="#"
                    className="btn-secondary px-4 py-2 rounded-lg text-xs font-medium flex-1 text-center"
                  >
                    SoundCloud
                  </a>
                  <a
                    href="#"
                    className="btn-secondary px-4 py-2 rounded-lg text-xs font-medium flex-1 text-center"
                  >
                    Instagram
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Special Episode - 4 Young Artists */}
        <section className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-semibold mb-6">פרק מיוחד - 4 אמנים צעירים</h2>
          
          <div className="glass-card rounded-xl overflow-hidden border-2 border-purple-500/30">
            <div className="p-6 md:p-8 bg-gradient-to-r from-purple-900/30 to-transparent">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🎵</span>
                <h2 className="text-2xl md:text-3xl font-semibold text-gradient">פרק מיוחד - 4 אמנים צעירים</h2>
              </div>
              <p className="text-gray-300 mb-6">
                בפרק מיוחד זה אירחנו 4 אמנים צעירים מהסצנה הישראלית שקיבלו הזדמנות להציג את המוזיקה שלהם
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
          <div className="max-w-5xl mx-auto px-6 py-8">
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

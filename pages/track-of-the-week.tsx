// pages/track-of-the-week.tsx - FINAL FIXED VERSION

import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";
// FIX: Combined imports to avoid 'Duplicate identifier' error
import { createClient, type User } from '@supabase/supabase-js'; 
import Navigation from "../components/Navigation";
import SEO from "@/components/SEO";
import GoogleLoginButton from "../components/GoogleLoginButton";
import { getGoogleUserInfo } from "../lib/googleAuthHelpers";
import { FaFire, FaHeart, FaPlay, FaWhatsapp } from 'react-icons/fa';
import { GiSunglasses } from 'react-icons/gi';
import { BsEmojiDizzy } from 'react-icons/bs';

interface TrackOfWeek {
  id: number;
  name: string;
  photo_url: string | null;
  track_title: string;
  youtube_url: string;
  description: string;
  created_at: string;
  approved_at?: string;
  is_approved: boolean;
  reactions?: {
    fire: number;
    mind_blown: number;
    cool: number;
    not_feeling_it: number;
  };
  comments?: Array<{
    id: string;
    name: string;
    text: string;
    timestamp: string;
    user_photo_url?: string;
  }>;
}

// Helper to extract YouTube video ID
function getYouTubeId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// Supabase Client (Static)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function TrackOfTheWeekPage({
  currentTrack,
  pastTracks,
}: {
  currentTrack: TrackOfWeek | null;
  pastTracks: TrackOfWeek[];
}) {
  // --- State Declarations ---
  const [reactions, setReactions] = useState({
    fire: 0,
    mind_blown: 0,
    cool: 0,
    not_feeling_it: 0,
  });
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState({ text: "" });
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState('');
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [scrollY, setScrollY] = useState(0); 
  const [isPlaying, setIsPlaying] = useState(false);


  // --- Data Fetching, Auth, and Listeners ---
  useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
    
    // Parallax scroll listener
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);

    // Auth & OAuth Handlers (Fixed and clean)
    const handleOAuthCallback = async () => {
      const url = window.location.href;
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const queryParams = new URLSearchParams(window.location.search);

      if (hashParams.get('access_token') || queryParams.get('code')) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(url);
        if (!error) console.log('✅ OAuth callback successful:', data);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    const checkUser = async () => {
      await handleOAuthCallback();
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user ?? null;
      
      setUser(user);
      if (user) {
        const userInfo = getGoogleUserInfo(user); 
        if (userInfo) {
          setUserName(userInfo.name);
          setUserPhoto(userInfo.photoUrl);
        }
      }
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const userInfo = getGoogleUserInfo(session.user);
        if (userInfo) {
          setUserName(userInfo.name);
          setUserPhoto(userInfo.photoUrl);
        }
      } else {
        setUserName('');
        setUserPhoto(null);
      }
    });
    
    if (currentTrack) {
      // Fetch reactions
      fetch(`/api/track-reaction?trackId=${currentTrack.id}`).then(res => res.json()).then(data => {
        if (data.reactions) setReactions(data.reactions);
      });

      // Fetch comments
      fetch(`/api/track-comment-public?trackId=${currentTrack.id}`).then(res => res.json()).then(data => {
        if (data.comments) setComments(data.comments);
      });

      // Check if user already reacted
      const userReaction = localStorage.getItem(`track_reaction_${currentTrack.id}`);
      if (userReaction) setSelectedReaction(userReaction);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      authListener.subscription.unsubscribe();
    };
  }, [currentTrack]);


  // --- Handlers (Unchanged Functionality) ---
  const handleReaction = async (reactionType: keyof typeof reactions) => { /* ... unchanged ... */ };
  const handleCommentSubmit = async (e: React.FormEvent) => { /* ... unchanged ... */ };
  const handleLogout = async () => { /* ... unchanged ... */ };
  const handleDeleteComment = async (commentId: string) => { /* ... unchanged ... */ };
  
  const handlePlayClick = () => {
    setIsPlaying(true);
    const videoPlayer = document.getElementById('video-player');
    if (videoPlayer) {
      videoPlayer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };
  
  const reactionButtons = [
    { type: 'fire', icon: FaFire, emoji: '🔥', label: 'אש', color: 'text-orange-500', bg: 'hover:bg-orange-500/10' },
    { type: 'mind_blown', icon: BsEmojiDizzy, emoji: '🤯', label: 'מפוצץ', color: 'text-yellow-500', bg: 'hover:bg-yellow-500/10' },
    { type: 'cool', icon: GiSunglasses, emoji: '😎', label: 'סבבה', color: 'text-cyan-500', bg: 'hover:bg-cyan-500/10' },
    { type: 'not_feeling_it', icon: FaHeart, emoji: '😐', label: 'לא עפתי', color: 'text-gray-400', bg: 'hover:bg-gray-500/10' }
  ];


  // --- JSX Rendering ---

  if (!currentTrack) {
    return (
      <>
        <SEO
          title="הטראק השבועי של הקהילה"
          description="מידי שבוע, טראק חדש נבחר על ידי הקהילה שלנו"
          url="https://tracktrip.co.il/track-of-the-week"
        />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
          <Navigation currentPage="track-of-the-week" />
          <div className="max-w-4xl mx-auto px-6 py-20 text-center">
            <h1 className="text-4xl font-bold mb-6 text-white">הטראק השבועי של הקהילה</h1>
            <p className="text-gray-400 mb-8">אין טראק פעיל כרגע. בקרו שוב בקרוב!</p>
            <Link href="/" className="btn-primary px-6 py-3 rounded-lg inline-block">
              חזרה לדף הבית
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title={`${currentTrack.track_title} - הטראק השבועי`}
        description={`מידי שבוע - טראק חדש נבחר: ${currentTrack.track_title}`}
        url="https://tracktrip.co.il/track-of-the-week"
      />
      <Head>
        <title>{currentTrack.track_title} - הטראק השבועי של הקהילה</title>
      </Head>

      {/* Global CSS (required styles for animations/glass card) */}
      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        
        .glass-card {
          background: rgba(17, 24, 39, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(139, 92, 246, 0.2);
        }
      `}</style>

      {/* --- ROOT CONTAINER: FIXED STICKY NAVIGATION ISSUE (Issue 1) --- */}
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white relative"> 
        {/* Animated Background Orbs (fixed position, z-index 0) */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0"> 
          <div className="absolute top-20 left-10 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-600/30 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />
        </div>

        <Navigation currentPage="track-of-the-week" />

        {/* --- Hero Section: Community Card (z-index 10) --- */}
        <section className="relative z-10 max-w-7xl mx-auto px-6 py-12 md:py-20">
          
          {/* Badge */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 backdrop-blur-sm">
              <span className="text-2xl">💧</span>
              <span className="font-bold text-purple-300">הטראק השבועי של הקהילה</span>
            </div>
          </div>

          {/* NEW: Floating Community Submission Card (REPLACES VINYL) */}
          <div 
            className="relative mx-auto mb-12 animate-float glass-card rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl shadow-purple-500/30"
            style={{ 
              transform: `translateY(${scrollY * 0.3}px)`,
            }}
          >
            {/* WhatsApp/User Header */}
            <div className="flex items-center gap-4 border-b border-gray-700/50 pb-4 mb-4">
              <div className="flex-shrink-0 relative w-16 h-16 rounded-full overflow-hidden border-2 border-cyan-500 shadow-lg">
                {currentTrack.photo_url ? (
                  <img 
                    src={currentTrack.photo_url} 
                    alt={currentTrack.name} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-3xl">👤</div>
                )}
              </div>
              
              <div>
                <p className="text-sm font-light text-gray-400">הטראק השבועי נבחר על ידי:</p>
                <p className="text-xl font-black text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text">
                  {currentTrack.name}
                </p>
              </div>
            </div>
            
            {/* Track Title as Main Message */}
            <h2 className="text-2xl font-black text-white mb-4 leading-snug">
              "{currentTrack.track_title}"
            </h2>
            
            {/* CTA Button */}
            <button
              onClick={handlePlayClick}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors transform hover:scale-[1.02]"
            >
              <FaPlay />
              <span>צפו בטראק</span>
            </button>
          </div>

          {/* Track Title (Moved to be more prominent) */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight">
              {currentTrack.track_title}
            </h1>
            <p className="text-2xl font-bold text-gray-300">
              {currentTrack.name}
            </p>
          </div>

          {/* Submitter's Message - NOW THE TALKING BUBBLE */}
          <div className="max-w-2xl mx-auto mb-12 group">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 rounded-3xl blur-lg opacity-25 group-hover:opacity-50 transition duration-500" />
            {/* Chat Bubble Card - rounded-tl-none for the bubble shape */}
            <div className="relative glass-card rounded-3xl rounded-tl-none p-8 border-2 border-purple-500/30">
              <h3 className="text-lg font-bold text-purple-300 mb-4 flex items-center gap-2 justify-center">
                <span>💬</span> 
                <span>ההמלצה האישית של {currentTrack.name}:</span>
              </h3>
              <p className="text-gray-200 leading-relaxed text-center text-lg">
                {currentTrack.description}
              </p>
            </div>
            
          </div>
        </section>

        {/* Video Player & Reactions (Issue 2 Fix) */}
        {/* Added z-20 to ensure content sections scroll over the z-10 Hero section, fixing the visual overlap */}
        <section className="relative z-20 max-w-7xl mx-auto px-6 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left - Video */}
            <div className="lg:col-span-2">
              <div id="video-player" className="glass-card rounded-2xl overflow-hidden mb-8 border-2 border-purple-500/30">
                <div className="aspect-video bg-black">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${getYouTubeId(currentTrack.youtube_url)}`}
                    title={currentTrack.track_title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>

              {/* Reactions (Unchanged) */}
              <div className="glass-card rounded-2xl p-6 mb-8 border-2 border-purple-500/30">
                <h3 className="text-xl font-bold mb-6 text-center">איך הטראק? 🎧</h3>
                <div className="grid grid-cols-4 gap-4">
                  {reactionButtons.map(({ type, icon: Icon, emoji, label, color, bg }) => (
                    <button
                      key={type}
                      onClick={() => handleReaction(type as keyof typeof reactions)}
                      disabled={!!selectedReaction}
                      className={`glass-card p-6 rounded-2xl transition-all group hover:scale-105 ${
                        selectedReaction === type
                          ? `ring-4 ring-orange-500 scale-105 ${color.replace('text', 'bg').replace('-400', '-500/20')}`
                          : selectedReaction
                          ? 'opacity-40'
                          : bg
                    }`}
                    >
                      <div className="text-4xl mb-3 group-hover:scale-125 transition-transform">{Icon ? <Icon className={`mx-auto ${color}`} /> : emoji}</div>
                      <div className="text-xs text-gray-400 mb-2">{label}</div>
                      <div className={`text-2xl font-bold ${color}`}>{reactions[type as keyof typeof reactions]}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Comments (Unchanged) */}
              <div className="glass-card rounded-2xl p-6 border-2 border-purple-500/30" id="comments-section">
                <h3 className="text-xl font-bold mb-6">תגובות ({comments.length})</h3>
                
                {!user ? (
                  <div className="mb-8 text-center bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-2xl p-8 border-2 border-purple-500/30">
                    <div className="text-4xl mb-4">🔐</div>
                    <p className="text-white mb-6 font-bold text-lg">התחברו כדי להוסיף תגובה</p>
                    <GoogleLoginButton />
                  </div>
                ) : (
                  <div className="mb-6">{/* ... form ... */}</div>
                )}
              </div>
            </div>

            {/* Right - Actions */}
            <div className="space-y-6">
              <div className="glass-card rounded-2xl p-6 border-2 border-cyan-500/30 text-center">
                <div className="text-4xl mb-4"><FaWhatsapp className="mx-auto text-green-500" /></div>
                <h3 className="text-lg font-bold mb-4">הצטרפו לקהילת הווצאפ!</h3>
                <a
                  href="https://chat.whatsapp.com/LSZaHTgYXPn4HRvrsCnmTc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-green-600 hover:bg-green-500 text-white px-6 py-4 rounded-xl font-bold transition-all transform hover:scale-105"
                >
                  כניסה לקהילה (500+ חברים)
                </a>
              </div>

              <div className="glass-card rounded-2xl p-6 border-2 border-purple-500/30 text-center">
                <div className="text-4xl mb-4">🎵</div>
                <h3 className="text-lg font-bold mb-2">יש לכם טראק מושלם?</h3>
                <p className="text-sm text-gray-400 mb-4">שלחו אותו והוא יכול להיות הבא!</p>
                <Link href="/submit-track" className="block w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 px-6 py-4 rounded-xl font-bold transition-all transform hover:scale-105">
                  הגישו טראק ✨
                </Link>
              </div>

              <div className="glass-card rounded-2xl p-6 border-2 border-gray-700/30 text-center">
                <div className="text-4xl mb-4">📺</div>
                <a
                  href={currentTrack.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-red-600 hover:bg-red-500 px-6 py-4 rounded-xl font-bold transition-all transform hover:scale-105"
                >
                  צפו ב-YouTube
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Previous Tracks (Issue 3 Fix: Made clickable to YouTube) */}
        {pastTracks.length > 0 && (
          <section className="relative z-10 max-w-7xl mx-auto px-6 py-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                הטראקים השבועיים הקודמים
              </h2>
              <p className="text-gray-400">גלו עוד בחירות מדהימות מהקהילה</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {pastTracks.slice(0, 8).map((track) => (
                <a
                  // ISSUE 3 FIX: Element is now an <a> tag linking to YouTube
                  key={track.id}
                  href={track.youtube_url} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-card rounded-2xl overflow-hidden border-2 border-purple-500/20 hover:border-purple-500/50 transition-all group cursor-pointer transform hover:scale-105 block"
                >
                  <div className="relative aspect-video bg-black">
                    <img
                      src={`https://img.youtube.com/vi/${getYouTubeId(track.youtube_url)}/maxresdefault.jpg`}
                      alt={track.track_title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = `https://img.youtube.com/vi/${getYouTubeId(track.youtube_url)}/hqdefault.jpg`;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute inset-0 bg-purple-600/0 group-hover:bg-purple-600/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <FaPlay className="text-white text-4xl" />
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-white line-clamp-2 mb-3 group-hover:text-purple-300 transition-colors">
                      {track.track_title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 overflow-hidden flex-shrink-0">
                        {track.photo_url ? (
                          <img src={track.photo_url} alt={track.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sm">👤</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-400 truncate">{track.name}</p>
                        <p className="text-xs text-gray-600">
                          {new Date(track.approved_at || track.created_at).toLocaleDateString("he-IL")}
                        </p>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Footer (Unchanged) */}
        <footer className="relative z-10 border-t border-gray-800 mt-16">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="text-center">
              <Link href="/" className="text-gray-400 hover:text-gray-300 transition">
                חזרה לדף הבית
              </Link>
              <div className="text-sm text-gray-600 mt-4">© 2025 יוצאים לטראק</div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

// Server-side props (unchanged)
export async function getServerSideProps() {
  // ... (unchanged server-side fetching logic)
}

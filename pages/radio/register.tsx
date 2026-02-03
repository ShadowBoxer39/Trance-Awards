// pages/radio/register.tsx - Aesthetic Artist Landing Page with YouTube CTAs + Mini Player
import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import Navigation from '@/components/Navigation';
import GoogleLoginButton from '@/components/GoogleLoginButton';
import { FaMicrophoneAlt, FaChevronDown, FaPlay, FaPause, FaYoutube, FaCheckCircle, FaRocket, FaQuestionCircle, FaUsers, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { HiSparkles, HiMusicNote } from 'react-icons/hi';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const YOUTUBE_SUBSCRIBE_URL = 'https://www.youtube.com/@tracktripil?sub_confirmation=1';
const AZURACAST_API_URL = 'https://a12.asurahosting.com/api/nowplaying/track_trip_radio';
const STREAM_URL = 'https://a12.asurahosting.com/listen/track_trip_radio/radio.mp3';

interface NowPlayingData {
  now_playing: { song: { title: string; artist: string; art: string } };
  listeners: { current: number };
}

const FAQ_ITEMS = [
  {
    question: 'מי יכול להגיש מוזיקה?',
    answer: 'כל אמן/ית טראנס ישראלי/ת! לא משנה אם יש לך טראק אחד או עשרים, אנחנו רוצים לשמוע את היצירה שלך.',
  },
  {
    question: 'מה האיכות הנדרשת?',
    answer: 'קובץ MP3 איכותי (320kbps). חשוב מאוד שהקובץ יכיל Metadata (שם אמן, שם שיר ועטיפה) מוטמעים בתוכו.',
  },
  {
    question: 'כמה זמן לוקח עד שהטראק עולה לרדיו?',
    answer: 'אנחנו מאזינים לכל הגשה ומאשרים לפי מה שמתאים לרדיו. ברגע שהטראק מאושר, הוא נכנס לרוטציה מיד.',
  },
  {
    question: 'האם יש תשלום?',
    answer: 'ממש לא. הרדיו הוא פרויקט קהילתי ללא מטרות רווח. המטרה היא נטו חשיפה וקידום הסצנה הישראלית.',
  },
  {
    question: 'האם אני שומר על הזכויות?',
    answer: 'בוודאי. כל הזכויות נשארות שלך בלבד. אנחנו רק מקבלים ממך רשות לשדר את הטראק בשידורי הרדיו שלנו.',
  },
];

const FloatingNotes = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="absolute text-purple-500/10 animate-float-slow"
        style={{ left: `${15 + i * 15}%`, top: `${20 + (i % 3) * 25}%`, animationDelay: `${i * 0.8}s`, fontSize: `${24 + i * 8}px` }}
      > ♪ </div>
    ))}
  </div>
);

const Visualizer = ({ isPlaying }: { isPlaying: boolean }) => {
  const [heights, setHeights] = useState<number[]>(Array(16).fill(6));
  
  useEffect(() => {
    if (!isPlaying) { 
      setHeights(Array(16).fill(6)); 
      return; 
    }
    const interval = setInterval(() => {
      setHeights(Array(16).fill(0).map(() => Math.random() * 28 + 6));
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="flex items-end justify-center gap-1 h-8">
      {heights.map((height, i) => (
        <div
          key={i}
          className={'w-1 rounded-full transition-all duration-75 ' + (isPlaying ? 'bg-gradient-to-t from-purple-500 via-pink-500 to-cyan-400' : 'bg-white/20')}
          style={{ height: height + 'px' }}
        />
      ))}
    </div>
  );
};

export default function RadioRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Radio player state
  const [nowPlaying, setNowPlaying] = useState<NowPlayingData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [artistDetails, setArtistDetails] = useState<{ image_url?: string } | null>(null);

  useEffect(() => {
    if (!router.isReady) return;
    document.documentElement.setAttribute('dir', 'rtl');

    const checkUser = async () => {
      try {
        const url = window.location.href;
        if (url.includes('code=') || url.includes('access_token=')) {
          await supabase.auth.exchangeCodeForSession(url);
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          router.replace('/radio/dashboard');
          return;
        }
        
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        router.replace('/radio/dashboard');
      }
      if (event === 'SIGNED_OUT') {
        setLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router.isReady]);

 const fetchNowPlaying = async () => {
  try {
    const response = await fetch(AZURACAST_API_URL);
    if (response.ok) {
      const data = await response.json();
      const currentArtist = nowPlaying?.now_playing?.song?.artist;
      const newArtist = data.now_playing?.song?.artist;
      
      // Fetch artist details when artist changes
      if (newArtist && newArtist !== currentArtist) {
        try {
          const res = await fetch('/api/radio/get-artist-details?name=' + encodeURIComponent(newArtist));
          if (res.ok) {
            const artistData = await res.json();
            setArtistDetails(artistData);
          } else {
            setArtistDetails(null);
          }
        } catch {
          setArtistDetails(null);
        }
      }
      
      setNowPlaying(data);
    }
  } catch (err) {
    console.log('Stream offline or blocked');
  }
};

  useEffect(() => {
    fetchNowPlaying();
    const interval = setInterval(fetchNowPlaying, 10000);
    return () => clearInterval(interval);
  }, []);


  // Audio setup
  useEffect(() => {
    audioRef.current = new Audio(STREAM_URL);
    audioRef.current.volume = volume;
    audioRef.current.addEventListener('error', () => setIsPlaying(false));
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

  const scrollToSignup = () => {
    document.getElementById('signup-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Album art fallback logic (same as homepage)
  const getAlbumArt = () => {
  const art = nowPlaying?.now_playing?.song?.art;
  const isDefaultArt = !art || 
    art.includes('/static/img/generic_song') || 
    (art.includes('/api/station/') && !art.match(/\.(jpg|jpeg|png|webp)$/i));
  
  if (!isDefaultArt) return art;
  return artistDetails?.image_url || '/images/logo.png';
};

  const currentSong = nowPlaying?.now_playing?.song;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a12] text-white flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>הצטרפו לרדיו | יוצאים לטראק</title>
        <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <style jsx global>{`
        @keyframes float-slow { 0%, 100% { transform: translateY(0); opacity: 0.1; } 50% { transform: translateY(-30px); opacity: 0.2; } }
        @keyframes gradient-shift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-gradient { background-size: 200% 200%; animation: gradient-shift 8s ease infinite; }
        .glass-warm {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(59, 130, 246, 0.05) 50%, rgba(236, 72, 153, 0.08) 100%);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
      `}</style>

      <div className="min-h-screen bg-[#0a0a12] text-white font-['Rubik',sans-serif]">
        <Navigation currentPage="radio" />

        {/* Hero Section */}
        <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden px-6 pt-20">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] animate-gradient" />
            <FloatingNotes />
          </div>

          <div className="relative z-10 max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in">
              <HiSparkles className="text-purple-400" />
              <span className="text-xs font-medium tracking-wide uppercase">במה לאמני טראנס ישראלים</span>
            </div>

            <h1 className="text-5xl md:text-8xl font-black mb-8 leading-tight tracking-tighter">
              <span className="block text-white">הרדיו של</span>
              <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                יוצאים לטראק
              </span>
            </h1>

            <div className="flex flex-wrap items-center justify-center gap-6 mb-12">
               {['שידור 24/7', 'קרדיט מלא לאמן', '100% בחינם'].map((text, i) => (
                 <div key={i} className="flex items-center gap-2">
                   <FaCheckCircle className="text-green-500/80 text-sm" />
                   <span className="text-gray-300 font-medium">{text}</span>
                 </div>
               ))}
            </div>

            {/* Main CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <button onClick={scrollToSignup} className="w-full sm:w-auto group inline-flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-5 px-10 rounded-[2rem] transition-all shadow-xl shadow-purple-500/20 active:scale-95">
                <FaMicrophoneAlt />
                <span>הצטרפו עכשיו</span>
              </button>
              <Link href="/radio" className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 text-white font-bold py-5 px-10 rounded-[2rem] border border-white/10 transition-all">
                <FaPlay className="text-xs" />
                <span>לעמוד הרדיו</span>
              </Link>
            </div>

            {/* YouTube Subscribe CTA - Secondary */}
            <a 
              href={YOUTUBE_SUBSCRIBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 text-gray-400 hover:text-white transition-all group"
            >
              <FaYoutube className="text-red-500 text-xl group-hover:scale-110 transition-transform" />
              <span className="text-sm">עקבו אחרינו ביוטיוב לצפייה בפרקים ותוכן בלעדי</span>
            </a>
          </div>
        </section>

        {/* Radio Player Section */}
        <section className="py-12 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="glass-warm rounded-3xl p-8 border border-purple-500/20 shadow-2xl shadow-purple-500/10">
              
              {/* Live Badge */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <span className={'relative flex h-3 w-3 ' + (isPlaying ? '' : 'opacity-50')}>
                  <span className={(isPlaying ? 'animate-ping ' : '') + 'absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75'}></span>
                  <span className={'relative inline-flex rounded-full h-3 w-3 ' + (isPlaying ? 'bg-red-500' : 'bg-gray-500')}></span>
                </span>
                <span className="text-sm font-medium text-gray-300">{isPlaying ? 'משדר עכשיו' : 'לחצו להאזנה'}</span>
                <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full">
                  <FaUsers className="text-purple-400 text-sm" />
                  <span className="text-sm text-gray-300">{(nowPlaying?.listeners?.current || 0) + 5} מאזינים</span>
                </div>
              </div>

              {/* Player Content */}
              <div className="flex flex-col sm:flex-row items-center gap-6">
                
                {/* Album Art with Play Button */}
                <div className="relative flex-shrink-0">
                  <div className={'absolute -inset-3 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-2xl blur-lg opacity-40 ' + (isPlaying ? 'animate-pulse' : '')}></div>
                  <div className="relative w-40 h-40 sm:w-48 sm:h-48">
                    <img
                      src={getAlbumArt()}
                      alt="Album Art"
                      className="w-full h-full object-cover rounded-xl border-2 border-white/20 shadow-2xl"
                    />
                    {/* Play button centered on album art */}
                    <button
                      onClick={togglePlay}
                      className={'absolute inset-0 m-auto w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-xl transform hover:scale-110 ' + 
                        (isPlaying
                          ? 'bg-white/90 text-gray-900 hover:bg-white'
                          : 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-purple-500/50'
                        )}
                    >
                      {isPlaying ? <FaPause className="text-2xl" /> : <FaPlay className="text-2xl ml-1" />}
                    </button>
                    {isPlaying && (
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                        <HiMusicNote className="text-white text-lg" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Track Info & Controls */}
                <div className="flex-1 text-center sm:text-right">
                  <p className="text-sm text-purple-400 font-medium mb-2">מתנגן עכשיו</p>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                    {currentSong?.title || 'טוען...'}
                  </h2>
                  <p className="text-lg text-gray-300 mb-4">
                    {currentSong?.artist || 'יוצאים לטראק'}
                  </p>

                  {/* Visualizer */}
                  <div className="mb-4">
                    <Visualizer isPlaying={isPlaying} />
                  </div>

                  {/* Volume Control */}
                  <div className="flex items-center gap-3 bg-black/40 rounded-xl px-4 py-3 max-w-xs mx-auto sm:mx-0">
                    <button onClick={() => setIsMuted(!isMuted)} className="text-gray-400 hover:text-white transition">
                      {isMuted || volume === 0 ? <FaVolumeMute className="text-lg" /> : <FaVolumeUp className="text-lg" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => { setVolume(parseFloat(e.target.value)); setIsMuted(false); }}
                      className="flex-1 accent-purple-500 h-1.5 bg-white/10 rounded-full cursor-pointer"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom text */}
              <p className="text-center text-xs text-gray-500 mt-6">
                🎵 הטראקים שלכם יכולים להתנגן כאן — הצטרפו עכשיו!
              </p>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="glass-warm rounded-3xl p-8 text-center border border-purple-500/10 hover:border-purple-500/30 transition-all">
                <div className="text-4xl mb-4">🎵</div>
                <h3 className="text-xl font-bold text-white mb-2">רוטציה ברדיו</h3>
                <p className="text-gray-400 text-sm leading-relaxed">הטראקים שלכם משודרים 24/7 ברדיו עם אלפי מאזינים</p>
              </div>
              <div className="glass-warm rounded-3xl p-8 text-center border border-cyan-500/10 hover:border-cyan-500/30 transition-all">
                <div className="text-4xl mb-4">🎤</div>
                <h3 className="text-xl font-bold text-white mb-2">קרדיט מלא</h3>
                <p className="text-gray-400 text-sm leading-relaxed">השם והלינקים שלכם מופיעים לכל המאזינים</p>
              </div>
              <div className="glass-warm rounded-3xl p-8 text-center border border-pink-500/10 hover:border-pink-500/30 transition-all">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-xl font-bold text-white mb-2">קידום הקריירה</h3>
                <p className="text-gray-400 text-sm leading-relaxed">הצטרפו לקהילת האמנים שלנו וקבלו חשיפה לקהל חדש</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <FaQuestionCircle className="text-4xl text-purple-500 mx-auto mb-4" />
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">שאלות נפוצות</h2>
            </div>
            <div className="space-y-4">
              {FAQ_ITEMS.map((item, index) => (
                <div key={index} className="glass-warm rounded-3xl overflow-hidden border border-white/5">
                  <button onClick={() => setOpenFaq(openFaq === index ? null : index)} className="w-full px-8 py-6 flex items-center justify-between text-right hover:bg-white/5 transition-colors">
                    <span className="font-bold text-white">{item.question}</span>
                    <FaChevronDown className={`text-purple-400 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === index && <div className="px-8 pb-8 text-gray-400 leading-relaxed text-sm animate-fade-in">{item.answer}</div>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA with Signup */}
        <section id="signup-section" className="py-32 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="glass-warm rounded-[3rem] p-12 border border-purple-500/20 shadow-2xl shadow-purple-500/10">
              <FaRocket className="text-5xl text-purple-500 mx-auto mb-8 animate-bounce" />
              <h2 className="text-3xl md:text-4xl font-black mb-6">מוכנים לשיגור?</h2>
              <p className="text-gray-400 mb-10 text-lg">הצטרפו למשפחת "יוצאים לטראק" והתחילו לשדר היום</p>
              <div className="flex flex-col items-center gap-4 mb-6">
                <a 
                  href={YOUTUBE_SUBSCRIBE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 bg-red-600 hover:bg-red-500 text-white font-bold py-4 px-8 rounded-full transition-all shadow-lg shadow-red-600/30 w-full max-w-xs"
                >
                  <FaYoutube className="text-xl" />
                  <span>שלב 1: הרשמו ליוטיוב</span>
                </a>
                <div className="text-gray-500 text-sm">👇 אחרי שנרשמתם 👇</div>
                <GoogleLoginButton />
              </div>
              <p className="text-[10px] text-gray-600">בהרשמה אתם מאשרים שאתם עוקבים אחרי ערוץ היוטיוב ומסכימים לתנאי השימוש</p>
            </div>
          </div>
        </section>

        {/* Bottom YouTube CTA - For non-artists */}
        <section className="py-16 px-6 border-t border-white/5">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-gray-500 mb-6">עדיין לא מוכנים להגיש מוזיקה? אפשר בינתיים לעקוב 👇</p>
            <a 
              href={YOUTUBE_SUBSCRIBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 bg-white/5 hover:bg-red-600/20 border border-white/10 hover:border-red-500/30 text-white font-semibold py-4 px-8 rounded-full transition-all"
            >
              <FaYoutube className="text-red-500 text-xl" />
              <span>הירשמו לערוץ היוטיוב</span>
            </a>
          </div>
        </section>
      </div>
    </>
  );
}
// pages/radio/index.tsx - Complete Code with Smart Fallback
import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { 
  FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaInstagram, 
  FaSoundcloud, FaMusic, FaUsers, FaArrowLeft, FaUpload
} from 'react-icons/fa';
import { HiSparkles, HiMusicNote } from 'react-icons/hi';

const AZURACAST_API_URL = 'https://a12.asurahosting.com/api/nowplaying/track_trip_radio';
const STREAM_URL = 'https://a12.asurahosting.com/listen/track_trip_radio/radio.mp3';

interface NowPlayingData {
  station: { name: string; listen_url: string; };
  now_playing: { song: { title: string; artist: string; art: string; }; elapsed: number; duration: number; };
  playing_next?: { song: { title: string; artist: string; art: string; }; };
  listeners: { current: number; unique: number; };
  live: { is_live: boolean; streamer_name: string; };
}

const mockData: NowPlayingData = {
  station: { name: 'Track Trip Radio', listen_url: STREAM_URL },
  now_playing: { song: { title: 'ממתין לשידור...', artist: 'יוצאים לטראק', art: '' }, elapsed: 0, duration: 0 },
  listeners: { current: 0, unique: 0 },
  live: { is_live: false, streamer_name: '' },
};

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
  const [heights, setHeights] = useState<number[]>(Array(20).fill(8));
  useEffect(() => {
    if (!isPlaying) { setHeights(Array(20).fill(8)); return; }
    const interval = setInterval(() => {
      setHeights(Array(20).fill(0).map(() => Math.random() * 40 + 10));
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying]);
  
  return (
    <div className="flex items-end justify-center gap-1 h-12 mb-8">
      {heights.map((height, i) => (
        <div key={i} className={`w-1.5 rounded-full transition-all duration-100 ${isPlaying ? 'bg-gradient-to-t from-purple-500 to-cyan-400' : 'bg-white/10'}`}
          style={{ height: `${height}px`, boxShadow: isPlaying ? '0 0 15px rgba(147, 51, 234, 0.3)' : 'none' }}
        />
      ))}
    </div>
  );
};

export default function RadioPage() {
  const [nowPlaying, setNowPlaying] = useState<NowPlayingData>(mockData);
  const [artistDetails, setArtistDetails] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch Artist metadata from our own Supabase DB
  const updateArtistSpotlight = async (artistName: string) => {
    try {
      // Avoid searching for placeholders to save API calls
      if (!artistName || artistName === 'Track Trip Radio' || artistName === 'Unknown Artist') {
        setArtistDetails(null);
        return;
      }

      const res = await fetch(`/api/radio/get-artist-details?name=${encodeURIComponent(artistName)}`);
      if (res.ok) {
        const data = await res.json();
        setArtistDetails(data);
      } else {
        setArtistDetails(null); // Artist not found in DB -> Switch to Fallback Mode
      }
    } catch (err) {
      setArtistDetails(null);
    }
  };

  const fetchNowPlaying = async () => {
    try {
      const response = await fetch(AZURACAST_API_URL);
      if (response.ok) {
        const data = await response.json();
        const currentArtistName = nowPlaying?.now_playing?.song?.artist;
        const newArtistName = data.now_playing.song.artist;
        
        // If the artist changed since the last poll, update our spotlight
        if (newArtistName !== currentArtistName) {
          updateArtistSpotlight(newArtistName);
        }
        setNowPlaying(data);
      }
    } catch (err) { console.log('Stream offline or blocked'); }
  };

  useEffect(() => {
    document.documentElement.setAttribute('dir', 'rtl');
    fetchNowPlaying();
    const interval = setInterval(fetchNowPlaying, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    audioRef.current = new Audio(STREAM_URL);
    audioRef.current.volume = volume;
    audioRef.current.addEventListener('error', () => { setIsPlaying(false); });
    return () => { if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; } };
  }, []);

  useEffect(() => { if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume; }, [volume, isMuted]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) { 
      audioRef.current.pause(); 
      setIsPlaying(false); 
    } else { 
      audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error); 
    }
  };

  const currentSong = nowPlaying?.now_playing?.song;

  return (
    <>
      <Head>
        <title>{currentSong?.title ? `${currentSong.title} | רדיו יוצאים לטראק` : 'רדיו יוצאים לטראק'}</title>
      </Head>

      <style jsx global>{`
        @keyframes float-slow { 0%, 100% { transform: translateY(0); opacity: 0.1; } 50% { transform: translateY(-30px); opacity: 0.2; } }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .glass-warm {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(59, 130, 246, 0.05) 50%, rgba(236, 72, 153, 0.08) 100%);
          backdrop-filter: blur(25px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
      `}</style>

      <div className="min-h-screen bg-[#0a0a12] text-white font-['Rubik',sans-serif]">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
          <FloatingNotes />
        </div>

        <Navigation />

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-12 md:py-20">
          
          {/* MAIN GRID LAYOUT */}
          <div className="grid lg:grid-cols-12 gap-8 items-stretch">
            
            {/* COLUMN 1: ARTIST SPOTLIGHT OR FALLBACK (4/12) */}
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="glass-warm h-full rounded-[2.5rem] p-8 md:p-10 border border-white/5 flex flex-col items-center text-center">
                
                {/* Header that changes based on context */}
                <div className="flex items-center gap-2 mb-8 text-purple-400 font-bold tracking-widest uppercase text-xs">
                  <HiSparkles /> {artistDetails ? 'הכירו את האמן' : 'מתנגן כעת'}
                </div>

                {artistDetails ? (
                  /* === SCENARIO A: Artist IS in Database === */
                  <div className="w-full flex flex-col items-center animate-fade-in">
                    <div className="relative w-48 h-48 md:w-64 md:h-64 mb-8">
                       <div className="absolute -inset-4 bg-gradient-to-tr from-purple-600 to-pink-600 rounded-full blur-2xl opacity-20 animate-pulse" />
                       <img 
                        src={artistDetails.image_url || '/images/logo.png'} 
                        className="relative w-full h-full object-cover rounded-full border-4 border-white/5 shadow-2xl" 
                        alt={artistDetails.name}
                       />
                    </div>
                    
                    <h2 className="text-3xl font-black mb-3">{artistDetails.name}</h2>
                    
                    {artistDetails.bio && (
                      <div className="text-gray-400 text-sm leading-relaxed mb-8 max-w-sm italic line-clamp-4 relative">
                        "{artistDetails.bio}"
                      </div>
                    )}

                    <div className="flex gap-4 w-full justify-center mt-auto">
                      {artistDetails.instagram && (
                        <a href={artistDetails.instagram.startsWith('http') ? artistDetails.instagram : `https://instagram.com/${artistDetails.instagram}`} target="_blank" className="p-4 bg-white/5 hover:bg-pink-600/20 rounded-2xl border border-white/5 transition-all text-pink-400 hover:scale-110">
                          <FaInstagram className="text-2xl" />
                        </a>
                      )}
                      {artistDetails.soundcloud && (
                        <a href={artistDetails.soundcloud} target="_blank" className="p-4 bg-white/5 hover:bg-orange-600/20 rounded-2xl border border-white/5 transition-all text-orange-400 hover:scale-110">
                          <FaSoundcloud className="text-2xl" />
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  /* === SCENARIO B: Regular Track / Fallback === */
                  <div className="w-full flex flex-col items-center animate-fade-in">
                    <div className="relative w-48 h-48 md:w-64 md:h-64 mb-8">
                       {/* Use Album Art from Stream */}
                       <img 
                        src={currentSong?.art || '/images/logo.png'} 
                        className="relative w-full h-full object-cover rounded-3xl border-2 border-white/10 shadow-2xl" 
                        alt="Album Art"
                       />
                    </div>
                    
                    <h2 className="text-2xl font-bold mb-2 text-white">{currentSong?.artist || 'Track Trip Radio'}</h2>
                    <p className="text-purple-400 text-lg mb-8 line-clamp-2">{currentSong?.title}</p>
                    
                    <div className="bg-white/5 rounded-2xl p-6 w-full max-w-xs border border-white/5">
                       <p className="text-gray-400 text-xs mb-4">
                         זהו טראק מהאוסף שלנו.
                         <br/>
                         רוצים שגם המוזיקה שלכם תופיע כאן עם פרופיל מלא?
                       </p>
                       <Link href="/radio/register" className="block w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-sm transition-colors shadow-lg">
                         שלחו טראק לשידור <FaUpload className="inline mr-1" />
                       </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* COLUMN 2: PLAYER & NOW PLAYING (7/12) */}
            <div className="lg:col-span-7 order-1 lg:order-2">
              <div className="glass-warm h-full rounded-[3rem] p-8 md:p-12 border border-purple-500/10 flex flex-col shadow-2xl">
                
                {/* Header Info */}
                <div className="flex justify-between items-center mb-12">
                   <div className={`flex items-center gap-3 rounded-full px-5 py-2 border ${isPlaying ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                      <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-red-500 animate-pulse' : 'bg-gray-600'}`} />
                      <span className="text-[10px] font-bold tracking-widest uppercase">{isPlaying ? 'On Air' : 'Radio Idle'}</span>
                   </div>
                   <div className="text-xs text-gray-500 flex items-center gap-2"><FaUsers /> {nowPlaying?.listeners?.current || 0} מאזינים</div>
                </div>

                {/* Track Info */}
                <div className="flex-1 flex flex-col items-center lg:items-end text-center lg:text-right">
                  <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter leading-tight text-white">
                    {currentSong?.title || 'טוען...'}
                  </h1>
                  <p className="text-2xl text-purple-400 font-medium mb-10">
                    {currentSong?.artist}
                  </p>

                  <Visualizer isPlaying={isPlaying} />

                  <div className="w-full flex flex-col md:flex-row items-center gap-8 mt-4">
                    <button 
                      onClick={togglePlay}
                      className={`w-24 h-24 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-2xl ${
                        isPlaying ? 'bg-white text-black hover:bg-gray-200' : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90'
                      }`}
                    >
                      {isPlaying ? <FaPause className="text-3xl" /> : <FaPlay className="text-3xl ml-2" />}
                    </button>

                    <div className="flex-1 w-full bg-black/40 rounded-3xl p-6 border border-white/5 flex items-center gap-4">
                       <button onClick={() => setIsMuted(!isMuted)} className="text-gray-400 hover:text-white transition-colors">
                          {isMuted || volume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
                       </button>
                       <input 
                         type="range" min="0" max="1" step="0.01" 
                         value={isMuted ? 0 : volume} 
                         onChange={(e) => { setVolume(parseFloat(e.target.value)); setIsMuted(false); }}
                         className="flex-1 accent-purple-500 h-1 bg-white/10 rounded-full cursor-pointer"
                         dir="ltr"
                       />
                    </div>
                  </div>
                </div>

                {/* Next Track Preview */}
                <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center"><HiMusicNote className="text-gray-500" /></div>
                      <div>
                        <div className="text-[10px] uppercase text-gray-500 font-bold">הבא בתור</div>
                        <div className="text-sm font-bold truncate max-w-[200px] text-gray-300">{nowPlaying?.playing_next?.song?.title || 'בקרוב...'}</div>
                      </div>
                   </div>
                   <Link href="/radio/register" className="flex items-center gap-2 text-xs text-purple-400 hover:text-white transition-colors">
                     רוצה לשדר כאן? <FaArrowLeft />
                   </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

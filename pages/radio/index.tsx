// pages/radio/index.tsx - Modern Radio Player
import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import Navigation from '@/components/Navigation';
import { 
  FaPlay, 
  FaPause, 
  FaVolumeUp, 
  FaVolumeMute,
  FaInstagram, 
  FaSoundcloud,
  FaMusic,
  FaHeadphones,
  FaUsers,
  FaUpload,
  FaArrowLeft
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

// Consistent Floating Notes from Dashboard
const FloatingNotes = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="absolute text-purple-500/10 animate-float-slow"
        style={{ left: `${15 + i * 15}%`, top: `${20 + (i % 3) * 25}%`, animationDelay: `${i * 0.8}s`, fontSize: `${24 + i * 8}px` }}
      > ♪ </div>
    ))}
  </div>
);

// Modern Audio Visualizer
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchNowPlaying = async () => {
    try {
      const response = await fetch(AZURACAST_API_URL);
      if (response.ok) { setNowPlaying(await response.json()); setError(null); }
    } catch (err) { console.log('Stream offline'); } finally { setIsLoading(false); }
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
    audioRef.current.addEventListener('error', () => { setError('הרדיו לא זמין כרגע'); setIsPlaying(false); });
    return () => { if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; } };
  }, []);

  useEffect(() => { if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume; }, [volume, isMuted]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else { audioRef.current.play().then(() => { setIsPlaying(true); setError(null); }).catch(() => setError('לא ניתן להפעיל כרגע')); }
  };

  const currentSong = nowPlaying.now_playing?.song;
  const nextSong = nowPlaying.playing_next?.song;
  const listeners = nowPlaying.listeners?.current || 0;

  return (
    <>
      <Head>
        <title>Radio | יוצאים לטראק</title>
        <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <style jsx global>{`
        @keyframes float-slow { 0%, 100% { transform: translateY(0); opacity: 0.1; } 50% { transform: translateY(-30px); opacity: 0.2; } }
        @keyframes gradient-shift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-gradient { background-size: 200% 200%; animation: gradient-shift 8s ease infinite; }
        .glass-warm {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(59, 130, 246, 0.05) 50%, rgba(236, 72, 153, 0.08) 100%);
          backdrop-filter: blur(25px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
      `}</style>

      <div className="min-h-screen bg-[#0a0a12] text-white font-['Rubik',sans-serif]">
        {/* Aesthetic Background */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] animate-gradient" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px] animate-gradient" style={{ animationDelay: '2s' }} />
          <FloatingNotes />
        </div>

        <Navigation />

        <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
          {/* Status Header */}
          <div className="flex justify-center mb-10">
            <div className={`flex items-center gap-3 rounded-full px-6 py-2.5 transition-all border ${isPlaying ? 'bg-red-500/10 border-red-500/30' : 'bg-white/5 border-white/10'}`}>
              <div className="relative flex h-3 w-3">
                <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${isPlaying ? 'bg-red-400 animate-ping' : 'bg-gray-500'}`} />
                <span className={`relative inline-flex rounded-full h-3 w-3 ${isPlaying ? 'bg-red-500' : 'bg-gray-600'}`} />
              </div>
              <span className={`text-xs font-bold tracking-widest uppercase ${isPlaying ? 'text-red-400' : 'text-gray-500'}`}>
                {isPlaying ? 'Live on Air' : 'Radio Offline'}
              </span>
              {listeners > 0 && <div className="mr-3 pr-3 border-r border-white/10 text-xs text-gray-400 flex items-center gap-2"><FaUsers /> {listeners}</div>}
            </div>
          </div>

          {/* Player Card */}
          <div className="glass-warm rounded-[3rem] p-8 md:p-16 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 opacity-30" />
            
            <div className="flex flex-col items-center">
              {/* Spinning Art Container */}
              <div className="relative mb-10 group">
                <div className={`absolute -inset-6 rounded-full blur-2xl transition-opacity duration-1000 ${isPlaying ? 'bg-purple-600/20 opacity-100' : 'opacity-0'}`} />
                <div className={`relative w-64 h-64 md:w-80 md:h-80 rounded-[2.5rem] overflow-hidden border-2 border-white/5 transition-transform duration-700 ${isPlaying ? 'scale-105 shadow-2xl' : 'scale-100'}`}>
                  {currentSong?.art ? (
                    <Image src={currentSong.art} alt="Art" fill className="object-cover" unoptimized />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                      <FaMusic className={`text-7xl ${isPlaying ? 'text-purple-500/40 animate-pulse' : 'text-white/5'}`} />
                    </div>
                  )}
                </div>
              </div>

              <Visualizer isPlaying={isPlaying} />

              {/* Title & Artist */}
              <div className="text-center mb-10 max-w-xl">
                <h1 className="text-3xl md:text-5xl font-bold mb-3 tracking-tight text-white leading-tight">
                  {currentSong?.title || 'Radio יוצאים לטראק'}
                </h1>
                <p className="text-xl text-gray-400 font-light">
                  {currentSong?.artist || 'הבית של הטראנס הישראלי'}
                </p>
              </div>

              {/* Controls */}
              <div className="flex flex-col items-center gap-8 w-full max-w-sm">
                <button 
                  onClick={togglePlay}
                  className={`w-24 h-24 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-xl ${
                    isPlaying 
                      ? 'bg-white text-black shadow-white/10' 
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-purple-500/20'
                  }`}
                >
                  {isPlaying ? <FaPause className="text-3xl" /> : <FaPlay className="text-3xl ml-2" />}
                </button>

                <div className="flex items-center gap-4 w-full px-6 py-3 bg-black/20 rounded-2xl border border-white/5">
                  <button onClick={() => setIsMuted(!isMuted)} className="text-gray-400 hover:text-white transition-colors">
                    {isMuted || volume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
                  </button>
                  <input 
                    type="range" min="0" max="1" step="0.01" 
                    value={isMuted ? 0 : volume} 
                    onChange={(e) => { setVolume(parseFloat(e.target.value)); setIsMuted(false); }}
                    className="flex-1 accent-purple-500 h-1 bg-white/10 rounded-full cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Up Next & CTA Section */}
          <div className="grid md:grid-cols-2 gap-6 mt-8">
          {/* Up Next */}
<div className="glass-warm rounded-3xl p-6 flex items-center gap-5 border border-white/5">
   <div className="w-16 h-16 rounded-2xl bg-white/5 flex-shrink-0 overflow-hidden relative">
     {nextSong?.art && nextSong.art.length > 0 ? (
       <Image src={nextSong.art} alt="Next" fill className="object-cover" unoptimized />
     ) : (
       <FaMusic className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-700" />
     )}
   </div>
   <div>
     <div className="text-[10px] uppercase tracking-widest text-purple-400 font-bold mb-1">Up Next</div>
     <h3 className="font-bold text-white text-sm truncate max-w-[150px]">{nextSong?.title || 'טראק חדש בקרוב'}</h3>
     <p className="text-xs text-gray-500 truncate">{nextSong?.artist || 'יוצאים לטראק'}</p>
   </div>
</div>

             {/* Artist CTA */}
             <Link href="/radio/register" className="glass-warm rounded-3xl p-6 flex items-center justify-between border border-purple-500/20 hover:border-purple-500/40 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <FaUpload className="text-white text-sm" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">יוצרים מוזיקה?</h3>
                    <p className="text-xs text-gray-500">שלחו טראק לשידור ברדיו</p>
                  </div>
                </div>
                <FaArrowLeft className="text-gray-600 group-hover:text-purple-400 group-hover:-translate-x-1 transition-all" />
             </Link>
          </div>
        </div>
      </div>
    </>
  );
}

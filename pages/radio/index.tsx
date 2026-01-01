// pages/radio/index.tsx - Radio Player Page with Trance/Festival Vibes
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

// Azuracast API URL - update this when station is ready
const AZURACAST_API_URL = 'https://a12.asurahosting.com/api/nowplaying/track_trip_radio';
const STREAM_URL = 'https://a12.asurahosting.com:9430/stream';

interface NowPlayingData {
  station: {
    name: string;
    listen_url: string;
  };
  now_playing: {
    song: {
      title: string;
      artist: string;
      art: string;
    };
    elapsed: number;
    duration: number;
  };
  playing_next?: {
    song: {
      title: string;
      artist: string;
      art: string;
    };
  };
  listeners: {
    current: number;
    unique: number;
  };
  live: {
    is_live: boolean;
    streamer_name: string;
  };
}

// Mock data for development/preview when stream is offline
const mockData: NowPlayingData = {
  station: {
    name: 'Track Trip Radio',
    listen_url: STREAM_URL,
  },
  now_playing: {
    song: {
     title: 'ממתין לשידור...',
artist: 'יוצאים לטראק',
      art: '',
    },
    elapsed: 0,
    duration: 0,
  },
  listeners: {
    current: 0,
    unique: 0,
  },
  live: {
    is_live: false,
    streamer_name: '',
  },
};

// Particle component for background
const Particles = ({ isPlaying }: { isPlaying: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<any[]>([]);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize particles
    const particleCount = 80;
    particlesRef.current = [];
    
    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2,
        hue: Math.random() > 0.5 ? 280 : 190, // Purple or Cyan
        pulse: Math.random() * Math.PI * 2,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle, index) => {
        // Update position
        const speedMultiplier = isPlaying ? 2 : 1;
        particle.x += particle.speedX * speedMultiplier;
        particle.y += particle.speedY * speedMultiplier;
        particle.pulse += 0.02;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Pulsing size and opacity when playing
        const pulseAmount = isPlaying ? Math.sin(particle.pulse) * 0.5 + 0.5 : 0.5;
        const currentSize = particle.size * (isPlaying ? (1 + pulseAmount * 0.5) : 1);
        const currentOpacity = particle.opacity * (isPlaying ? (0.5 + pulseAmount * 0.5) : 0.5);

        // Draw particle with glow
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, currentSize * 3
        );
        gradient.addColorStop(0, `hsla(${particle.hue}, 100%, 70%, ${currentOpacity})`);
        gradient.addColorStop(0.5, `hsla(${particle.hue}, 100%, 50%, ${currentOpacity * 0.5})`);
        gradient.addColorStop(1, `hsla(${particle.hue}, 100%, 50%, 0)`);
        ctx.fillStyle = gradient;
        ctx.arc(particle.x, particle.y, currentSize * 3, 0, Math.PI * 2);
        ctx.fill();

        // Connect nearby particles when playing
        if (isPlaying) {
          particlesRef.current.forEach((otherParticle, otherIndex) => {
            if (index === otherIndex) return;
            const dx = particle.x - otherParticle.x;
            const dy = particle.y - otherParticle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) {
              ctx.beginPath();
              ctx.strokeStyle = `hsla(${particle.hue}, 100%, 60%, ${(1 - distance / 100) * 0.15})`;
              ctx.lineWidth = 0.5;
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(otherParticle.x, otherParticle.y);
              ctx.stroke();
            }
          });
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.7 }}
    />
  );
};

// Audio Visualizer Bars
const Visualizer = ({ isPlaying }: { isPlaying: boolean }) => {
  const [heights, setHeights] = useState<number[]>(Array(20).fill(8));
  
  useEffect(() => {
    if (!isPlaying) {
      setHeights(Array(20).fill(8));
      return;
    }
    
    const interval = setInterval(() => {
      setHeights(Array(20).fill(0).map(() => Math.random() * 40 + 10));
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);
  
  return (
    <div className="flex items-end justify-center gap-1 h-16 mb-6">
      {heights.map((height, i) => (
        <div
          key={i}
          className={`w-2 rounded-full transition-all duration-100 ${
            isPlaying 
              ? 'bg-gradient-to-t from-purple-600 to-cyan-400' 
              : 'bg-gray-700'
          }`}
          style={{
            height: `${height}px`,
            boxShadow: isPlaying ? '0 0 10px rgba(147, 51, 234, 0.5)' : 'none',
          }}
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

  // Fetch now playing data
  const fetchNowPlaying = async () => {
    try {
      const response = await fetch(AZURACAST_API_URL);
      if (response.ok) {
        const data = await response.json();
        setNowPlaying(data);
        setError(null);
      }
    } catch (err) {
      console.log('Stream offline or API unavailable');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('dir', 'rtl');
    fetchNowPlaying();
    const interval = setInterval(fetchNowPlaying, 10000);
    return () => clearInterval(interval);
  }, []);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio(STREAM_URL);
    audioRef.current.volume = volume;
    
    audioRef.current.addEventListener('error', () => {
      setError('הרדיו לא זמין כרגע');
      setIsPlaying(false);
    });

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Handle volume changes
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
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        setError(null);
      }).catch((err) => {
        console.error('Playback error:', err);
        setError('לא ניתן להפעיל את הרדיו כרגע');
      });
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0) setIsMuted(false);
  };

  const currentSong = nowPlaying.now_playing?.song;
  const nextSong = nowPlaying.playing_next?.song;
  const listeners = nowPlaying.listeners?.current || 0;

  return (
    <>
      <Head>
        <title>הרדיו של יוצאים לטראק</title>
        <meta name="description" content="רדיו טראנס ישראלי - האזינו לטראקים הכי טריים מאמנים ישראלים" />
      </Head>

      {/* Animated gradient background */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse at 20% 20%, rgba(147, 51, 234, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(6, 182, 212, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(147, 51, 234, 0.05) 0%, transparent 70%),
            linear-gradient(to bottom, #050814, #0a0a1f, #000)
          `,
        }}
      />

      {/* Particles */}
      <Particles isPlaying={isPlaying} />

      <style jsx global>{`
        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(147, 51, 234, 0.5), 0 0 40px rgba(147, 51, 234, 0.3), 0 0 60px rgba(147, 51, 234, 0.1);
          }
          50% {
            box-shadow: 0 0 30px rgba(6, 182, 212, 0.6), 0 0 60px rgba(6, 182, 212, 0.4), 0 0 90px rgba(6, 182, 212, 0.2);
          }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }

        @keyframes borderGlow {
          0%, 100% { border-color: rgba(147, 51, 234, 0.5); }
          50% { border-color: rgba(6, 182, 212, 0.5); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

      <div className="relative z-10 min-h-screen text-white">
        <Navigation />

        <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
          
          {/* Live Badge */}
          <div className="flex justify-center mb-8">
            <div className={`flex items-center gap-2 rounded-full px-5 py-2.5 transition-all duration-500 ${
              isPlaying 
                ? 'bg-red-500/30 border border-red-500/50 shadow-lg shadow-red-500/20' 
                : 'bg-gray-800/50 border border-gray-700'
            }`}>
              <span className="relative flex h-3 w-3">
                <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isPlaying ? 'bg-red-400 animate-ping' : ''
                }`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${
                  isPlaying ? 'bg-red-500' : 'bg-gray-500'
                }`}></span>
              </span>
              <span className={`text-sm font-bold tracking-wider ${isPlaying ? 'text-red-300' : 'text-gray-400'}`}>
                {isPlaying ? 'ON AIR' : 'OFFLINE'}
              </span>
              {listeners > 0 && (
                <span className="flex items-center gap-1 text-sm text-gray-300 mr-2 pr-3 border-r border-gray-600">
                  <FaUsers className="text-xs" />
                  {listeners}
                </span>
              )}
            </div>
          </div>

          {/* Main Player Card */}
          <div 
            className={`relative bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl rounded-3xl p-6 md:p-10 border transition-all duration-500 ${
              isPlaying 
                ? 'border-purple-500/30 shadow-2xl shadow-purple-500/10' 
                : 'border-gray-800'
            }`}
            style={{
              animation: isPlaying ? 'borderGlow 3s ease-in-out infinite' : 'none',
            }}
          >
            
            {/* Decorative corner accents */}
            <div className={`absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 rounded-tl-3xl transition-colors duration-500 ${
              isPlaying ? 'border-purple-500/50' : 'border-gray-800'
            }`} />
            <div className={`absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 rounded-br-3xl transition-colors duration-500 ${
              isPlaying ? 'border-cyan-500/50' : 'border-gray-800'
            }`} />

            {/* Album Art with Glow */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                {/* Outer glow ring */}
                <div 
                  className={`absolute -inset-4 rounded-full blur-xl transition-opacity duration-500 ${
                    isPlaying ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{
                    background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.4), rgba(6, 182, 212, 0.4))',
                    animation: isPlaying ? 'pulse 2s ease-in-out infinite' : 'none',
                  }}
                />
                
                {/* Spinning border ring */}
                <div 
                  className={`absolute -inset-2 rounded-2xl transition-opacity duration-500 ${
                    isPlaying ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{
                    background: 'linear-gradient(135deg, #9333ea, #06b6d4, #9333ea)',
                    animation: isPlaying ? 'spin 8s linear infinite' : 'none',
                    padding: '2px',
                  }}
                >
                  <div className="w-full h-full bg-black rounded-2xl" />
                </div>

                {/* Album art container */}
                <div 
                  className={`relative w-64 h-64 md:w-72 md:h-72 rounded-2xl overflow-hidden transition-all duration-500 ${
                    isPlaying ? 'shadow-2xl' : ''
                  }`}
                  style={{
                    animation: isPlaying ? 'glow 3s ease-in-out infinite' : 'none',
                  }}
                >
                  {currentSong?.art ? (
                    <Image
                      src={currentSong.art}
                      alt={currentSong.title || 'Album Art'}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-900/50 to-cyan-900/50 flex items-center justify-center">
                      <div className="text-center">
                        <FaMusic 
                          className={`text-6xl md:text-7xl mx-auto mb-4 transition-all duration-500 ${
                            isPlaying ? 'text-purple-400 animate-pulse' : 'text-purple-500/50'
                          }`}
                        />
                        <div className={`text-lg font-medium transition-colors duration-500 ${
                          isPlaying ? 'text-purple-300' : 'text-purple-400/50'
                        }`}>
                         יוצאים לטראק

                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Visualizer */}
            <Visualizer isPlaying={isPlaying} />

            {/* Track Info */}
            <div className="text-center mb-6">
              <h1 
                className={`text-2xl md:text-4xl font-bold mb-2 transition-all duration-500 ${
                  isPlaying 
                    ? 'bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent' 
                    : 'text-gray-300'
                }`}
                style={{
                  backgroundSize: '200% auto',
                  animation: isPlaying ? 'shimmer 3s linear infinite' : 'none',
                }}
              >
               {currentSong?.title || 'הרדיו של יוצאים לטראק'}
              </h1>
              <p className={`text-lg md:text-xl transition-colors duration-500 ${
                isPlaying ? 'text-gray-300' : 'text-gray-500'
              }`}>
               {currentSong?.artist || 'טראנס ישראלי 24/7'}
              </p>
            </div>

            {/* Artist Social Links */}
            {currentSong?.artist && currentSong.artist !== 'יוצאים לטראק' && (
              <div className="flex justify-center gap-3 mb-8">
                <button className="flex items-center gap-2 bg-gradient-to-r from-pink-600/80 to-purple-600/80 hover:from-pink-500 hover:to-purple-500 text-white px-4 py-2 rounded-full transition-all text-sm backdrop-blur-sm border border-pink-500/30 hover:scale-105">
                  <FaInstagram />
                  Instagram
                </button>
                <button className="flex items-center gap-2 bg-gradient-to-r from-orange-600/80 to-orange-500/80 hover:from-orange-500 hover:to-orange-400 text-white px-4 py-2 rounded-full transition-all text-sm backdrop-blur-sm border border-orange-500/30 hover:scale-105">
                  <FaSoundcloud />
                  SoundCloud
                </button>
              </div>
            )}

            {/* Play Controls */}
            <div className="flex flex-col items-center gap-6">
              {/* Play Button */}
              <div className="relative">
                {/* Outer pulse rings */}
                {isPlaying && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-ping" style={{ animationDuration: '2s' }} />
                    <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 animate-pulse" />
                  </>
                )}
                
                <button
                  onClick={togglePlay}
                  className={`relative w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 ${
                    isPlaying
                      ? 'bg-gradient-to-r from-purple-600 to-cyan-600 shadow-lg shadow-purple-500/50'
                      : 'bg-gradient-to-r from-purple-600/80 to-cyan-600/80 hover:from-purple-500 hover:to-cyan-500'
                  }`}
                  style={{
                    animation: isPlaying ? 'glow 2s ease-in-out infinite' : 'none',
                  }}
                >
                  {isPlaying ? (
                    <FaPause className="text-3xl md:text-4xl text-white" />
                  ) : (
                    <FaPlay className="text-3xl md:text-4xl text-white mr-[-4px]" />
                  )}
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <p className="text-red-400 text-sm bg-red-500/10 px-4 py-2 rounded-full border border-red-500/30">
                  {error}
                </p>
              )}

              {/* Volume Control */}
              <div className="flex items-center gap-3 w-full max-w-xs bg-black/30 rounded-full px-4 py-2 border border-gray-800">
                <button
                  onClick={toggleMute}
                  className={`transition-colors ${
                    isPlaying ? 'text-purple-400 hover:text-purple-300' : 'text-gray-500 hover:text-gray-400'
                  }`}
                >
                  {isMuted || volume === 0 ? (
                    <FaVolumeMute className="text-xl" />
                  ) : (
                    <FaVolumeUp className="text-xl" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="flex-1 h-2 bg-gray-700 rounded-full appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-4
                    [&::-webkit-slider-thumb]:h-4
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-gradient-to-r
                    [&::-webkit-slider-thumb]:from-purple-500
                    [&::-webkit-slider-thumb]:to-cyan-500
                    [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-webkit-slider-thumb]:shadow-lg
                    [&::-webkit-slider-thumb]:shadow-purple-500/50"
                />
              </div>
            </div>
          </div>

          {/* Up Next Section */}
          {nextSong && (
            <div className={`mt-8 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl p-6 border transition-all duration-500 ${
              isPlaying ? 'border-purple-500/20' : 'border-gray-800'
            }`}>
              <h3 className="text-sm font-medium text-purple-400 mb-4 flex items-center gap-2">
                <FaHeadphones className={isPlaying ? 'animate-pulse' : ''} />
                הטראק הבא
              </h3>
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 transition-all duration-500 ${
                  isPlaying ? 'shadow-lg shadow-purple-500/20' : ''
                }`}>
                  {nextSong.art ? (
                    <Image
                      src={nextSong.art}
                      alt={nextSong.title}
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <FaMusic className="text-gray-600" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-white">{nextSong.title}</p>
                  <p className="text-sm text-gray-400">{nextSong.artist}</p>
                </div>
              </div>
            </div>
          )}

          {/* EPIC Artist CTA Section */}
          <div className="mt-12">
            <Link href="/radio/register">
              <div 
                className="relative group overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-900/30 via-black/50 to-cyan-900/30 p-8 md:p-10 cursor-pointer transition-all duration-500 hover:border-purple-500/60 hover:shadow-2xl hover:shadow-purple-500/20"
                style={{ animation: 'float 6s ease-in-out infinite' }}
              >
                {/* Background glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-transparent to-cyan-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Animated border gradient */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                  background: 'linear-gradient(90deg, transparent, rgba(147, 51, 234, 0.3), transparent)',
                  animation: 'shimmer 2s linear infinite',
                  backgroundSize: '200% 100%',
                }} />

                {/* Content */}
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-all duration-500 group-hover:scale-110">
                      <FaUpload className="text-3xl md:text-4xl text-white" />
                    </div>
                  </div>

                  {/* Text */}
                  <div className="text-center md:text-right flex-1">
                    <h3 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                      אמן/ית? הצטרפו לרדיו!
                    </h3>
                    <p className="text-gray-400 text-lg mb-4">
                      שלחו את הטראקים שלכם ותקבלו חשיפה לקהילת הטראנס הישראלית
                    </p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-3 text-sm">
                      <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full border border-purple-500/30">
                        ✓ חשיפה לאלפי מאזינים
                      </span>
                      <span className="bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full border border-cyan-500/30">
                        ✓ קרדיט מלא לאמן
                      </span>
                      <span className="bg-pink-500/20 text-pink-300 px-3 py-1 rounded-full border border-pink-500/30">
                        ✓ קישור לסושיאל
                      </span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex-shrink-0 hidden md:block">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all duration-500 group-hover:-translate-x-2">
                      <FaArrowLeft className="text-xl text-white" />
                    </div>
                  </div>
                </div>

                {/* Floating particles decoration */}
                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-purple-500/50 animate-ping" style={{ animationDuration: '3s' }} />
                <div className="absolute bottom-4 left-4 w-2 h-2 rounded-full bg-cyan-500/50 animate-ping" style={{ animationDuration: '4s' }} />
                <div className="absolute top-1/2 left-8 w-1.5 h-1.5 rounded-full bg-pink-500/50 animate-ping" style={{ animationDuration: '5s' }} />
              </div>
            </Link>
          </div>

          {/* Info Section */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {[
              { emoji: '🎵', title: 'טראנס ישראלי', desc: 'הטראקים הכי טריים מאמנים ישראלים' },
              { emoji: '🚀', title: 'אמנים חדשים', desc: 'במה לאמנים צעירים ומוזיקה חדשה' },
              { emoji: '📻', title: '24/7', desc: 'משדרים מסביב לשעון' },
            ].map((item, i) => (
              <div 
                key={i}
                className={`bg-gray-900/50 rounded-xl p-6 text-center border transition-all duration-500 hover:scale-105 ${
                  isPlaying 
                    ? 'border-purple-500/20 hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/10' 
                    : 'border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="text-3xl mb-3">{item.emoji}</div>
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}

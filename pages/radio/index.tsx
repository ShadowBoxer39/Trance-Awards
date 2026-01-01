// pages/radio/index.tsx - Radio Player Page with Trance/Festival Vibes
import { useState, useEffect, useRef, useCallback } from 'react';
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
  FaUsers
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
      title: 'Waiting for stream...',
      artist: 'Track Trip Radio',
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
  const animationRef = useRef<number>();

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
  const bars = 20;
  
  return (
    <div className="flex items-end justify-center gap-1 h-16 mb-6">
      {[...Array(bars)].map((_, i) => {
        const delay = i * 0.05;
        const baseHeight = 20 + Math.sin(i * 0.5) * 15;
        
        return (
          <div
            key={i}
            className={`w-2 rounded-full transition-all duration-150 ${
              isPlaying 
                ? 'bg-gradient-to-t from-purple-600 to-cyan-400' 
                : 'bg-gray-700'
            }`}
            style={{
              height: isPlaying ? `${baseHeight + Math.random() * 30}px` : '8px',
              animation: isPlaying ? `visualizer 0.5s ease-in-out infinite alternate` : 'none',
              animationDelay: `${delay}s`,
              boxShadow: isPlaying ? '0 0 10px rgba(147, 51, 234, 0.5)' : 'none',
            }}
          />
        );
      })}
      <style jsx>{`
        @keyframes visualizer {
          0% {
            height: 15px;
          }
          100% {
            height: ${Math.random() * 40 + 20}px;
          }
        }
      `}</style>
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
  const [visualizerHeights, setVisualizerHeights] = useState<number[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Randomize visualizer bars
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setVisualizerHeights(
        [...Array(20)].map(() => Math.random() * 40 + 10)
      );
    }, 150);

    return () => clearInterval(interval);
  }, [isPlaying]);

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
        <title>רדיו יוצאים לטראק | Track Trip Radio</title>
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
          animation: isPlaying ? 'gradientPulse 4s ease-in-out infinite' : 'none',
        }}
      />

      {/* Particles */}
      <Particles isPlaying={isPlaying} />

      <style jsx global>{`
        @keyframes gradientPulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
        
        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(147, 51, 234, 0.5), 0 0 40px rgba(147, 51, 234, 0.3), 0 0 60px rgba(147, 51, 234, 0.1);
          }
          50% {
            box-shadow: 0 0 30px rgba(6, 182, 212, 0.6), 0 0 60px rgba(6, 182, 212, 0.4), 0 0 90px rgba(6, 182, 212, 0.2);
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.8;
          }
        }

        @keyframes borderGlow {
          0%, 100% {
            border-color: rgba(147, 51, 234, 0.5);
          }
          50% {
            border-color: rgba(6, 182, 212, 0.5);
          }
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
                          Track Trip Radio
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
                  backgroundSize: isPlaying ? '200% auto' : '100% auto',
                  animation: isPlaying ? 'gradientShift 3s ease infinite' : 'none',
                }}
              >
                {currentSong?.title || 'Track Trip Radio'}
              </h1>
              <p className={`text-lg md:text-xl transition-colors duration-500 ${
                isPlaying ? 'text-gray-300' : 'text-gray-500'
              }`}>
                {currentSong?.artist || 'רדיו טראנס ישראלי'}
              </p>
            </div>

            <style jsx>{`
              @keyframes gradientShift {
                0%, 100% {
                  background-position: 0% center;
                }
                50% {
                  background-position: 100% center;
                }
              }
            `}</style>

            {/* Artist Social Links */}
            {currentSong?.artist && currentSong.artist !== 'Track Trip Radio' && (
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

          {/* Artist Portal Link */}
          <div className="mt-8 text-center">
            <Link
              href="/radio/register"
              className={`inline-flex items-center gap-2 transition-all px-6 py-3 rounded-full border ${
                isPlaying 
                  ? 'text-purple-300 border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20' 
                  : 'text-purple-400 border-gray-800 hover:border-purple-500/30'
              }`}
            >
              <FaMusic className={isPlaying ? 'animate-bounce' : ''} />
              אמן/ית? שלחו את המוזיקה שלכם לרדיו
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

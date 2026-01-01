// pages/radio/index.tsx - Radio Player Page
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

export default function RadioPage() {
  const [nowPlaying, setNowPlaying] = useState<NowPlayingData>(mockData);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [audioReady, setAudioReady] = useState(false);
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
      // Keep mock data, don't show error to user
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('dir', 'rtl');
    
    // Initial fetch
    fetchNowPlaying();

    // Poll for updates every 10 seconds
    const interval = setInterval(fetchNowPlaying, 10000);

    return () => clearInterval(interval);
  }, []);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio(STREAM_URL);
    audioRef.current.volume = volume;
    
    audioRef.current.addEventListener('canplay', () => {
      setAudioReady(true);
    });

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
    if (newVolume > 0) {
      setIsMuted(false);
    }
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

      <div className="min-h-screen bg-gradient-to-b from-[#050814] via-[#0a0a1f] to-black text-white">
        <Navigation />

        <div className="max-w-4xl mx-auto px-4 py-8 md:py-16">
          
          {/* Live Badge */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/50 rounded-full px-4 py-2">
              <span className="relative flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 ${!isPlaying ? 'hidden' : ''}`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${isPlaying ? 'bg-red-500' : 'bg-gray-500'}`}></span>
              </span>
              <span className="text-sm font-medium">
                {isPlaying ? 'LIVE' : 'OFFLINE'}
              </span>
              {listeners > 0 && (
                <span className="flex items-center gap-1 text-sm text-gray-400 mr-2 pr-2 border-r border-gray-600">
                  <FaUsers className="text-xs" />
                  {listeners}
                </span>
              )}
            </div>
          </div>

          {/* Main Player Card */}
          <div className="bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl rounded-3xl p-6 md:p-10 border border-gray-800 shadow-2xl">
            
            {/* Album Art */}
            <div className="flex justify-center mb-8">
              <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-purple-900/50 to-cyan-900/50">
                {currentSong?.art ? (
                  <Image
                    src={currentSong.art}
                    alt={currentSong.title || 'Album Art'}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <FaMusic className="text-6xl md:text-8xl text-purple-500/50 mx-auto mb-4" />
                      <div className="text-purple-400/50 text-lg">Track Trip Radio</div>
                    </div>
                  </div>
                )}
                
                {/* Animated ring when playing */}
                {isPlaying && (
                  <div className="absolute inset-0 border-4 border-purple-500/30 rounded-2xl animate-pulse"></div>
                )}
              </div>
            </div>

            {/* Track Info */}
            <div className="text-center mb-8">
              <h1 className="text-2xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                {currentSong?.title || 'Track Trip Radio'}
              </h1>
              <p className="text-lg md:text-xl text-gray-400">
                {currentSong?.artist || 'רדיו טראנס ישראלי'}
              </p>
            </div>

            {/* Artist Social Links - Placeholder, will be dynamic later */}
            {currentSong?.artist && currentSong.artist !== 'Track Trip Radio' && (
              <div className="flex justify-center gap-4 mb-8">
                <button className="flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white px-4 py-2 rounded-full transition-all text-sm">
                  <FaInstagram />
                  Instagram
                </button>
                <button className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white px-4 py-2 rounded-full transition-all text-sm">
                  <FaSoundcloud />
                  SoundCloud
                </button>
              </div>
            )}

            {/* Play Controls */}
            <div className="flex flex-col items-center gap-6">
              {/* Play Button */}
              <button
                onClick={togglePlay}
                disabled={!!error}
                className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/25"
              >
                {isPlaying ? (
                  <FaPause className="text-3xl md:text-4xl text-white" />
                ) : (
                  <FaPlay className="text-3xl md:text-4xl text-white mr-[-4px]" />
                )}
              </button>

              {/* Error Message */}
              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}

              {/* Volume Control */}
              <div className="flex items-center gap-3 w-full max-w-xs">
                <button
                  onClick={toggleMute}
                  className="text-gray-400 hover:text-white transition-colors"
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
                    [&::-webkit-slider-thumb]:shadow-lg"
                />
              </div>
            </div>
          </div>

          {/* Up Next Section */}
          {nextSong && (
            <div className="mt-8 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800">
              <h3 className="text-sm font-medium text-gray-500 mb-4 flex items-center gap-2">
                <FaHeadphones />
                הטראק הבא
              </h3>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
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
                    <div className="w-full h-full flex items-center justify-center">
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
              className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
            >
              <FaMusic />
              אמן/ית? שלחו את המוזיקה שלכם לרדיו
            </Link>
          </div>

          {/* Info Section */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="bg-gray-900/50 rounded-xl p-6 text-center border border-gray-800">
              <div className="text-3xl mb-3">🎵</div>
              <h3 className="font-bold mb-2">טראנס ישראלי</h3>
              <p className="text-sm text-gray-400">הטראקים הכי טריים מאמנים ישראלים</p>
            </div>
            <div className="bg-gray-900/50 rounded-xl p-6 text-center border border-gray-800">
              <div className="text-3xl mb-3">🚀</div>
              <h3 className="font-bold mb-2">אמנים חדשים</h3>
              <p className="text-sm text-gray-400">במה לאמנים צעירים ומוזיקה חדשה</p>
            </div>
            <div className="bg-gray-900/50 rounded-xl p-6 text-center border border-gray-800">
              <div className="text-3xl mb-3">📻</div>
              <h3 className="font-bold mb-2">24/7</h3>
              <p className="text-sm text-gray-400">משדרים מסביב לשעון</p>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

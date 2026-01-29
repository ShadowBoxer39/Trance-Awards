// pages/radio/index.tsx - Complete Radio Page Redesign v2
import { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import Navigation from '@/components/Navigation';
import RadioChat from '@/components/radio/RadioChat';
import RadioLeaderboard from '@/components/radio/RadioLeaderboard';
import ListenerProfileModal from '@/components/radio/ListenerProfileModal';
import ListeningTimeTracker from '@/components/radio/ListeningTimeTracker';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaUpload, FaInstagram, FaSoundcloud, FaChevronDown, FaChevronUp, FaHeart, FaRegHeart, FaHistory, FaCrown, FaForward } from 'react-icons/fa';
import { HiSparkles, HiMusicNote } from 'react-icons/hi';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const AZURACAST_API_URL = 'https://a12.asurahosting.com/api/nowplaying/track_trip_radio';
const STREAM_URL = 'https://a12.asurahosting.com/listen/track_trip_radio/radio.mp3';

interface NowPlayingData {
  now_playing: { song: { title: string; artist: string; art: string }; elapsed: number; duration: number };
  playing_next?: { song: { title: string; artist: string; art: string } };
  listeners: { current: number };
  song_history?: { song: { title: string; artist: string; art: string }; played_at: number }[];
}

interface ArtistDetails {
  name: string;
  bio: string;
  image_url: string;
  instagram: string;
  soundcloud: string;
  track_description: string | null;
  podcast_featured: boolean;
  is_premiere: boolean;
}

interface ListenerProfile {
  id: string;
  user_id: string;
  nickname: string;
  avatar_url: string;
  total_seconds: number;
}

interface HistoryTrack {
  title: string;
  artist: string;
  art: string;
  artistImage?: string;
  soundcloud?: string;
}

// Get or create fingerprint
const getFingerprint = (): string => {
  if (typeof window === 'undefined') return '';
  let fp = localStorage.getItem('radio_fingerprint');
  if (!fp) {
    fp = 'fp_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('radio_fingerprint', fp);
  }
  return fp;
};

// Extract dominant color from image
const extractColor = (imgSrc: string, callback: (color: string) => void) => {
  const img = new Image();
  img.crossOrigin = 'Anonymous';
  img.onload = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = 50;
    canvas.height = 50;
    ctx.drawImage(img, 0, 0, 50, 50);
    
    try {
      const data = ctx.getImageData(0, 0, 50, 50).data;
      let r = 0, g = 0, b = 0, count = 0;
      
      for (let i = 0; i < data.length; i += 16) {
        // Skip very dark or very light pixels
        if (data[i] + data[i+1] + data[i+2] > 60 && data[i] + data[i+1] + data[i+2] < 700) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }
      }
      
      if (count > 0) {
        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);
        callback(`${r}, ${g}, ${b}`);
      }
    } catch (e) {
      // CORS error, use default
      callback('147, 51, 234'); // Purple fallback
    }
  };
  img.onerror = () => callback('147, 51, 234');
  img.src = imgSrc;
};

// Visualizer component
const Visualizer = ({ isPlaying, color }: { isPlaying: boolean; color: string }) => {
  const [heights, setHeights] = useState<number[]>(Array(20).fill(6));
  
  useEffect(() => {
    if (!isPlaying) { 
      setHeights(Array(20).fill(6)); 
      return; 
    }
    const interval = setInterval(() => {
      setHeights(Array(20).fill(0).map(() => Math.random() * 32 + 8));
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="flex items-end justify-center gap-[3px] h-10">
      {heights.map((height, i) => (
        <div
          key={i}
          className="w-1 rounded-full transition-all duration-75"
          style={{ 
            height: height + 'px',
            background: isPlaying 
              ? `linear-gradient(to top, rgba(${color}, 0.8), rgba(${color}, 0.4))` 
              : 'rgba(255,255,255,0.2)'
          }}
        />
      ))}
    </div>
  );
};

export default function RadioPage() {
  // Auth & Profile state
  const [user, setUser] = useState<any>(null);
  const [listenerProfile, setListenerProfile] = useState<ListenerProfile | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [fingerprint, setFingerprint] = useState('');

  // Player state
  const [nowPlaying, setNowPlaying] = useState<NowPlayingData | null>(null);
  const [artistDetails, setArtistDetails] = useState<ArtistDetails | null>(null);
  const [nextArtistDetails, setNextArtistDetails] = useState<ArtistDetails | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // UI state
  const [bioExpanded, setBioExpanded] = useState(false);
  const [trackLikes, setTrackLikes] = useState(0);
  const [userLiked, setUserLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [songHistory, setSongHistory] = useState<HistoryTrack[]>([]);
  const [topTracks, setTopTracks] = useState<{track: string; artist: string; likes: number}[]>([]);
  const [dominantColor, setDominantColor] = useState('147, 51, 234'); // Default purple
  const [glowIntensity, setGlowIntensity] = useState(0.3);

  // Audio reactive glow
  useEffect(() => {
    if (!isPlaying) {
      setGlowIntensity(0.3);
      return;
    }
    
    const interval = setInterval(() => {
      // Simulate beat detection with random pulses
      const intensity = 0.3 + Math.random() * 0.4;
      setGlowIntensity(intensity);
    }, 150);
    
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Initialize
  useEffect(() => {
    document.documentElement.setAttribute('dir', 'rtl');
    setFingerprint(getFingerprint());
    
    const checkAuth = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) {
    setUser(session.user);
    const res = await fetch(`/api/radio/listener-profile?user_id=${session.user.id}`);
    if (res.ok) {
      const profile = await res.json();
      if (profile) {
        setListenerProfile(profile);
      } else {
        // Check if user exists in artists table
        const { data: existingArtist } = await supabase
          .from('artists')
          .select('name, image_url')
          .eq('email', session.user.email)
          .single();

        if (existingArtist) {
          // Auto-create listener profile from artist data
          const createRes = await fetch('/api/radio/listener-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: session.user.id,
              email: session.user.email,
              nickname: existingArtist.name,
              avatar_url: existingArtist.image_url || session.user.user_metadata?.avatar_url || '🎵'
            })
          });
          if (createRes.ok) {
            const newProfile = await createRes.json();
            setListenerProfile(newProfile);
          }
        } else {
          // Truly new user - show profile modal
          setIsNewUser(true);
          setShowProfileModal(true);
        }
      }
    }
  }
};
checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        const res = await fetch(`/api/radio/listener-profile?user_id=${session.user.id}`);
        if (res.ok) {
          const profile = await res.json();
          if (profile) {
            setListenerProfile(profile);
          } else {
            setIsNewUser(true);
            setShowProfileModal(true);
          }
        }
      }
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setListenerProfile(null);
      }
    });

    return () => { authListener.subscription.unsubscribe(); };
  }, []);

  // Fetch artist details
  const fetchArtistDetails = async (artistName: string, trackTitle?: string): Promise<ArtistDetails | null> => {
    try {
      if (!artistName || artistName === 'Track Trip Radio' || artistName === 'Unknown Artist') {
        return null;
      }
      let url = '/api/radio/get-artist-details?name=' + encodeURIComponent(artistName);
      if (trackTitle) {
        url += '&track=' + encodeURIComponent(trackTitle);
      }
      const res = await fetch(url);
      if (res.ok) {
        return await res.json();
      }
      return null;
    } catch {
      return null;
    }
  };

  const updateArtistSpotlight = async (artistName: string, trackTitle?: string) => {
    const details = await fetchArtistDetails(artistName, trackTitle);
    if (artistDetails?.name !== details?.name) {
      setBioExpanded(false);
    }
    setArtistDetails(details);
    
    if (trackTitle && artistName) {
      fetchTrackLikes(trackTitle, artistName);
    }
  };

  // Fetch track likes
  const fetchTrackLikes = async (trackName: string, artistName: string) => {
    try {
      const fp = getFingerprint();
      const params = new URLSearchParams({ track: trackName, artist: artistName });
      if (fp) params.append('fingerprint', fp);
      
      const res = await fetch(`/api/radio/track-likes?${params}`);
      if (res.ok) {
        const data = await res.json();
        setTrackLikes(data.likes);
        setUserLiked(data.userLiked);
      }
    } catch (err) {
      console.error('Error fetching likes:', err);
    }
  };

  // Handle like
  const handleLike = async () => {
    const currentSong = nowPlaying?.now_playing?.song;
    if (!currentSong || likeLoading || userLiked) return;
    
    setLikeLoading(true);
    try {
      const fp = getFingerprint();
      const res = await fetch('/api/radio/track-likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          track: currentSong.title,
          artist: currentSong.artist,
          fingerprint: fp
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setTrackLikes(data.likes);
        setUserLiked(true);
      }
    } catch (err) {
      console.error('Error liking track:', err);
    }
    setLikeLoading(false);
  };

  // Fetch now playing
  const fetchNowPlaying = async () => {
    try {
      const response = await fetch(AZURACAST_API_URL);
      if (response.ok) {
        const data = await response.json();
        const currentTrackTitle = nowPlaying?.now_playing?.song?.title;
        const newTrackTitle = data.now_playing.song.title;
        const newArtistName = data.now_playing.song.artist;
        
        // Track changed
        if (newTrackTitle !== currentTrackTitle) {
          updateArtistSpotlight(newArtistName, newTrackTitle);
          
          // Extract color from album art
          const artUrl = data.now_playing.song.art;
          if (artUrl && !artUrl.includes('/static/img/generic_song')) {
            extractColor(artUrl, setDominantColor);
          }
        }
        
        // Update next track artist
        if (data.playing_next?.song?.artist) {
          const nextDetails = await fetchArtistDetails(data.playing_next.song.artist);
          setNextArtistDetails(nextDetails);
        }
        
        // Update song history with artist images
        if (data.song_history) {
          const historyWithImages: HistoryTrack[] = await Promise.all(
            data.song_history.slice(0, 5).map(async (h: any) => {
              const details = await fetchArtistDetails(h.song.artist);
              return {
                title: h.song.title,
                artist: h.song.artist,
                art: h.song.art,
                artistImage: details?.image_url || h.song.art,
                soundcloud: details?.soundcloud || null
              };
            })
          );
          setSongHistory(historyWithImages);
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

  // Fetch top tracks
useEffect(() => {
  const fetchTopTracks = async () => {
    try {
      const res = await fetch('/api/radio/top-tracks?limit=5');
      if (res.ok) {
        const data = await res.json();
        setTopTracks(data);
      }
    } catch (err) {
      console.error('Failed to fetch top tracks:', err);
    }
  };
  fetchTopTracks();
  const interval = setInterval(fetchTopTracks, 5 * 60 * 1000);
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

  // Album art with fallback
  const getAlbumArt = () => {
    const art = nowPlaying?.now_playing?.song?.art;
    const isDefaultArt = !art || 
      art.includes('/static/img/generic_song') || 
      (art.includes('/api/station/') && !art.match(/\.(jpg|jpeg|png|webp)$/i));
    
    if (!isDefaultArt) return art;
    return artistDetails?.image_url || '/images/logo.png';
  };

  // Google login
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/radio' }
    });
  };

  // Save profile
  const handleSaveProfile = async (nickname: string, avatarUrl: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Not logged in' };

    try {
      const res = await fetch('/api/radio/listener-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          email: user.email,
          nickname,
          avatar_url: avatarUrl
        })
      });

      if (res.ok) {
        const profile = await res.json();
        setListenerProfile(profile);
        setIsNewUser(false);
        return { success: true };
      } else {
        const data = await res.json();
        return { success: false, error: data.error };
      }
    } catch {
      return { success: false, error: 'Network error' };
    }
  };

 // Open SoundCloud link
const openSoundCloud = (soundcloud?: string) => {
  if (!soundcloud) return;
  const url = soundcloud.startsWith('http') ? soundcloud : `https://soundcloud.com/${soundcloud}`;
  window.open(url, '_blank');
};

const currentSong = nowPlaying?.now_playing?.song;
const nextSong = nowPlaying?.playing_next?.song;
const bioIsLong = artistDetails?.bio && artistDetails.bio.length > 150;

return (
  <div className="min-h-screen bg-[#0a0a12] text-gray-100 overflow-x-hidden">
      <Head>
        <title>רדיו יוצאים לטראק | טראנס ישראלי 24/7</title>
        <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <style jsx global>{`
        @keyframes float-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
        @keyframes gradient-shift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-gradient { background-size: 200% 200%; animation: gradient-shift 8s ease infinite; }
        .glass-card { background: rgba(255,255,255,0.03); backdrop-filter: blur(10px); }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
      `}</style>

      {/* Dynamic Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden transition-all duration-500">
        <div 
          className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[150px] transition-all duration-300"
          style={{ 
            background: `rgba(${dominantColor}, ${glowIntensity})`,
            transform: `scale(${1 + glowIntensity * 0.2})`
          }}
        />
        <div 
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px] transition-all duration-300"
          style={{ 
            background: `rgba(${dominantColor}, ${glowIntensity * 0.7})`,
            transform: `scale(${1 + glowIntensity * 0.15})`
          }}
        />
      </div>

      <Navigation currentPage="radio" />
      <ListeningTimeTracker userId={user?.id || null} isPlaying={isPlaying} />

      <ListenerProfileModal
        isOpen={showProfileModal}
        onClose={() => !isNewUser && setShowProfileModal(false)}
        onSave={handleSaveProfile}
        initialNickname={listenerProfile?.nickname || ''}
        initialAvatar={listenerProfile?.avatar_url || ''}
        googleAvatar={user?.user_metadata?.avatar_url || ''}
        isNewUser={isNewUser}
      />

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-8 font-['Rubik',sans-serif]">
        
        {/* ========== HEADER ========== */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 border border-white/10 mb-3">
            <span className={'relative flex h-2.5 w-2.5 ' + (isPlaying ? '' : 'opacity-50')}>
              <span className={(isPlaying ? 'animate-ping ' : '') + 'absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75'}></span>
              <span className={'relative inline-flex rounded-full h-2.5 w-2.5 ' + (isPlaying ? 'bg-red-500' : 'bg-gray-500')}></span>
            </span>
            <span className="text-sm font-medium text-gray-300">{isPlaying ? 'משדר עכשיו' : 'לחצו להאזנה'}</span>
           {nowPlaying?.listeners && (
  <span className="text-xs text-gray-500">• {nowPlaying.listeners.current * 3} מאזינים</span>
)}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-1">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              רדיו יוצאים לטראק
            </span>
          </h1>
          <p className="text-gray-500 text-sm">טראנס ישראלי 24/7</p>
        </div>

        {/* ========== MAIN PLAYER (Full Width) ========== */}
        <div 
          className="glass-card rounded-3xl p-6 mb-6 border transition-all duration-300"
          style={{ 
            borderColor: `rgba(${dominantColor}, 0.3)`,
            boxShadow: isPlaying ? `0 0 60px rgba(${dominantColor}, ${glowIntensity * 0.3})` : 'none'
          }}
        >
          <div className="flex flex-col lg:flex-row items-center gap-6">
            
            {/* Album Art */}
            <div className="relative flex-shrink-0">
              <div 
                className="absolute -inset-3 rounded-2xl blur-xl transition-all duration-300"
                style={{ 
                  background: `rgba(${dominantColor}, ${isPlaying ? glowIntensity : 0.2})` 
                }}
              />
              <div className="relative w-40 h-40 lg:w-48 lg:h-48">
                <img
                  src={getAlbumArt()}
                  alt="Album Art"
                  className="w-full h-full object-cover rounded-2xl border-2 border-white/10 shadow-2xl"
                />
                <button
                  onClick={togglePlay}
                  className="absolute inset-0 m-auto w-14 h-14 rounded-full flex items-center justify-center transition-all transform hover:scale-110"
                  style={{
                    background: isPlaying ? 'rgba(255,255,255,0.9)' : `linear-gradient(135deg, rgba(${dominantColor}, 1), rgba(${dominantColor}, 0.7))`,
                    color: isPlaying ? '#111' : '#fff',
                    boxShadow: `0 4px 20px rgba(${dominantColor}, 0.5)`
                  }}
                >
                  {isPlaying ? <FaPause className="text-xl" /> : <FaPlay className="text-xl ml-1" />}
                </button>
              </div>
            </div>

            {/* Track Info */}
            <div className="flex-1 text-center lg:text-right">
              <p className="text-sm font-medium mb-2" style={{ color: `rgb(${dominantColor})` }}>מתנגן עכשיו</p>
              <h2 className="text-2xl lg:text-3xl font-bold text-white mb-1 leading-tight">
                {currentSong?.title || 'טוען...'}
              </h2>
              <p className="text-lg text-gray-300 mb-4">
                {currentSong?.artist || 'יוצאים לטראק'}
              </p>

              {/* Like + Visualizer Row */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button
                  onClick={handleLike}
                  disabled={likeLoading || userLiked}
                  className={`group flex items-center gap-2 px-5 py-2.5 rounded-full transition-all ${
                    userLiked 
                      ? 'bg-pink-500/20 border border-pink-500/30 text-pink-400' 
                      : 'bg-white/5 hover:bg-pink-500/20 border border-white/10 hover:border-pink-500/30 text-gray-400 hover:text-pink-400'
                  }`}
                >
                  {userLiked ? <FaHeart className="text-pink-500" /> : <FaRegHeart className={likeLoading ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'} />}
                  <span className="font-medium text-sm">{userLiked ? 'אהבת!' : 'אהבתי'}</span>
                  {trackLikes > 0 && <span className="bg-white/10 px-2 py-0.5 rounded-full text-xs">{trackLikes}</span>}
                </button>
                
                <Visualizer isPlaying={isPlaying} color={dominantColor} />
              </div>

              {/* Volume */}
              <div className="flex items-center gap-3 mt-4 max-w-xs mx-auto lg:mx-0">
                <button onClick={() => setIsMuted(!isMuted)} className="text-gray-400 hover:text-white transition">
                  {isMuted || volume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => { setVolume(parseFloat(e.target.value)); setIsMuted(false); }}
                  className="flex-1 h-1.5 bg-white/10 rounded-full cursor-pointer accent-purple-500"
                  dir="ltr"
                />
              </div>
            </div>

           {/* Next Up */}
            {nextSong && (
              <div className="hidden lg:block w-px h-32 bg-white/10" />
            )}
            {nextSong && (
              <div className="flex-shrink-0 text-center lg:text-right min-w-[180px] max-w-[200px]">
                <p className="text-xs text-gray-500 mb-2 flex items-center justify-center lg:justify-start gap-1">
                  <FaForward className="text-[10px]" /> הבא בתור
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex-shrink-0">
                    <img 
                      src={nextArtistDetails?.image_url || nextSong.art || '/images/logo.png'} 
                      alt="" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-right min-w-0 flex-1">
                    <p className="text-sm text-white font-medium line-clamp-2 leading-tight">{nextSong.title}</p>
                    <p className="text-xs text-gray-500 truncate mt-1">{nextSong.artist}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========== TWO COLUMN LAYOUT ========== */}
        <div className="grid lg:grid-cols-5 gap-6 mb-6">
          
          {/* LEFT COLUMN - Artist + History (3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Artist Spotlight */}
            <div 
              className="glass-card rounded-2xl p-5 border transition-all duration-300"
              style={{ borderColor: `rgba(${dominantColor}, 0.2)` }}
            >
              <div className="flex items-center gap-2 mb-4">
                <HiSparkles style={{ color: `rgb(${dominantColor})` }} className="text-lg" />
                <h3 className="text-lg font-bold text-white">הכירו את האמן</h3>
                {artistDetails?.is_premiere && (
                  <span className="mr-auto bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    🚀 PREMIERE
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-5">
                {/* Artist Image */}
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div 
                    className="w-28 h-28 rounded-2xl overflow-hidden border-2 shadow-lg"
                    style={{ borderColor: `rgba(${dominantColor}, 0.3)` }}
                  >
                    <img
                      src={artistDetails?.image_url || currentSong?.art || '/images/logo.png'}
                      alt={artistDetails?.name || currentSong?.artist || 'Artist'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {artistDetails && (artistDetails.instagram || artistDetails.soundcloud) && (
                    <div className="flex gap-2 mt-3">
                      {artistDetails.instagram && (
                        <a 
                          href={artistDetails.instagram.startsWith('http') ? artistDetails.instagram : 'https://instagram.com/' + artistDetails.instagram.replace('@', '')} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center hover:scale-110 transition-all"
                        >
                          <FaInstagram className="text-sm" />
                        </a>
                      )}
                      {artistDetails.soundcloud && (
                        <a 
                          href={artistDetails.soundcloud.startsWith('http') ? artistDetails.soundcloud : 'https://soundcloud.com/' + artistDetails.soundcloud} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center hover:scale-110 transition-all"
                        >
                          <FaSoundcloud className="text-sm" />
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Artist Info */}
                <div className="flex-1 min-w-0 text-center sm:text-right">
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                    <h4 className="text-xl font-bold text-white truncate">
                      {artistDetails?.name || currentSong?.artist || 'יוצאים לטראק'}
                    </h4>
                    {artistDetails?.podcast_featured && (
                      <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        🎙️ פודקאסט
                      </span>
                    )}
                  </div>
                  
                  {artistDetails?.bio ? (
                    <div className="mb-3">
                      <p className={`text-sm text-gray-400 leading-relaxed ${!bioExpanded && bioIsLong ? 'line-clamp-2' : ''}`}>
                        {artistDetails.bio}
                      </p>
                      {bioIsLong && (
                        <button 
                          onClick={() => setBioExpanded(!bioExpanded)}
                          className="hover:opacity-80 text-xs mt-1 flex items-center justify-center sm:justify-start gap-1"
                          style={{ color: `rgb(${dominantColor})` }}
                        >
                          {bioExpanded ? <>פחות <FaChevronUp /></> : <>עוד <FaChevronDown /></>}
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mb-3">מוזיקה מקורית מישראל 🇮🇱</p>
                  )}

                  {artistDetails?.track_description && (
                    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                      <p className="text-xs font-medium mb-1" style={{ color: `rgb(${dominantColor})` }}>💬 על הטראק:</p>
                      <p className="text-sm text-gray-300 leading-relaxed">{artistDetails.track_description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

           {/* Song History */}
{songHistory.length > 0 && (
  <div className="glass-card rounded-2xl p-5 border border-white/5">
    <div className="flex items-center gap-2 mb-4">
      <FaHistory className="text-cyan-400" />
      <h3 className="text-sm font-bold text-white">שודר לאחרונה</h3>
    </div>
   <div className="flex flex-row-reverse gap-3 overflow-x-auto hide-scrollbar pb-2 px-4" dir="ltr">
      {songHistory.map((song, i) => (
        <div
          key={i}
          onClick={() => song.soundcloud && openSoundCloud(song.soundcloud)}
          className={`flex-shrink-0 w-24 text-right transition-transform duration-200 ${song.soundcloud ? 'cursor-pointer hover:scale-105' : ''}`}
        >
          <div className={`relative aspect-square rounded-xl overflow-hidden bg-white/5 mb-2 border border-white/5 transition-colors duration-200 ${song.soundcloud ? 'hover:border-orange-500/50' : ''}`}>
            <img 
              src={song.artistImage || song.art || '/images/logo.png'} 
              alt={song.title}
              className="w-full h-full object-cover"
            />
            {song.soundcloud && (
              <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <FaSoundcloud className="text-orange-500 text-2xl" />
              </div>
            )}
          </div>
         <p className="text-xs text-white leading-tight line-clamp-2 min-h-[2rem]">{song.title}</p>
<p className="text-[10px] text-gray-500 truncate">{song.artist}</p>
        </div>
      ))}
    </div>
  </div>
)}
  </div>

          {/* RIGHT COLUMN - Chat + Leaderboard (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Login prompt OR User card */}
            {!user ? (
              <div 
                className="glass-card rounded-2xl p-4 border"
                style={{ 
                  borderColor: `rgba(${dominantColor}, 0.3)`,
                  background: `linear-gradient(135deg, rgba(${dominantColor}, 0.1), rgba(${dominantColor}, 0.05))`
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                    <FaCrown className="text-yellow-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-white mb-1">הצטרפו לקהילה!</h4>
                    <p className="text-xs text-gray-400 mb-3">שם צבעוני, אימוג׳י בצ׳אט וטבלת המאזינים</p>
                    <button
                      onClick={handleGoogleLogin}
                      className="w-full bg-white hover:bg-gray-100 text-gray-900 font-medium py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 text-sm"
                    >
                      <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                      התחברות עם Google
                    </button>
                  </div>
                </div>
              </div>
            ) : listenerProfile && (
              <div className="glass-card rounded-2xl p-4 border border-white/10">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-full border-2 flex items-center justify-center overflow-hidden"
                    style={{ 
                      borderColor: `rgba(${dominantColor}, 0.5)`,
                      background: `linear-gradient(135deg, rgba(${dominantColor}, 0.3), rgba(${dominantColor}, 0.1))`
                    }}
                  >
                    {listenerProfile.avatar_url.length <= 4 ? (
                      <span className="text-2xl">{listenerProfile.avatar_url}</span>
                    ) : (
                      <img src={listenerProfile.avatar_url} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p 
                      className="text-sm font-bold truncate"
                      style={{ color: `rgb(${dominantColor})` }}
                    >
                      {listenerProfile.nickname}
                    </p>
                    <p className="text-xs text-gray-500">{Math.floor(listenerProfile.total_seconds / 3600)} שעות האזנה</p>
                  </div>
                  <button
                    onClick={() => { setIsNewUser(false); setShowProfileModal(true); }}
                    className="text-xs text-gray-400 hover:text-white transition"
                  >
                    עריכה
                  </button>
                </div>
              </div>
            )}

            {/* Chat + Leaderboard side by side on mobile, stacked on desktop */}
            <div className="grid grid-cols-1 gap-6">
              <RadioChat
                listenerProfile={listenerProfile}
                onLoginClick={handleGoogleLogin}
                fingerprint={fingerprint}
              />
              <RadioLeaderboard currentUserId={listenerProfile?.id} />
            </div>
          </div>
        </div>

  {/* Top Liked Tracks */}
{topTracks.length > 0 && (
  <div 
    className="glass-card rounded-2xl p-5 border mb-6"
    style={{ borderColor: `rgba(${dominantColor}, 0.2)` }}
  >
    <div className="flex items-center gap-2 mb-4">
      <FaHeart className="text-pink-500" />
      <h3 className="text-sm font-bold text-white">הטראקים האהובים</h3>
      <span className="text-xs text-gray-500">Top 5</span>
    </div>
    <div className="space-y-3">
      {topTracks.map((track, i) => (
        <div 
          key={i} 
          className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
            i === 0 
              ? 'bg-gradient-to-r from-yellow-500/10 to-amber-500/5 border border-yellow-500/20' 
              : 'bg-white/5 hover:bg-white/10 border border-transparent'
          }`}
        >
          {/* Rank */}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
            i === 0 ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black' :
            i === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-black' :
            i === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white' :
            'bg-white/10 text-gray-400'
          }`}>
            {i + 1}
          </div>
          
          {/* Track info */}
          <div className="flex-1 min-w-0">
            <p className={`font-medium leading-tight line-clamp-1 ${i === 0 ? 'text-yellow-400' : 'text-white'}`}>
              {track.track}
            </p>
            <p className="text-xs text-gray-500 truncate mt-0.5">{track.artist}</p>
          </div>
          
          {/* Likes - emphasized */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full flex-shrink-0 ${
            i === 0 
              ? 'bg-pink-500/20 border border-pink-500/30' 
              : 'bg-white/5'
          }`}>
            <FaHeart className={`${i === 0 ? 'text-pink-400 text-base' : 'text-pink-500/70 text-sm'}`} />
            <span className={`font-bold ${i === 0 ? 'text-pink-400 text-lg' : 'text-white text-sm'}`}>
              {track.likes}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

        {/* ========== ARTIST CTA (Full Width Banner) ========== */}
        <Link 
          href="/radio/register" 
          className="block relative overflow-hidden rounded-2xl p-6 transition-all hover:scale-[1.01] group"
          style={{
            background: `linear-gradient(135deg, rgba(${dominantColor}, 0.2), rgba(${dominantColor}, 0.05))`,
            border: `1px solid rgba(${dominantColor}, 0.3)`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3"
                style={{ background: `linear-gradient(135deg, rgb(${dominantColor}), rgba(${dominantColor}, 0.7))` }}
              >
                <FaUpload className="text-xl text-white" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white mb-1">אתם יוצרים? 🎵</h4>
                <p className="text-sm text-gray-400">שלחו את הטראק שלכם לשידור ברדיו - בחינם!</p>
              </div>
            </div>
            <div 
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-sm transition-all group-hover:gap-3"
              style={{ 
                background: `rgb(${dominantColor})`,
                color: '#fff'
              }}
            >
              שליחת טראק
              <span className="group-hover:translate-x-1 transition-transform">←</span>
            </div>
          </div>
        </Link>

      </main>
    </div>
  );
}
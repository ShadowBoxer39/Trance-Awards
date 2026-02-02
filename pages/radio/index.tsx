// pages/radio/index.tsx - Complete Radio Page Redesign v2
import { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import Navigation from '@/components/Navigation';
import RadioChat from '@/components/radio/RadioChat';
import { FaWhatsapp, FaLink, FaShareAlt } from 'react-icons/fa';
import ActivityFeed from '@/components/radio/ActivityFeed';
import ListenerProfileModal from '@/components/radio/ListenerProfileModal';
import ListeningTimeTracker from '@/components/radio/ListeningTimeTracker';
import InstallAppButton from '@/components/InstallAppButton';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaUpload, FaInstagram, FaSoundcloud, FaChevronDown, FaChevronUp, FaHeart, FaRegHeart, FaHistory, FaCrown, FaForward, FaCheck } from 'react-icons/fa';
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

// Share Button Component
const ShareButton = ({ trackTitle, artist }: { trackTitle?: string; artist?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const shareUrl = 'https://tracktrip.co.il/radio';
  
  const shareText = trackTitle && artist
    ? `🎧 מאזין עכשיו לרדיו יוצאים לטראק!\n🎵 מתנגן: ${artist} - ${trackTitle}\nהצטרפו אליי ▶️`
    : `🎧 בואו להאזין לרדיו יוצאים לטראק!\nטראנס ישראלי 24/7 🔥\nהצטרפו ▶️`;

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText + ' ' + shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'רדיו יוצאים לטראק',
          text: shareText,
          url: shareUrl
        });
        setIsOpen(false);
      } catch (err) {
        // User cancelled or error
      }
    }
  };

  const supportsNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white transition-all"
      >
        <FaShareAlt className="text-sm" />
        <span className="font-medium text-sm">שתפו</span>
      </button>

      {/* Popover */}
{isOpen && (
  <div className="absolute bottom-full mb-2 right-0 bg-[#1a1a2e]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl shadow-black/50 z-[100] min-w-[180px] animate-fade-in">
         {/* WhatsApp */}
<a
  href={whatsappUrl}
  target="_blank"
  rel="noopener noreferrer"
  onClick={() => setIsOpen(false)}
  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all group"
>
  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center group-hover:scale-110 transition-transform">
    <FaWhatsapp className="text-white text-lg" />
  </div>
  <span className="text-white font-medium text-sm">WhatsApp</span>
</a>

          {/* Copy Link */}
          <button
            onClick={handleCopy}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all group"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all group-hover:scale-110 ${
              copied ? 'bg-green-500' : 'bg-white/10'
            }`}>
              {copied ? (
                <FaCheck className="text-white text-sm" />
              ) : (
                <FaLink className="text-gray-300 text-sm" />
              )}
            </div>
            <span className={`font-medium text-sm ${copied ? 'text-green-400' : 'text-white'}`}>
              {copied ? 'הועתק! ✓' : 'העתקת קישור'}
            </span>
          </button>

          {/* Native Share (mobile) */}
          {supportsNativeShare && (
            <button
              onClick={handleNativeShare}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all group"
            >
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FaShareAlt className="text-purple-400 text-sm" />
              </div>
              <span className="text-white font-medium text-sm">שיתוף</span>
            </button>
          )}

          {/* Little arrow indicator */}
<div className="absolute -bottom-2 right-6 w-4 h-4 bg-[#1a1a2e]/95 border-b border-l border-white/10 rotate-[-45deg]" />
        </div>
      )}
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
  const [ctaDismissed, setCtaDismissed] = useState(false);

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
  const artistCacheRef = useRef<Map<string, ArtistDetails | null>>(new Map());

  // Load artist cache from localStorage on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem('radio_artist_cache');
      if (cached) {
        const data = JSON.parse(cached);
        const now = Date.now();
        // Only load cache entries less than 1 hour old
        Object.entries(data).forEach(([key, value]: [string, any]) => {
          if (value.timestamp && (now - value.timestamp) < 3600000) {
            artistCacheRef.current.set(key, value.data);
          }
        });
      }
    } catch (err) {
      console.error('Failed to load artist cache:', err);
    }
  }, []);

 // Audio reactive glow - disabled on mobile for performance
useEffect(() => {
  if (!isPlaying) {
    setGlowIntensity(0.3);
    return;
  }
  
  // Check if mobile
  const isMobile = window.innerWidth < 768;
  
  if (isMobile) {
    // Static glow on mobile for better performance
    setGlowIntensity(0.5);
    return;
  }
  
  const interval = setInterval(() => {
    const intensity = 0.3 + Math.random() * 0.4;
    setGlowIntensity(intensity);
  }, 150);
  
  return () => clearInterval(interval);
}, [isPlaying]);
  // Initialize
  useEffect(() => {
    document.documentElement.setAttribute('dir', 'rtl');
    setFingerprint(getFingerprint());

    // Check if CTA was previously dismissed (24-hour expiry)
    const dismissed = localStorage.getItem('radio_cta_dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const hoursSince = (Date.now() - dismissedTime) / (1000 * 60 * 60);
      if (hoursSince < 24) {
        setCtaDismissed(true);
      } else {
        localStorage.removeItem('radio_cta_dismissed');
      }
    }
    
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

    // Check cache first (only for calls without trackTitle, since track info varies)
    const cacheKey = artistName.toLowerCase();
    if (!trackTitle && artistCacheRef.current.has(cacheKey)) {
      return artistCacheRef.current.get(cacheKey) || null;
    }

    let url = '/api/radio/get-artist-details?name=' + encodeURIComponent(artistName);
    if (trackTitle) {
      url += '&track=' + encodeURIComponent(trackTitle);
    }
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      // Cache the result (without track-specific info) and save to localStorage
      if (!trackTitle) {
        artistCacheRef.current.set(cacheKey, data);

        // Persist to localStorage (throttle writes to avoid performance issues)
        setTimeout(() => {
          try {
            const cacheToSave: any = {};
            artistCacheRef.current.forEach((value, key) => {
              cacheToSave[key] = {
                data: value,
                timestamp: Date.now()
              };
            });
            localStorage.setItem('radio_artist_cache', JSON.stringify(cacheToSave));
          } catch (err) {
            // Ignore quota errors
          }
        }, 1000);
      }
      return data;
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
      // Use user_id if logged in, otherwise use fingerprint
      const identifier = user?.id || getFingerprint();
      const res = await fetch('/api/radio/track-likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          track: currentSong.title,
          artist: currentSong.artist,
          fingerprint: identifier
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
        
       // Update song history with artist images (only on track change)
if (data.song_history && newTrackTitle !== currentTrackTitle) {
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
      const res = await fetch('/api/radio/top-tracks?limit=10');
      if (res.ok) {
        const data = await res.json();
        setTopTracks(data);
        
        // Pre-fetch artist images for top tracks
        data.forEach(async (track: { artist: string }) => {
          const cacheKey = track.artist.toLowerCase();
          if (!artistCacheRef.current.has(cacheKey)) {
            const details = await fetchArtistDetails(track.artist);
            if (details) {
              artistCacheRef.current.set(cacheKey, details);
            }
          }
        });
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

const handleDismissCta = () => {
  setCtaDismissed(true);
  localStorage.setItem('radio_cta_dismissed', Date.now().toString());
};

return (
  <div className="min-h-screen bg-[#0a0a12] text-gray-100 overflow-x-hidden">
      <Head>
        <title>רדיו יוצאים לטראק | טראנס ישראלי 24/7</title>
        <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <style jsx global>{`
        @keyframes float-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
        @keyframes gradient-shift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        @keyframes breathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-gradient { background-size: 200% 200%; animation: gradient-shift 8s ease infinite; }
        .animate-breathe { animation: breathe 4s ease-in-out infinite; }
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
          <div className="flex flex-col items-center gap-3 mb-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 border border-white/10">
              <span className={'relative flex h-2.5 w-2.5 ' + (isPlaying ? '' : 'opacity-50')}>
                <span className={(isPlaying ? 'animate-ping ' : '') + 'absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75'}></span>
                <span className={'relative inline-flex rounded-full h-2.5 w-2.5 ' + (isPlaying ? 'bg-red-500' : 'bg-gray-500')}></span>
              </span>
              <span className="text-sm font-medium text-gray-300">{isPlaying ? 'משדר עכשיו' : 'לחצו להאזנה'}</span>
              {nowPlaying?.listeners && (
                <span className="text-xs text-gray-500">• {nowPlaying.listeners.current} מאזינים</span>
              )}
            </div>
            <InstallAppButton />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-1">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              רדיו יוצאים לטראק
            </span>
          </h1>
          <p className="text-gray-500 text-sm">טראנס ישראלי 24/7</p>
        </div>

        {/* ========== ARTIST CTA (Top Banner - Slim & Dismissible) ========== */}
        {!ctaDismissed && (
          <Link
            href="/radio/register"
            className="block relative overflow-hidden rounded-xl mb-6 transition-all hover:scale-[1.005] group animate-fade-in"
            style={{
              background: `linear-gradient(90deg, rgba(${dominantColor}, 0.15), rgba(${dominantColor}, 0.08))`,
              border: `1px solid rgba(${dominantColor}, 0.25)`
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />

            <div className="relative flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                  className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
                  style={{ background: `linear-gradient(135deg, rgb(${dominantColor}), rgba(${dominantColor}, 0.7))` }}
                >
                  <FaUpload className="text-base md:text-lg text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm md:text-base font-bold text-white mb-0.5 truncate">אתם יוצרים? 🎵</h4>
                  <p className="text-xs md:text-sm text-gray-400 truncate">שלחו את הטראק שלכם לשידור - בחינם!</p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <div
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full font-medium text-xs md:text-sm transition-all group-hover:gap-3"
                  style={{
                    background: `rgb(${dominantColor})`,
                    color: '#fff'
                  }}
                >
                  שליחת טראק
                  <span className="group-hover:translate-x-1 transition-transform">←</span>
                </div>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDismissCta();
                  }}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-400 hover:text-white transition-all"
                  title="סגור"
                >
                  ✕
                </button>
              </div>
            </div>
          </Link>
        )}

        {/* ========== MAIN PLAYER (Full Width) ========== */}
        <div className="relative mb-6">
          {/* Animated background glow */}
          <div
            className="absolute -inset-4 rounded-3xl blur-2xl transition-all duration-300"
            style={{
              background: `radial-gradient(circle at center, rgba(${dominantColor}, ${isPlaying ? glowIntensity * 0.4 : 0.15}), transparent 70%)`,
            }}
          />

          <div
            className="relative glass-card rounded-3xl p-6 md:p-8 border-2 transition-all duration-300"
            style={{
              borderColor: `rgba(${dominantColor}, 0.4)`,
              boxShadow: isPlaying ? `0 0 40px rgba(${dominantColor}, ${glowIntensity * 0.2})` : 'none'
            }}
          >
            {/* Top gradient accent */}
            <div
              className="absolute top-0 inset-x-0 h-1 rounded-t-3xl"
              style={{ background: `linear-gradient(90deg, transparent, rgb(${dominantColor}), transparent)` }}
            />

            <div className="grid lg:grid-cols-[auto,1fr,auto] gap-8 items-center">

              {/* Large Album Art with Rotation */}
              <div className="relative mx-auto lg:mx-0">
                <div
                  className={`absolute -inset-4 rounded-2xl blur-2xl transition-all duration-300 ${isPlaying ? 'animate-pulse' : ''}`}
                  style={{
                    background: `radial-gradient(circle, rgba(${dominantColor}, ${isPlaying ? glowIntensity * 0.8 : 0.3}), transparent 70%)`
                  }}
                />
                <div
                  className={`relative w-48 h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden border-4 border-white/20 shadow-2xl ${isPlaying ? 'animate-breathe' : ''}`}
                >
                  <img
                    src={getAlbumArt()}
                    alt="Album Art"
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay when playing */}
                  {isPlaying && (
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"
                      style={{ background: `linear-gradient(to top, rgba(${dominantColor}, 0.3), transparent)` }}
                    />
                  )}
                </div>
              </div>

              {/* Track Info - Center Section */}
              <div className="flex-1 min-w-0 text-center lg:text-right space-y-4">
                {/* ON AIR Badge */}
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <span className={`relative flex h-3 w-3`}>
                    <span className={`${isPlaying ? 'animate-ping' : ''} absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75`}></span>
                    <span className={`relative inline-flex rounded-full h-3 w-3 ${isPlaying ? 'bg-red-500' : 'bg-gray-500'}`}></span>
                  </span>
                  <span
                    className="text-sm font-bold tracking-wider"
                    style={{ color: isPlaying ? 'rgb(239, 68, 68)' : 'rgb(156, 163, 175)' }}
                  >
                    {isPlaying ? 'ON AIR' : 'לחצו להאזנה'}
                  </span>
                </div>

                {/* Track Title - Large and Bold */}
                <h2
                  className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight bg-gradient-to-r from-white via-white to-gray-300 bg-clip-text text-transparent pb-1"
                  style={{
                    textShadow: `0 0 30px rgba(${dominantColor}, 0.3)`,
                    lineHeight: '1.3'
                  }}
                >
                  {currentSong?.title || 'טוען...'}
                </h2>

                {/* Artist Name - Gradient */}
                <p
                  className="text-2xl md:text-3xl font-semibold bg-clip-text text-transparent pb-1"
                  style={{
                    backgroundImage: `linear-gradient(135deg, rgb(${dominantColor}), rgba(${dominantColor}, 0.7))`,
                    lineHeight: '1.3'
                  }}
                >
                  {currentSong?.artist || 'יוצאים לטראק'}
                </p>

                {/* Action Buttons with Enhanced Styling */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  <button
                    onClick={handleLike}
                    disabled={likeLoading || userLiked}
                    className={`group relative flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all transform hover:scale-105 ${
                      userLiked
                        ? 'text-pink-400'
                        : 'text-gray-400 hover:text-pink-400'
                    }`}
                    style={{
                      background: userLiked
                        ? 'rgba(236, 72, 153, 0.2)'
                        : 'rgba(255, 255, 255, 0.05)',
                      border: userLiked
                        ? '1px solid rgba(236, 72, 153, 0.3)'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    {userLiked ? (
                      <FaHeart className="text-pink-500" />
                    ) : (
                      <FaRegHeart className={likeLoading ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'} />
                    )}
                    <span className="text-sm">{userLiked ? 'אהבת!' : 'אהבתי'}</span>
                    {trackLikes > 0 && (
                      <span className="bg-white/10 px-2 py-0.5 rounded-full text-xs">{trackLikes}</span>
                    )}
                  </button>

                  <ShareButton trackTitle={currentSong?.title} artist={currentSong?.artist} />

                  <Visualizer isPlaying={isPlaying} color={dominantColor} />
                </div>

                {/* Volume Slider with Gradient */}
                <div className="flex items-center gap-3 max-w-xs mx-auto lg:mx-0">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="text-gray-400 hover:text-white transition-colors transform hover:scale-110"
                  >
                    {isMuted || volume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
                  </button>
                  <div className="flex-1 relative">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        setVolume(parseFloat(e.target.value));
                        setIsMuted(false);
                      }}
                      className="w-full h-2 bg-white/10 rounded-full cursor-pointer appearance-none"
                      style={{
                        background: `linear-gradient(to left, rgba(${dominantColor}, 0.8) ${volume * 100}%, rgba(255,255,255,0.1) ${volume * 100}%)`
                      }}
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              {/* Large Play Button - Right Side */}
              <button
                onClick={togglePlay}
                className="relative group mx-auto lg:mx-0"
              >
                <div
                  className={`absolute -inset-3 rounded-full blur-xl opacity-75 group-hover:opacity-100 transition-opacity ${isPlaying ? 'animate-pulse' : ''}`}
                  style={{ background: `rgba(${dominantColor}, 0.6)` }}
                />
                <div
                  className={`relative w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center transition-all transform group-hover:scale-110 shadow-2xl`}
                  style={{
                    background: isPlaying
                      ? 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85))'
                      : `linear-gradient(135deg, rgba(${dominantColor}, 1), rgba(${dominantColor}, 0.8))`,
                    color: isPlaying ? '#111' : '#fff',
                  }}
                >
                  {isPlaying ? (
                    <FaPause className="text-3xl md:text-4xl" />
                  ) : (
                    <FaPlay className="text-3xl md:text-4xl ml-1" />
                  )}
                </div>
              </button>
            </div>

            {/* Next Up & Sign Up - Compact Row */}
            <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between gap-4 flex-wrap">
              {/* Next Up - Compact */}
              {nextSong && (
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FaForward className="text-xs flex-shrink-0" style={{ color: `rgb(${dominantColor})` }} />
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 border border-white/10 flex-shrink-0">
                    <img
                      src={nextArtistDetails?.image_url || nextSong.art || '/images/logo.png'}
                      alt="Next"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">הבא בתור</p>
                    <p className="text-sm text-white font-medium truncate">{nextSong.title}</p>
                    <p className="text-xs text-gray-400 truncate">{nextSong.artist}</p>
                  </div>
                </div>
              )}

              {/* Submit Track CTA - Compact */}
              <Link
                href="/radio/register"
                className="relative overflow-hidden rounded-lg px-4 py-2 border transition-all group hover:scale-[1.02] flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, rgba(${dominantColor}, 0.15), rgba(${dominantColor}, 0.08))`,
                  borderColor: `rgba(${dominantColor}, 0.3)`
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <div className="relative flex items-center gap-2">
                  <span className="text-lg">🚀</span>
                  <span className="text-sm font-semibold text-white">שלחו טראק לרדיו!</span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* ========== TWO COLUMN LAYOUT ========== */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          
          {/* LEFT COLUMN - Artist + History (2 cols on desktop) */}
          <div className="lg:col-span-2 space-y-6">
            
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
                      <span className="bg-gradient-to-r from-amber-500 to-orange-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        🎙️ התארח בפודקאסט
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
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                  {songHistory.slice(0, 5).map((song, i) => (
                    <div
                      key={i}
                      onClick={() => song.soundcloud && openSoundCloud(song.soundcloud)}
                      className={`text-center transition-transform duration-200 ${song.soundcloud ? 'cursor-pointer active:scale-95' : ''}`}
                    >
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-white/5 mb-2 border border-white/5">
                        <img 
                          src={song.artistImage || song.art || '/images/logo.png'} 
                          alt={song.title}
                          className="w-full h-full object-cover"
                        />
                        {song.soundcloud && (
                          <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center shadow-lg">
                            <FaSoundcloud className="text-white text-xs" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-white leading-tight line-clamp-2">{song.title}</p>
                      <p className="text-[10px] text-gray-500 truncate">{song.artist}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Login/User Card - MOBILE ONLY */}
            <div className="lg:hidden">
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
            </div>

            {/* Chat - MOBILE ONLY */}
            <div className="lg:hidden">
             <RadioChat
  listenerProfile={listenerProfile}
  onLoginClick={handleGoogleLogin}
  fingerprint={fingerprint}
  currentTrackTitle={currentSong?.title}
  currentArtist={currentSong?.artist}
  currentUserId={user?.id}
/>
            </div>

            {/* Activity Feed + Top Tracks Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ActivityFeed maxItems={10} />
              
           {/* Top Liked Tracks */}
{topTracks.length > 0 && (
  <div className="bg-black/20 rounded-2xl p-4 border border-white/5 overflow-hidden">
    <div className="flex items-center gap-2 mb-4">
      <FaHeart className="text-pink-500" />
      <h3 className="text-sm font-bold text-white">הטראקים האהובים</h3>
      <span className="text-xs text-gray-500">Top 10</span>
    </div>
    <div className="space-y-2">
      {topTracks.slice(0, 10).map((track, i) => {
        const cachedArtist = artistCacheRef.current.get(track.artist.toLowerCase());
        const artistImage = cachedArtist?.image_url;
        
        return (
          <div 
            key={i} 
          className={`flex items-center gap-3 p-2.5 rounded-xl transition-all border ${
  i === 0 
    ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/10 border-yellow-500/40' 
    : i === 1
    ? 'bg-gradient-to-r from-gray-400/20 to-gray-500/10 border-gray-400/40'
    : i === 2
    ? 'bg-gradient-to-r from-amber-600/20 to-amber-700/10 border-amber-600/40'
    : 'bg-white/5 border-white/10'
}`}
          >
            {/* Rank */}
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
              i === 0 ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black' :
              i === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-black' :
              i === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white' :
              'bg-white/10 text-gray-400'
            }`}>
              {i + 1}
            </div>

            {/* Artist Image */}
            <div className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden border ${
              i === 0 ? 'border-yellow-500/30' :
              i === 1 ? 'border-gray-400/30' :
              i === 2 ? 'border-amber-600/30' :
              'border-white/10'
            } bg-white/5`}>
              {artistImage ? (
                <img src={artistImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <FaHeart className="text-pink-500/50 text-xs" />
              )}
            </div>

            {/* Track Info */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium leading-tight truncate ${i === 0 ? 'text-yellow-400' : 'text-white'}`}>
                {track.track}
              </p>
              <p className="text-[10px] text-gray-500 truncate">{track.artist}</p>
            </div>

            {/* Likes */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <FaHeart className={`${i === 0 ? 'text-pink-400' : 'text-pink-500/70'} text-sm`} />
              <span className={`text-sm font-bold ${i === 0 ? 'text-pink-400' : 'text-white'}`}>
                {track.likes}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  </div>
)}

</div>
</div>


         {/* RIGHT COLUMN - Login/Chat (1 col on desktop) - DESKTOP ONLY */}
<div className="hidden lg:flex lg:flex-col lg:col-span-1 gap-6">
            
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

            {/* Chat */}
           <RadioChat
  listenerProfile={listenerProfile}
  onLoginClick={handleGoogleLogin}
  fingerprint={fingerprint}
  currentTrackTitle={currentSong?.title}
  currentArtist={currentSong?.artist}
  currentUserId={user?.id}
/>
          </div>
        </div>


      </main>
    </div>
  );
}
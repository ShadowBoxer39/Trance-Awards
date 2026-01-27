import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaUsers, FaUpload, FaInstagram, FaSoundcloud, FaYoutube, FaMobileAlt, FaHeadphones, FaChevronDown, FaChevronUp, FaHeart, FaRegHeart } from 'react-icons/fa';
import { HiSparkles, HiMusicNote } from 'react-icons/hi';

const AZURACAST_API_URL = 'https://a12.asurahosting.com/api/nowplaying/track_trip_radio';
const STREAM_URL = 'https://a12.asurahosting.com/listen/track_trip_radio/radio.mp3';

interface NowPlayingData {
  station: { name: string; listen_url: string };
  now_playing: { song: { title: string; artist: string; art: string }; elapsed: number; duration: number };
  playing_next?: { song: { title: string; artist: string; art: string } };
  listeners: { current: number; unique: number };
  live: { is_live: boolean; streamer_name: string };
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

const mockData: NowPlayingData = {
  station: { name: 'Track Trip Radio', listen_url: STREAM_URL },
  now_playing: { song: { title: 'Waiting...', artist: 'Track Trip', art: '' }, elapsed: 0, duration: 0 },
  listeners: { current: 0, unique: 0 },
  live: { is_live: false, streamer_name: '' },
};

const Visualizer = ({ isPlaying }: { isPlaying: boolean }) => {
  const [heights, setHeights] = useState<number[]>(Array(20).fill(6));
  
  useEffect(() => {
    if (!isPlaying) { 
      setHeights(Array(20).fill(6)); 
      return; 
    }
    const interval = setInterval(() => {
      setHeights(Array(20).fill(0).map(() => Math.random() * 32 + 6));
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="flex items-end justify-center gap-1 h-10">
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

export default function RadioPage() {
  const [nowPlaying, setNowPlaying] = useState<NowPlayingData>(mockData);
  const [artistDetails, setArtistDetails] = useState<ArtistDetails | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [bioExpanded, setBioExpanded] = useState(false);
  const [trackLikes, setTrackLikes] = useState(0);
const [userLiked, setUserLiked] = useState(false);
const [likeLoading, setLikeLoading] = useState(false);

// Get or create user fingerprint
const getFingerprint = () => {
  if (typeof window === 'undefined') return null;
  let fp = localStorage.getItem('radio_fingerprint');
  if (!fp) {
    fp = 'fp_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('radio_fingerprint', fp);
  }
  return fp;
};

// Fetch likes for current track
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

// Handle like button click
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


  const updateArtistSpotlight = async (artistName: string, trackTitle?: string) => {
  try {
    if (!artistName || artistName === 'Track Trip Radio' || artistName === 'Unknown Artist') {
      setArtistDetails(null);
      return;
    }
    let url = '/api/radio/get-artist-details?name=' + encodeURIComponent(artistName);
    if (trackTitle) {
      url += '&track=' + encodeURIComponent(trackTitle);
    }
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      setArtistDetails(data);
      setBioExpanded(false);
      
      // Also fetch likes for this track
      if (trackTitle) {
        fetchTrackLikes(trackTitle, artistName);
      }
    } else {
      setArtistDetails(null);
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
        const currentTrackTitle = nowPlaying?.now_playing?.song?.title;
        const newArtistName = data.now_playing.song.artist;
        const newTrackTitle = data.now_playing.song.title;
        if (newArtistName !== currentArtistName || newTrackTitle !== currentTrackTitle) {
          updateArtistSpotlight(newArtistName, newTrackTitle);
        }
        setNowPlaying(data);
      }
    } catch (err) {
      console.log('Stream offline or blocked');
    }
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

  const currentSong = nowPlaying?.now_playing?.song;
  const nextSong = nowPlaying?.playing_next?.song;

  // Check if bio is long enough to need expansion
  const bioIsLong = artistDetails?.bio && artistDetails.bio.length > 150;

  return (
    <div className="trance-backdrop min-h-screen text-gray-100">
      <Head>
        <title>הרדיו של יוצאים לטראק</title>
      </Head>
      
      <Navigation currentPage="radio" />

      <main className="max-w-6xl mx-auto px-6 pt-20 pb-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 mb-3">
            <span className={'relative flex h-2.5 w-2.5 ' + (isPlaying ? '' : 'opacity-50')}>
              <span className={(isPlaying ? 'animate-ping ' : '') + 'absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75'}></span>
              <span className={'relative inline-flex rounded-full h-2.5 w-2.5 ' + (isPlaying ? 'bg-red-500' : 'bg-gray-500')}></span>
            </span>
            <span className="text-sm font-medium text-gray-300">{isPlaying ? 'משדר עכשיו' : 'לחצו להאזנה'}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              הרדיו של יוצאים לטראק
            </span>
          </h1>
          <p className="text-gray-400">מוזיקת טראנס ישראלית 24/7 | האזינו מכל מקום</p>
        </div>

        {/* Main Player */}
        <div className="glass-card rounded-2xl p-6 mb-6 border border-purple-500/20">
          <div className="flex flex-col md:flex-row items-center gap-6">
            
            {/* Album Art with Play Button overlay */}
            <div className="relative flex-shrink-0">
              <div className={'absolute -inset-3 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-2xl blur-lg opacity-40 ' + (isPlaying ? 'animate-pulse' : '')}></div>
              <div className="relative w-48 h-48 md:w-56 md:h-56">
                <img
                  src={(() => {
  const art = currentSong?.art;
  const isDefaultArt = !art || 
    art.includes('/static/img/generic_song') || 
    (art.includes('/api/station/') && !art.match(/\.(jpg|jpeg|png|webp)$/i));
  if (!isDefaultArt) return art;
  return artistDetails?.image_url || '/images/logo.png';
})()}
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
            <div className="flex-1 text-center md:text-right">
              <div className="mb-4">
                <p className="text-sm text-purple-400 font-medium mb-1">מתנגן עכשיו</p>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">
                  {currentSong?.title || 'טוען...'}
                </h2>
                <p className="text-lg text-gray-300">
                  {currentSong?.artist || 'יוצאים לטראק'}
                </p>
{/* Like Button */}
<div className="flex items-center justify-center md:justify-start mt-3">
  <button
    onClick={handleLike}
    disabled={likeLoading || userLiked}
    className={`group flex items-center gap-2 px-5 py-2.5 rounded-full transition-all ${
      userLiked 
        ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 text-pink-400' 
        : 'bg-white/5 hover:bg-gradient-to-r hover:from-pink-500/20 hover:to-purple-500/20 border border-white/10 hover:border-pink-500/30 text-gray-400 hover:text-pink-400'
    }`}
  >
    {userLiked ? (
      <FaHeart className="text-pink-500 text-lg" />
    ) : (
      <FaRegHeart className={`text-lg transition-transform ${likeLoading ? 'animate-pulse' : 'group-hover:scale-110'}`} />
    )}
    <span className="font-medium">
      {userLiked ? 'תודה על האהבה!' : 'אהבתי את הטראק'}
    </span>
    {trackLikes > 0 && (
      <span className="bg-white/10 px-2 py-0.5 rounded-full text-xs">
        {trackLikes}
      </span>
    )}
  </button>
</div>

              </div>

              <div className="flex items-center justify-center md:justify-start gap-3 text-sm text-gray-400 mb-4">
                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full">
                  <FaUsers className="text-purple-400" />
                 <span>{nowPlaying?.listeners?.current || 0} מאזינים</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full">
                  <FaHeadphones className="text-cyan-400" />
                  <span>איכות גבוהה</span>
                </div>
              </div>

              {/* Visualizer */}
              <div className="mb-4">
                <Visualizer isPlaying={isPlaying} />
              </div>

              {/* Volume */}
              <div className="flex items-center gap-3 bg-black/40 rounded-xl px-4 py-3 max-w-sm mx-auto md:mx-0">
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
        </div>

        {/* Two Column Layout - Artist Spotlight + Side Cards */}
        <div className="grid md:grid-cols-5 gap-5 mb-6">
          
          {/* Artist Spotlight - Takes 3 columns */}
          <div className="md:col-span-3 glass-card rounded-2xl p-6 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-5">
              <HiSparkles className="text-purple-400 text-xl" />
              <h3 className="text-xl font-bold text-white">הכירו את האמן</h3>
              {artistDetails?.is_premiere && (
                <span className="mr-auto bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  🚀 PREMIERE
                </span>
              )}
            </div>

           <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
              {/* Artist Image */}
              <div className="flex-shrink-0 flex flex-col items-center">
                <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-purple-500/30 shadow-lg shadow-purple-500/20">
                  <img
                    src={artistDetails?.image_url || currentSong?.art || '/images/logo.png'}
                    alt={artistDetails?.name || currentSong?.artist || 'Artist'}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Social Links */}
                {artistDetails && (artistDetails.instagram || artistDetails.soundcloud) && (
                  <div className="flex gap-3 mt-4">
                    {artistDetails.instagram && (
                      <a 
                        href={artistDetails.instagram.startsWith('http') ? artistDetails.instagram : 'https://instagram.com/' + artistDetails.instagram.replace('@', '')} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="w-11 h-11 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center hover:opacity-80 hover:scale-110 transition-all shadow-lg"
                      >
                        <FaInstagram className="text-lg" />
                      </a>
                    )}
                    {artistDetails.soundcloud && (
                      <a 
                        href={artistDetails.soundcloud.startsWith('http') ? artistDetails.soundcloud : 'https://soundcloud.com/' + artistDetails.soundcloud} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="w-11 h-11 rounded-full bg-orange-500 flex items-center justify-center hover:opacity-80 hover:scale-110 transition-all shadow-lg"
                      >
                        <FaSoundcloud className="text-lg" />
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Artist Info */}
<div className="flex-1 min-w-0 text-center sm:text-right">
<div className="flex items-center justify-center sm:justify-start gap-3 mb-3">
  <h4 className="text-2xl font-bold text-white">
    {artistDetails?.name || currentSong?.artist || 'יוצאים לטראק'}
  </h4>
  {artistDetails?.podcast_featured && (
    <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg shadow-amber-500/30 animate-pulse">
      🎙️ התארח\ה בפרק 
    </span>
  )}
</div>
                
                {/* Artist Bio */}
                {artistDetails?.bio ? (
                  <div className="mb-4">
                    <p className={`text-sm text-gray-400 leading-relaxed ${!bioExpanded && bioIsLong ? 'line-clamp-3' : ''}`}>
                      {artistDetails.bio}
                    </p>
                    {bioIsLong && (
                      <button 
  onClick={() => setBioExpanded(!bioExpanded)}
  className="text-purple-400 hover:text-purple-300 text-sm mt-2 flex items-center justify-center sm:justify-start gap-1 transition-colors mx-auto sm:mx-0"
>
                        {bioExpanded ? (
                          <>הצג פחות <FaChevronUp className="text-xs" /></>
                        ) : (
                          <>קרא עוד <FaChevronDown className="text-xs" /></>
                        )}
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mb-4">מוזיקה מקורית מישראל 🇮🇱</p>
                )}

                {/* Track Description */}
                {artistDetails?.track_description && (
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-xs text-purple-400 font-medium mb-2">💬 על הטראק הזה:</p>
                    <p className="text-sm text-gray-300 leading-relaxed">{artistDetails.track_description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Side Column - Next Track + CTA stacked */}
          <div className="md:col-span-2 flex flex-col gap-5">
            
            {/* Next Track */}
            <div className="glass-card rounded-xl p-5 border border-cyan-500/20 flex-1">
              <div className="flex items-center gap-2 mb-4">
                <HiMusicNote className="text-cyan-400 text-lg" />
                <h3 className="text-lg font-bold text-white">הטראק הבא</h3>
              </div>

              {nextSong ? (
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-cyan-500/30 flex-shrink-0">
                    <img src={(() => {
  const art = nextSong.art;
  const isDefaultArt = !art || 
    art.includes('/static/img/generic_song') || 
    (art.includes('/api/station/') && !art.match(/\.(jpg|jpeg|png|webp)$/i));
  return isDefaultArt ? '/images/logo.png' : art;
})()} alt={nextSong.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-[10px] font-bold bg-cyan-500 px-2 py-0.5 rounded">NEXT</span>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-base font-bold text-white truncate">{nextSong.title}</h4>
                    <p className="text-cyan-400 font-medium text-sm truncate">{nextSong.artist}</p>
                    <p className="text-xs text-gray-500 mt-1">מתחיל בקרוב...</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                    <HiMusicNote className="text-cyan-400 text-2xl" />
                  </div>
                  <p className="text-gray-400 text-sm">הטראק הבא יופיע כאן</p>
                </div>
              )}
            </div>

            {/* Artist CTA */}
            <Link href="/radio/register" className="glass-card rounded-xl p-5 border-2 border-purple-500/30 hover:border-purple-500/60 transition group flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 flex items-center justify-center group-hover:scale-110 transition shadow-lg shadow-purple-500/30 flex-shrink-0">
                <FaUpload className="text-xl" />
              </div>
              <div className="min-w-0">
                <h4 className="text-lg font-bold text-white group-hover:text-purple-400 transition">אתם יוצרים?</h4>
                <p className="text-xs text-gray-400">שלחו טראק לשידור והגיעו לאלפי מאזינים</p>
              </div>
            </Link>
          </div>
        </div>

        {/* YouTube CTA Banner - Full Size */}
        <div className="glass-card rounded-2xl p-6 border-2 border-red-500/30 bg-gradient-to-r from-red-900/20 to-purple-900/20">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center shadow-xl shadow-red-500/30">
                <FaYoutube className="text-white text-4xl" />
              </div>
            </div>
            <div className="flex-1 text-center lg:text-right">
              <h3 className="text-2xl font-bold text-white mb-2">הצטרפו לערוץ היוטיוב שלנו</h3>
              <p className="text-gray-300 mb-4">
                האזינו לרדיו מכל מקום - בבית, בדרכים או בטלפון. צפו בכל הפרקים, תוכן בלעדי והפתעות מיוחדות!
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start text-sm text-gray-400 mb-4">
                <div className="flex items-center gap-2">
                  <FaMobileAlt className="text-red-400" />
                  <span>האזנה בכל מכשיר</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaHeadphones className="text-red-400" />
                  <span>פרקים מלאים</span>
                </div>
                <div className="flex items-center gap-2">
                  <HiSparkles className="text-red-400" />
                  <span>תוכן בלעדי</span>
                </div>
              </div>
              <a 
                href="https://www.youtube.com/@tracktripil?sub_confirmation=1" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-500 px-6 py-3 rounded-xl font-bold text-lg transition transform hover:scale-105 shadow-lg shadow-red-500/30"
              >
                <FaYoutube className="text-xl" />
                הירשמו עכשיו - זה בחינם!
              </a>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

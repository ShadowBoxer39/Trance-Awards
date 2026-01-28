import { useState, useEffect } from 'react';
import Head from 'next/head';
import { FaInstagram, FaSoundcloud } from 'react-icons/fa';
import { HiMusicNote } from 'react-icons/hi';

const AZURACAST_API_URL = 'https://a12.asurahosting.com/api/nowplaying/track_trip_radio';

interface NowPlayingData {
  now_playing: { song: { title: string; artist: string; art: string } };
  playing_next?: { song: { title: string; artist: string; art: string } };
  listeners: { current: number };
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

const Visualizer = () => {
  const [heights, setHeights] = useState<number[]>(Array(24).fill(6));
  
  useEffect(() => {
    const interval = setInterval(() => {
      setHeights(Array(24).fill(0).map(() => Math.random() * 48 + 8));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-end justify-center gap-1.5 h-16">
      {heights.map((height, i) => (
        <div
          key={i}
          className="w-1.5 rounded-full transition-all duration-75 bg-gradient-to-t from-purple-500 via-pink-500 to-cyan-400"
          style={{ height: height + 'px' }}
        />
      ))}
    </div>
  );
};

export default function RadioStreamPage() {
  const [nowPlaying, setNowPlaying] = useState<NowPlayingData | null>(null);
  const [artistDetails, setArtistDetails] = useState<ArtistDetails | null>(null);

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
      } else {
        setArtistDetails(null);
      }
    } catch {
      setArtistDetails(null);
    }
  };

  const fetchNowPlaying = async () => {
    try {
      const response = await fetch(AZURACAST_API_URL);
      if (response.ok) {
        const data = await response.json();
        const currentArtist = nowPlaying?.now_playing?.song?.artist;
        const currentTrack = nowPlaying?.now_playing?.song?.title;
        const newArtist = data.now_playing.song.artist;
        const newTrack = data.now_playing.song.title;
        
        if (newArtist !== currentArtist || newTrack !== currentTrack) {
          updateArtistSpotlight(newArtist, newTrack);
        }
        setNowPlaying(data);
      }
    } catch (err) {
      console.log('Stream offline');
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('dir', 'rtl');
    fetchNowPlaying();
    const interval = setInterval(fetchNowPlaying, 5000); // 5 second updates
    return () => clearInterval(interval);
  }, []);

  const currentSong = nowPlaying?.now_playing?.song;
  const nextSong = nowPlaying?.playing_next?.song;

  // Determine album art
  const getAlbumArt = () => {
    const art = currentSong?.art;
    const isDefaultArt = !art || 
      art.includes('/static/img/generic_song') || 
      (art.includes('/api/station/') && !art.match(/\.(jpg|jpeg|png|webp)$/i));
    if (!isDefaultArt) return art;
    return artistDetails?.image_url || '/images/logo.png';
  };

  return (
    <div className="stream-backdrop w-[1920px] h-[1080px] bg-gray-950 text-gray-100 overflow-hidden relative" style={{ cursor: 'none' }}>
      <Head>
        <title>Track Trip Radio - Live Stream</title>
      </Head>

      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-gray-950 to-cyan-900/20" />
      
      {/* Animated background glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Main content */}
      <div className="relative z-10 h-full flex flex-col p-12">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <img src="/images/logo.png" alt="Logo" className="w-16 h-16 rounded-xl" />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                רדיו יוצאים לטראק
              </h1>
              <p className="text-gray-400 text-lg">מוזיקת טראנס ישראלית 24/7</p>
            </div>
          </div>
          
          {/* Live indicator */}
          <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="text-xl font-medium text-white">משדר עכשיו</span>
          </div>
        </div>

        {/* Main area - Now Playing + Artist */}
        <div className="flex-1 flex gap-12">
          
          {/* Left side - Now Playing */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="glass-card rounded-3xl p-10 border border-purple-500/20 bg-white/5 backdrop-blur-sm">
              <div className="flex items-center gap-10">
                
                {/* Album Art */}
                <div className="relative flex-shrink-0">
                  <div className="absolute -inset-4 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-3xl blur-xl opacity-40 animate-pulse"></div>
                  <div className="relative w-72 h-72">
                    <img
                      src={getAlbumArt()}
                      alt="Album Art"
                      className="w-full h-full object-cover rounded-2xl border-2 border-white/20 shadow-2xl"
                    />
                    <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                      <HiMusicNote className="text-white text-2xl" />
                    </div>
                  </div>
                </div>

                {/* Track Info */}
                <div className="flex-1">
                  <p className="text-purple-400 font-medium text-xl mb-2">מתנגן עכשיו</p>
                  <h2 className="text-5xl font-bold text-white mb-3 leading-tight">
                    {currentSong?.title || 'טוען...'}
                  </h2>
                  <p className="text-3xl text-gray-300 mb-8">
                    {currentSong?.artist || 'יוצאים לטראק'}
                  </p>
                  
                  {/* Visualizer */}
                  <Visualizer />
                </div>
              </div>
            </div>

            {/* Next Track */}
            {nextSong && (
              <div className="mt-6 glass-card rounded-2xl p-6 border border-cyan-500/20 bg-white/5 backdrop-blur-sm">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <HiMusicNote className="text-cyan-400 text-2xl" />
                    <span className="text-xl font-bold text-white">הטראק הבא</span>
                  </div>
                  <div className="h-8 w-px bg-white/20" />
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-cyan-500/30 flex-shrink-0">
                    <img 
                      src={(() => {
                        const art = nextSong.art;
                        const isDefaultArt = !art || art.includes('/static/img/generic_song');
                        return isDefaultArt ? '/images/logo.png' : art;
                      })()}
                      alt={nextSong.title} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white">{nextSong.title}</h4>
                    <p className="text-cyan-400 text-lg">{nextSong.artist}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right side - Artist Spotlight */}
          <div className="w-[500px] flex flex-col justify-center">
            <div className="glass-card rounded-3xl p-10 border border-purple-500/20 bg-white/5 backdrop-blur-sm h-full flex flex-col">
              <div className="flex items-center gap-3 mb-8">
                <span className="text-purple-400 text-2xl">✨</span>
                <h3 className="text-2xl font-bold text-white">הכירו את האמן</h3>
                {artistDetails?.podcast_featured && (
                  <span className="mr-auto bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold px-4 py-1.5 rounded-full">
                    🎙️ התארח/ה בפרק
                  </span>
                )}
              </div>

              <div className="flex flex-col items-center text-center flex-1">
                {/* Artist Image */}
                <div className="w-40 h-40 rounded-2xl overflow-hidden border-2 border-purple-500/30 shadow-lg shadow-purple-500/20 mb-6">
                  <img
                    src={artistDetails?.image_url || currentSong?.art || '/images/logo.png'}
                    alt={artistDetails?.name || currentSong?.artist || 'Artist'}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Artist Name */}
                <h4 className="text-3xl font-bold text-white mb-4">
                  {artistDetails?.name || currentSong?.artist || 'יוצאים לטראק'}
                </h4>

                {/* Premiere badge */}
                {artistDetails?.is_premiere && (
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold px-4 py-2 rounded-full mb-4 flex items-center gap-2">
                    🚀 PREMIERE
                  </span>
                )}

                {/* Bio */}
                {artistDetails?.bio ? (
                  <p className="text-lg text-gray-400 leading-relaxed mb-6 flex-1">
                    {artistDetails.bio}
                  </p>
                ) : (
                  <p className="text-lg text-gray-500 mb-6">מוזיקה מקורית מישראל 🇮🇱</p>
                )}

                {/* Track Description */}
                {artistDetails?.track_description && (
                  <div className="bg-white/5 rounded-xl p-5 border border-white/10 mb-6 w-full">
                    <p className="text-sm text-purple-400 font-medium mb-2">💬 על הטראק:</p>
                    <p className="text-base text-gray-300 leading-relaxed">{artistDetails.track_description}</p>
                  </div>
                )}

                {/* Social Links */}
                {artistDetails && (artistDetails.instagram || artistDetails.soundcloud) && (
                  <div className="flex gap-4 mt-auto">
                    {artistDetails.instagram && (
                      <div className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                        <FaInstagram className="text-2xl" />
                      </div>
                    )}
                    {artistDetails.soundcloud && (
                      <div className="w-14 h-14 rounded-full bg-orange-500 flex items-center justify-center shadow-lg">
                        <FaSoundcloud className="text-2xl" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer - YouTube CTA */}
        <div className="mt-8 flex items-center justify-center gap-4 text-gray-400">
          <span className="text-xl">האזינו ברדיו:</span>
          <span className="text-2xl font-bold text-white">tracktrip.co.il/radio</span>
        </div>
      </div>
    </div>
  );
}
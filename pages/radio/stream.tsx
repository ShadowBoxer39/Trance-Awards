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

// Static visualizer bars - no animation
const StaticVisualizer = () => {
  const heights = [12, 28, 20, 36, 24, 40, 18, 32, 26, 38, 16, 34, 22, 30, 28, 36, 20, 32, 24, 38];
  
  return (
    <div className="flex items-end justify-center gap-1.5 h-12">
      {heights.map((height, i) => (
        <div
          key={i}
          className="w-1.5 rounded-full bg-gradient-to-t from-purple-500 via-pink-500 to-cyan-400"
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
    const interval = setInterval(fetchNowPlaying, 5000);
    return () => clearInterval(interval);
  }, []);

  const currentSong = nowPlaying?.now_playing?.song;
  const nextSong = nowPlaying?.playing_next?.song;

  const getAlbumArt = () => {
    const art = currentSong?.art;
    const isDefaultArt = !art || 
      art.includes('/static/img/generic_song') || 
      (art.includes('/api/station/') && !art.match(/\.(jpg|jpeg|png|webp)$/i));
    if (!isDefaultArt) return art;
    return artistDetails?.image_url || '/images/logo.png';
  };

  return (
    <div 
      className="w-[1920px] h-[1080px] bg-gray-950 text-gray-100 overflow-hidden relative"
      style={{ cursor: 'none' }}
    >
      <Head>
        <title>Track Trip Radio - Live Stream</title>
      </Head>

      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-gray-950 to-cyan-900/20" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />

      {/* Main content */}
      <div className="relative z-10 h-full flex flex-col p-10">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <img src="/images/logo.png" alt="Logo" className="w-14 h-14 rounded-xl" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                רדיו יוצאים לטראק
              </h1>
              <p className="text-gray-400">מוזיקת טראנס ישראלית 24/7</p>
            </div>
          </div>
          
          {/* Live indicator - static dot, no animation */}
          <div className="flex items-center gap-3 px-5 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30">
            <span className="flex h-3 w-3">
              <span className="inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="text-lg font-medium text-white">LIVE</span>
          </div>
        </div>

        {/* Main area */}
        <div className="flex-1 flex gap-10">
          
          {/* Left side - Now Playing */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="rounded-3xl p-8 border border-purple-500/20 bg-white/5 backdrop-blur-sm">
              <div className="flex items-center gap-8">
                
                {/* Album Art */}
                <div className="relative flex-shrink-0">
                  <div className="absolute -inset-3 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-3xl blur-xl opacity-30"></div>
                  <div className="relative w-64 h-64">
                    <img
                      src={getAlbumArt()}
                      alt="Album Art"
                      className="w-full h-full object-cover rounded-2xl border-2 border-white/20 shadow-2xl"
                    />
                  </div>
                </div>

                {/* Track Info */}
                <div className="flex-1">
                  <p className="text-purple-400 font-medium text-lg mb-2">מתנגן עכשיו</p>
                  <h2 className="text-4xl font-bold text-white mb-2 leading-tight">
                    {currentSong?.title || 'טוען...'}
                  </h2>
                  <p className="text-2xl text-gray-300 mb-6">
                    {currentSong?.artist || 'יוצאים לטראק'}
                  </p>
                  
                  <StaticVisualizer />
                </div>
              </div>
            </div>

            {/* Next Track */}
            {nextSong && (
              <div className="mt-4 rounded-2xl p-5 border border-cyan-500/20 bg-white/5 backdrop-blur-sm">
                <div className="flex items-center gap-5">
                  <div className="flex items-center gap-2">
                    <HiMusicNote className="text-cyan-400 text-xl" />
                    <span className="text-lg font-bold text-white">הטראק הבא</span>
                  </div>
                  <div className="h-6 w-px bg-white/20" />
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-cyan-500/30 flex-shrink-0">
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
                    <h4 className="text-lg font-bold text-white">{nextSong.title}</h4>
                    <p className="text-cyan-400">{nextSong.artist}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right side - Artist Spotlight */}
          <div className="w-[450px] flex flex-col justify-center">
            <div className="rounded-3xl p-8 border border-purple-500/20 bg-white/5 backdrop-blur-sm h-full flex flex-col">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-purple-400 text-xl">✨</span>
                <h3 className="text-xl font-bold text-white">הכירו את האמן</h3>
                {artistDetails?.podcast_featured && (
                  <span className="mr-auto bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    🎙️ התארח/ה בפרק
                  </span>
                )}
              </div>

              <div className="flex flex-col items-center text-center flex-1">
                {/* Artist Image */}
                <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-purple-500/30 shadow-lg shadow-purple-500/20 mb-4">
                  <img
                    src={artistDetails?.image_url || currentSong?.art || '/images/logo.png'}
                    alt={artistDetails?.name || currentSong?.artist || 'Artist'}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Artist Name */}
                <h4 className="text-2xl font-bold text-white mb-3">
                  {artistDetails?.name || currentSong?.artist || 'יוצאים לטראק'}
                </h4>

                {/* Premiere badge */}
                {artistDetails?.is_premiere && (
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold px-3 py-1.5 rounded-full mb-3">
                    🚀 PREMIERE
                  </span>
                )}

                {/* Bio - limited height */}
                {artistDetails?.bio ? (
                  <p className="text-sm text-gray-400 leading-relaxed mb-4 line-clamp-4">
                    {artistDetails.bio}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 mb-4">מוזיקה מקורית מישראל 🇮🇱</p>
                )}

                {/* Track Description - limited */}
                {artistDetails?.track_description && (
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-4 w-full">
                    <p className="text-xs text-purple-400 font-medium mb-1">💬 על הטראק:</p>
                    <p className="text-sm text-gray-300 leading-relaxed line-clamp-3">{artistDetails.track_description}</p>
                  </div>
                )}

                {/* Social Links */}
                {artistDetails && (artistDetails.instagram || artistDetails.soundcloud) && (
                  <div className="flex gap-3 mt-auto">
                    {artistDetails.instagram && (
                      <div className="w-11 h-11 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                        <FaInstagram className="text-lg" />
                      </div>
                    )}
                    {artistDetails.soundcloud && (
                      <div className="w-11 h-11 rounded-full bg-orange-500 flex items-center justify-center shadow-lg">
                        <FaSoundcloud className="text-lg" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-center gap-3 text-gray-400">
          <span>האזינו ברדיו:</span>
          <span className="text-xl font-bold text-white">tracktrip.co.il/radio</span>
        </div>
      </div>
    </div>
  );
}
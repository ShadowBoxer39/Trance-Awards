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

const StaticVisualizer = () => {
  const heights = [12, 28, 20, 36, 24, 40, 18, 32, 26, 38, 16, 34, 22, 30, 28, 36, 20, 32, 24, 38];
  
  return (
    <div className="flex items-end justify-center gap-1 h-10">
      {heights.map((height, i) => (
        <div
          key={i}
          className="w-1 rounded-full bg-gradient-to-t from-purple-500 via-pink-500 to-cyan-400"
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
      <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-1/3 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl" />

      {/* Main content - using fixed positioning for precise control */}
      <div className="relative z-10 h-full p-8">
        
        {/* Header - fixed at top */}
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
          
          <div className="flex items-center gap-3 px-5 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30">
            <span className="inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            <span className="text-lg font-medium text-white">LIVE</span>
          </div>
        </div>

        {/* Main content area - 3 column grid */}
        <div className="grid grid-cols-12 gap-6 h-[850px]">
          
          {/* Left column - Artist Spotlight */}
          <div className="col-span-3 flex flex-col">
            <div className="rounded-2xl p-6 border border-purple-500/20 bg-white/5 backdrop-blur-sm flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-purple-400 text-lg">✨</span>
                <h3 className="text-lg font-bold text-white">הכירו את האמן</h3>
              </div>
              
              {artistDetails?.podcast_featured && (
                <span className="self-start bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                  🎙️ התארח/ה בפרק
                </span>
              )}

              <div className="flex flex-col items-center text-center flex-1">
                <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-purple-500/30 shadow-lg shadow-purple-500/20 mb-4">
                  <img
                    src={artistDetails?.image_url || currentSong?.art || '/images/logo.png'}
                    alt={artistDetails?.name || currentSong?.artist || 'Artist'}
                    className="w-full h-full object-cover"
                  />
                </div>

                <h4 className="text-xl font-bold text-white mb-2">
                  {artistDetails?.name || currentSong?.artist || 'יוצאים לטראק'}
                </h4>

                {artistDetails?.is_premiere && (
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                    🚀 PREMIERE
                  </span>
                )}

                {artistDetails?.bio ? (
                  <p className="text-sm text-gray-400 leading-relaxed line-clamp-5 mb-4">
                    {artistDetails.bio}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 mb-4">מוזיקה מקורית מישראל 🇮🇱</p>
                )}

                {artistDetails?.track_description && (
                  <div className="bg-white/5 rounded-xl p-3 border border-white/10 w-full mt-auto">
                    <p className="text-xs text-purple-400 font-medium mb-1">💬 על הטראק:</p>
                    <p className="text-xs text-gray-300 leading-relaxed line-clamp-3">{artistDetails.track_description}</p>
                  </div>
                )}

                {artistDetails && (artistDetails.instagram || artistDetails.soundcloud) && (
                  <div className="flex gap-3 mt-4">
                    {artistDetails.instagram && (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                        <FaInstagram className="text-base" />
                      </div>
                    )}
                    {artistDetails.soundcloud && (
                      <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                        <FaSoundcloud className="text-base" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Center column - Now Playing (larger) */}
          <div className="col-span-6 flex flex-col">
            <div className="rounded-2xl p-8 border border-purple-500/20 bg-white/5 backdrop-blur-sm flex-1 flex flex-col justify-center">
              <div className="flex items-center gap-8">
                
                {/* Album Art */}
                <div className="relative flex-shrink-0">
                  <div className="absolute -inset-3 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-2xl blur-xl opacity-30"></div>
                  <img
                    src={getAlbumArt()}
                    alt="Album Art"
                    className="relative w-56 h-56 object-cover rounded-2xl border-2 border-white/20 shadow-2xl"
                  />
                </div>

                {/* Track Info */}
                <div className="flex-1 text-right">
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

            {/* Next Track - below Now Playing */}
            <div className="mt-4 rounded-2xl p-4 border border-cyan-500/20 bg-white/5 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <HiMusicNote className="text-cyan-400 text-lg" />
                  <span className="text-base font-bold text-white">הטראק הבא</span>
                </div>
                <div className="h-5 w-px bg-white/20" />
                {nextSong ? (
                  <>
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-cyan-500/30 flex-shrink-0">
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
                      <h4 className="text-base font-bold text-white">{nextSong.title}</h4>
                      <p className="text-cyan-400 text-sm">{nextSong.artist}</p>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-400 text-sm">יופיע בקרוב...</p>
                )}
              </div>
            </div>

            {/* Footer URL */}
            <div className="mt-4 text-center text-gray-400">
              <span>האזינו ברדיו: </span>
              <span className="text-lg font-bold text-white">tracktrip.co.il/radio</span>
            </div>
          </div>

          {/* Right column - empty for balance or future use */}
          <div className="col-span-3">
            {/* Can add listeners count, QR code, or leave empty */}
          </div>
        </div>
      </div>
    </div>
  );
}
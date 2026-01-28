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
  const heights = [14, 32, 22, 40, 28, 45, 20, 38, 30, 42, 18, 36, 25, 34, 30, 40, 22, 35, 28, 42, 16, 38, 24, 36];
  
  return (
    <div className="flex items-end justify-center gap-1 h-12">
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

      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-gray-950 to-cyan-900/30" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-purple-500/20 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[400px] bg-cyan-500/15 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[400px] bg-pink-500/15 rounded-full blur-[120px]" />

      {/* Main layout - fixed height sections */}
      <div className="relative z-10 h-[1080px] flex flex-col p-8">
        
        {/* Header - 80px */}
        <div className="h-[80px] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-red-500/20 border border-red-500/40">
              <span className="inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              <span className="text-lg font-bold text-white">LIVE</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right" dir="rtl">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                רדיו יוצאים לטראק
              </h1>
              <p className="text-gray-400">מוזיקת טראנס ישראלית 24/7</p>
            </div>
            <img src="/images/logo.png" alt="Logo" className="w-14 h-14 rounded-xl" />
          </div>
        </div>

        {/* Main content - fills remaining space */}
        <div className="flex-1 flex gap-8 min-h-0">
          
          {/* Left side - Now Playing */}
          <div className="flex-[3] flex flex-col gap-4">
            
            {/* Now Playing Card */}
            <div className="flex-1 rounded-3xl p-10 border border-white/10 bg-white/5 backdrop-blur-sm flex items-center">
              <div className="flex items-center gap-12 w-full">
                
                {/* Album Art */}
                <div className="relative flex-shrink-0">
                  <div className="absolute -inset-4 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-3xl blur-2xl opacity-40"></div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-2xl opacity-60"></div>
                  <img
                    src={getAlbumArt()}
                    alt="Album Art"
                    className="relative w-72 h-72 object-cover rounded-2xl shadow-2xl"
                  />
                </div>

                {/* Track Info */}
                <div className="flex-1" dir="rtl">
                  <p className="text-purple-400 font-semibold text-xl mb-3">מתנגן עכשיו</p>
                  <h2 className="text-5xl font-black text-white mb-3 leading-tight">
                    {currentSong?.title || 'טוען...'}
                  </h2>
                  <p className="text-3xl text-gray-300 mb-8">
                    {currentSong?.artist || 'יוצאים לטראק'}
                  </p>
                  
                  <StaticVisualizer />
                </div>
              </div>
            </div>

            {/* Bottom row - 80px fixed */}
            <div className="h-[80px] flex items-center gap-6 flex-shrink-0">
              {/* Next Track */}
              <div className="flex-1 h-full rounded-2xl px-6 border border-cyan-500/20 bg-white/5 backdrop-blur-sm flex items-center" dir="rtl">
                <div className="flex items-center gap-4">
                  <HiMusicNote className="text-cyan-400 text-2xl" />
                  <span className="text-lg font-bold text-white">הטראק הבא:</span>
                  {nextSong ? (
                    <>
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-cyan-500/30 flex-shrink-0">
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
                    </>
                  ) : (
                    <p className="text-gray-400">יופיע בקרוב...</p>
                  )}
                </div>
              </div>

              {/* URL */}
              <div className="h-full rounded-2xl px-8 border border-purple-500/20 bg-white/5 flex flex-col justify-center" dir="rtl">
                <p className="text-gray-400 text-sm">האזינו ברדיו</p>
                <p className="text-xl font-bold text-white">tracktrip.co.il/radio</p>
              </div>
            </div>
          </div>

          {/* Right side - Artist Spotlight */}
          <div className="flex-[2]">
            <div className="h-full rounded-3xl p-8 border border-purple-500/20 bg-white/5 backdrop-blur-sm" dir="rtl">
              
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-purple-400 text-2xl">✨</span>
                  <h3 className="text-2xl font-bold text-white">הכירו את האמן</h3>
                </div>
                {artistDetails?.podcast_featured && (
                  <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold px-4 py-1.5 rounded-full">
                    🎙️ התארח/ה בפרק
                  </span>
                )}
              </div>

              {/* Artist image + name + socials */}
              <div className="flex items-start gap-6 mb-6">
                <div className="relative flex-shrink-0">
                  <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-50"></div>
                  <div className="relative w-36 h-36 rounded-2xl overflow-hidden border-2 border-white/20">
                    <img
                      src={artistDetails?.image_url || currentSong?.art || '/images/logo.png'}
                      alt={artistDetails?.name || currentSong?.artist || 'Artist'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="pt-2">
                  <h4 className="text-3xl font-bold text-white mb-2">
                    {artistDetails?.name || currentSong?.artist || 'יוצאים לטראק'}
                  </h4>
                  {artistDetails?.is_premiere && (
                    <span className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold px-4 py-1.5 rounded-full mb-3">
                      🚀 PREMIERE
                    </span>
                  )}
                  
                  {/* Social Links */}
                  {artistDetails && (artistDetails.instagram || artistDetails.soundcloud) && (
                    <div className="flex gap-3 mt-3">
                      {artistDetails.instagram && (
                        <div className="w-11 h-11 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                          <FaInstagram className="text-lg" />
                        </div>
                      )}
                      {artistDetails.soundcloud && (
                        <div className="w-11 h-11 rounded-full bg-orange-500 flex items-center justify-center">
                          <FaSoundcloud className="text-lg" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              {artistDetails?.bio ? (
                <p className="text-base text-gray-300 leading-relaxed mb-6">
                  {artistDetails.bio}
                </p>
              ) : (
                <p className="text-base text-gray-500 mb-6">מוזיקה מקורית מישראל 🇮🇱</p>
              )}

              {/* Track Description */}
              {artistDetails?.track_description && (
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl p-5 border border-purple-500/20">
                  <p className="text-purple-400 font-semibold mb-2">💬 על הטראק הזה:</p>
                  <p className="text-base text-gray-300 leading-relaxed">{artistDetails.track_description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// pages/[slug].tsx - ENHANCED Premium Artist Profile Page
import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { createClient } from "@supabase/supabase-js";
import Navigation from "../components/Navigation";
import { 
  getArtistLatestRelease, 
  getArtistProfile, 
  getArtistTopTracks,
  getArtistDiscography 
} from "../lib/spotify";
import { 
  FaInstagram, 
  FaFacebook, 
  FaSoundcloud, 
  FaSpotify, 
  FaYoutube, 
  FaGlobe,
  FaPlay,
  FaEye,
  FaUsers,
  FaFire,
  FaCalendar,
  FaCompactDisc
} from 'react-icons/fa';

// ==========================================
// TYPES
// ==========================================

interface Artist {
  id: number;
  slug: string;
  name: string;
  stage_name: string;
  bio: string;
  profile_photo_url: string | null;
  cover_photo_url: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  soundcloud_url: string | null;
  spotify_url: string | null;
  youtube_url: string | null;
  tiktok_url: string | null;
  twitter_url: string | null;
  website_url: string | null;
  genre: string | null;
  country: string | null;
  city: string | null;
  total_episodes: number;
  spotify_artist_id: string | null;
  instagram_reels: string[];
  photo_gallery: string[];
}

interface Episode {
  id: number;
  youtube_video_id: string;
  episode_number: number | null;
  title: string;
  clean_title: string;
  description: string;
  thumbnail_url: string;
  published_at: string;
  duration: number | null;
  view_count: number | null;
  is_special: boolean;
  role: string;
}

interface SpotifyRelease {
  name: string;
  releaseDate: string;
  type: string;
  spotifyUrl: string;
  embedUrl: string;
  coverImage: string;
}

interface SpotifyProfile {
  name: string;
  followers: number;
  genres: string[];
  popularity: number;
  image: string;
  spotifyUrl: string;
}

interface SpotifyTrack {
  id: string;
  name: string;
  album: string;
  albumCover: string;
  duration: number;
  previewUrl: string | null;
  spotifyUrl: string;
  embedUrl: string;
}

interface DiscographyItem {
  id: string;
  name: string;
  releaseDate: string;
  type: string;
  coverImage: string;
  spotifyUrl: string;
  totalTracks: number;
}

interface ArtistPageProps {
  artist: Artist;
  episodes: Episode[];
  spotifyRelease: SpotifyRelease | null;
  spotifyProfile: SpotifyProfile | null;
  topTracks: SpotifyTrack[] | null;
  discography: DiscographyItem[] | null;
}

// ==========================================
// ANIMATED COUNTER COMPONENT
// ==========================================

function AnimatedCounter({ end, duration = 2000 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    const increment = end / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [isVisible, end, duration]);

  return <div ref={ref}>{count.toLocaleString()}</div>;
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function ArtistPage({ 
  artist, 
  episodes, 
  spotifyRelease, 
  spotifyProfile,
  topTracks,
  discography 
}: ArtistPageProps) {
  const displayName = artist.stage_name || artist.name;
  const [scrollY, setScrollY] = useState(0);
  const [activeTrack, setActiveTrack] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate parallax values
  const heroOpacity = Math.max(0, 1 - scrollY / 300);
  const heroTranslate = scrollY * 0.5;

  const socialLinks = [
    { icon: 'instagram', url: artist.instagram_url, label: 'Instagram', color: 'hover:text-pink-400' },
    { icon: 'facebook', url: artist.facebook_url, label: 'Facebook', color: 'hover:text-blue-400' },
    { icon: 'soundcloud', url: artist.soundcloud_url, label: 'SoundCloud', color: 'hover:text-orange-400' },
    { icon: 'spotify', url: artist.spotify_url, label: 'Spotify', color: 'hover:text-green-400' },
    { icon: 'youtube', url: artist.youtube_url, label: 'YouTube', color: 'hover:text-red-400' },
    { icon: 'website', url: artist.website_url, label: 'Website', color: 'hover:text-cyan-400' },
  ].filter(link => link.url);

  return (
    <>
      <Head>
        <title>{displayName} - יוצאים לטראק</title>
        <meta name="description" content={artist.bio || `כל הפרקים עם ${displayName}`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/images/logo.png" />
        <meta property="og:title" content={`${displayName} - יוצאים לטראק`} />
        <meta property="og:description" content={artist.bio || `כל הפרקים עם ${displayName}`} />
        {artist.profile_photo_url && <meta property="og:image" content={artist.profile_photo_url} />}
        <meta property="og:type" content="profile" />
      </Head>

      <div className="min-h-screen bg-gray-900 text-white">
        {/* Navigation */}
        <div className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-md">
          <Navigation currentPage="episodes" />
        </div>

        {/* Animated Background Orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="orb orb-purple" />
          <div className="orb orb-cyan" />
          <div className="orb orb-pink" />
        </div>

        {/* Hero Section - Full Viewport with Parallax */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          {/* Parallax Background */}
          <div 
            className="absolute inset-0 z-0"
            style={{
              transform: `translateY(${heroTranslate}px) scale(1.1)`,
              opacity: heroOpacity
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-purple-900/50 via-gray-900/80 to-gray-900 z-10" />
            {artist.cover_photo_url || artist.profile_photo_url ? (
              <img
                src={artist.cover_photo_url || artist.profile_photo_url!}
                alt={displayName}
                className="w-full h-full object-cover blur-sm"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-600 to-cyan-600" />
            )}
          </div>

          {/* Hero Content */}
          <div className="relative z-20 text-center max-w-4xl mx-auto px-6" style={{ opacity: heroOpacity }}>
            {/* Profile Photo */}
            <div className="mb-8 inline-block animate-float">
              <div className="relative w-40 h-40 md:w-48 md:h-48 mx-auto">
                <div className="absolute inset-0 rounded-full glow-ring" />
                <div className="absolute inset-1 rounded-full bg-gray-900" />
                <div className="absolute inset-2 rounded-full overflow-hidden border-4 border-cyan-400/50">
                  {artist.profile_photo_url ? (
                    <img src={artist.profile_photo_url} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center">
                      <span className="text-6xl font-bold">{displayName[0]}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Artist Name */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 gradient-text-animated slide-up">
              {displayName}
            </h1>

            {/* Genre Badge */}
            {artist.genre && (
              <div className="mb-6 slide-up" style={{ animationDelay: '0.1s' }}>
                <span className="px-4 py-2 bg-purple-600/30 rounded-full text-sm backdrop-blur-sm border border-purple-500/30">
                  {artist.genre}
                </span>
              </div>
            )}

            {/* Bio */}
            {artist.bio && (
              <p className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto mb-8 leading-relaxed slide-up" style={{ animationDelay: '0.2s' }}>
                {artist.bio}
              </p>
            )}

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="flex justify-center gap-6 mb-8 slide-up" style={{ animationDelay: '0.3s' }}>
                {socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-3xl text-gray-400 transition-all hover:scale-125 hover:-translate-y-1 ${link.color}`}
                    aria-label={link.label}
                  >
                    {getSocialIcon(link.icon)}
                  </a>
                ))}
              </div>
            )}

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 scroll-indicator">
              <div className="text-cyan-400 text-4xl">↓</div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="relative z-10">
          {/* Artist Stats Bar */}
          {spotifyProfile && (
            <section className="py-12 px-6 bg-gradient-to-r from-purple-900/30 via-gray-900/50 to-cyan-900/30">
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-center">
                  <div className="glass-card p-6 hover-lift">
                    <FaUsers className="w-10 h-10 mx-auto mb-3 text-purple-400" />
                    <div className="text-3xl font-bold gradient-text mb-2">
                      <AnimatedCounter end={spotifyProfile.followers} />
                    </div>
                    <div className="text-gray-400 text-sm">Spotify Followers</div>
                  </div>

                  <div className="glass-card p-6 hover-lift">
                    <FaFire className="w-10 h-10 mx-auto mb-3 text-orange-400" />
                    <div className="text-3xl font-bold gradient-text mb-2">
                      <AnimatedCounter end={spotifyProfile.popularity} />
                    </div>
                    <div className="text-gray-400 text-sm">Popularity Score</div>
                  </div>

                  <div className="glass-card p-6 hover-lift col-span-2 md:col-span-1">
                    <FaCompactDisc className="w-10 h-10 mx-auto mb-3 text-cyan-400" />
                    <div className="text-3xl font-bold gradient-text mb-2">
                      <AnimatedCounter end={discography?.length || 0} />
                    </div>
                    <div className="text-gray-400 text-sm">Releases</div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Top Tracks Section */}
          {topTracks && topTracks.length > 0 && (
            <section className="py-20 px-6">
              <div className="max-w-7xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center gradient-text flex items-center justify-center gap-3">
                  <FaFire className="text-orange-400" />
                  Top Tracks
                </h2>

                <div className="grid gap-4 max-w-4xl mx-auto">
                  {topTracks.map((track, index) => (
                    <div key={track.id} className="glass-card p-4 hover-lift group">
                      <div className="flex items-center gap-4">
                        {/* Track Number */}
                        <div className="text-2xl font-bold text-gray-600 w-8">
                          {index + 1}
                        </div>

                        {/* Album Cover */}
                        <div className="relative w-16 h-16 flex-shrink-0">
                          <img src={track.albumCover} alt={track.album} className="w-full h-full rounded" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <FaPlay className="text-white text-xl" />
                          </div>
                        </div>

                        {/* Track Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-white truncate group-hover:text-purple-400 transition">
                            {track.name}
                          </h3>
                          <p className="text-sm text-gray-400 truncate">{track.album}</p>
                        </div>

                        {/* Duration */}
                        <div className="text-sm text-gray-400 hidden md:block">
                          {Math.floor(track.duration / 60000)}:{String(Math.floor((track.duration % 60000) / 1000)).padStart(2, '0')}
                        </div>

                        {/* Play on Spotify */}
                        <a
                          href={track.spotifyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-spotify px-4 py-2"
                        >
                          <FaSpotify className="text-xl" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Episode Showcase Section */}
          {episodes.length > 0 && (
            <section className="py-20 px-6 bg-gradient-to-b from-transparent to-gray-900/50">
              <div className="max-w-7xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center gradient-text">
                  {episodes.length === 1 ? 'פרק עם' : 'פרקים עם'} {displayName}
                </h2>

                {episodes.length === 1 ? (
                  <div className="max-w-6xl mx-auto">
                    <div className="glass-card overflow-hidden hover-lift">
                      <div className="grid md:grid-cols-2 gap-8 p-8">
                        <div className="relative aspect-video rounded-lg overflow-hidden group">
                          <img src={episodes[0].thumbnail_url} alt={episodes[0].title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="play-button">
                              <FaPlay className="text-white text-2xl ml-1" />
                            </div>
                          </div>
                          {episodes[0].episode_number && (
                            <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
                              #{episodes[0].episode_number}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col justify-center">
                          <h3 className="text-3xl font-bold mb-4 text-white">
                            {episodes[0].clean_title || episodes[0].title}
                          </h3>
                          <div className="flex items-center gap-4 text-gray-400 mb-6">
                            <span>{new Date(episodes[0].published_at).toLocaleDateString('he-IL')}</span>
                            {episodes[0].view_count && (
                              <>
                                <span>•</span>
                                <span>{episodes[0].view_count.toLocaleString()} צפיות</span>
                              </>
                            )}
                          </div>
                          <p className="text-gray-300 mb-8 leading-relaxed">
                            צפו בפרק המלא עם {displayName} ב-יוצאים לטראק, הפודקאסט הגדול בישראל לטראנס.
                          </p>
                          <a
                            href={`https://www.youtube.com/watch?v=${episodes[0].youtube_video_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-gradient inline-flex items-center justify-center gap-3 group"
                          >
                            <FaPlay className="text-xl transition-transform group-hover:scale-110" />
                            <span className="text-lg">צפה בפרק המלא</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {episodes.map((episode) => (
                      <a
                        key={episode.id}
                        href={`https://www.youtube.com/watch?v=${episode.youtube_video_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="glass-card rounded-xl overflow-hidden hover-lift group"
                      >
                        <div className="aspect-video bg-gray-800 relative overflow-hidden">
                          <img src={episode.thumbnail_url} alt={episode.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <FaPlay className="w-16 h-16 text-white" />
                          </div>
                          {episode.episode_number && (
                            <div className="absolute top-3 right-3 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                              #{episode.episode_number}
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="text-base font-semibold mb-2 line-clamp-2 group-hover:text-purple-400 transition">
                            {episode.clean_title || episode.title}
                          </h3>
                          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                            <span className="px-2 py-1 bg-purple-600/30 rounded">{episode.role}</span>
                            <span>{new Date(episode.published_at).toLocaleDateString('he-IL')}</span>
                          </div>
                          {episode.view_count && (
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <FaEye className="w-4 h-4" />
                              <span>{episode.view_count.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Instagram Reels Section */}
          {artist.instagram_reels && artist.instagram_reels.length > 0 && (
            <section className="py-20 px-6">
              <div className="max-w-7xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center gradient-text flex items-center justify-center gap-3">
                  <FaInstagram className="text-pink-400" />
                  Instagram Reels
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {artist.instagram_reels.map((reelUrl, index) => (
                    <div key={index} className="glass-card overflow-hidden hover-lift">
                      <iframe
                        src={`${reelUrl}embed`}
                        width="100%"
                        height="600"
                        frameBorder="0"
                        scrolling="no"
                        allowTransparency={true}
                        allow="encrypted-media"
                        className="w-full"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Discography Timeline */}
          {discography && discography.length > 0 && (
            <section className="py-20 px-6 bg-gradient-to-b from-transparent to-gray-900/50">
              <div className="max-w-7xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center gradient-text flex items-center justify-center gap-3">
                  <FaCalendar className="text-purple-400" />
                  Discography
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {discography.map((release) => (
                    <a
                      key={release.id}
                      href={release.spotifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="glass-card overflow-hidden hover-lift group"
                    >
                      <div className="relative aspect-square">
                        <img src={release.coverImage} alt={release.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <FaSpotify className="text-white text-4xl" />
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-sm mb-1 line-clamp-2 group-hover:text-purple-400 transition">
                          {release.name}
                        </h3>
                        <p className="text-xs text-gray-400">{new Date(release.releaseDate).getFullYear()}</p>
                        <span className="inline-block mt-2 px-2 py-1 bg-purple-600/30 rounded text-xs">
                          {release.type === 'album' ? 'Album' : 'Single'}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Spotify Latest Release */}
          {spotifyRelease && (
            <section className="py-20 px-6">
              <div className="max-w-5xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold mb-8 text-center flex items-center justify-center gap-3">
                  <span className="gradient-text-green">Latest Release</span>
                  <FaSpotify className="w-10 h-10 text-green-400" />
                </h2>

                <div className="glass-card p-8">
                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div className="flex flex-col justify-center">
                      <h3 className="text-3xl font-bold mb-4 text-white">{spotifyRelease.name}</h3>
                      <p className="text-gray-400 mb-6">
                        {spotifyRelease.type === 'album' ? 'Album' : 'Single'} • {new Date(spotifyRelease.releaseDate).getFullYear()}
                      </p>
                      <a
                        href={spotifyRelease.spotifyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-full transition-all duration-300 w-fit hover:shadow-[0_0_30px_rgba(34,197,94,0.5)]"
                      >
                        <FaSpotify className="text-xl" />
                        <span>Listen on Spotify</span>
                      </a>
                    </div>

                    {spotifyRelease.coverImage && (
                      <div className="relative aspect-square rounded-lg overflow-hidden">
                        <img src={spotifyRelease.coverImage} alt={spotifyRelease.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  <div className="w-full rounded-lg overflow-hidden">
                    <iframe
                      src={spotifyRelease.embedUrl}
                      width="100%"
                      height="380"
                      frameBorder="0"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Connect Section */}
          {socialLinks.length > 0 && (
            <section className="py-20 px-6">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-4xl md:text-5xl font-bold mb-12 gradient-text">
                  התחבר עם {displayName}
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {socialLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="glass-card p-8 flex flex-col items-center gap-4 hover-lift group"
                    >
                      <div className={`text-5xl transition-colors ${link.color.replace('hover:', 'group-hover:')}`}>
                        {getSocialIcon(link.icon)}
                      </div>
                      <span className="font-semibold text-gray-300">{link.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Back to Episodes */}
          <section className="py-12 px-6">
            <div className="max-w-4xl mx-auto text-center">
              <Link href="/episodes">
                <span className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-semibold text-lg transition-colors cursor-pointer">
                  ← חזרה לכל הפרקים
                </span>
              </Link>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-800 mt-16">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
              <div>© 2025 יוצאים לטראק</div>
              <div className="flex gap-6">
                <Link href="/" className="hover:text-gray-300 transition">בית</Link>
                <Link href="/episodes" className="hover:text-gray-300 transition">פרקים</Link>
                <Link href="/track-of-the-week" className="hover:text-gray-300 transition">טראק השבוע</Link>
              </div>
            </div>
          </div>
        </footer>

        {/* Custom Styles */}
        <style jsx>{`
          .orb {
            position: absolute;
            border-radius: 50%;
            filter: blur(80px);
            animation: float 6s ease-in-out infinite;
          }
          
          .orb-purple {
            top: 25%;
            right: -8rem;
            width: 24rem;
            height: 24rem;
            background: rgba(147, 51, 234, 0.3);
          }
          
          .orb-cyan {
            bottom: 25%;
            left: -8rem;
            width: 24rem;
            height: 24rem;
            background: rgba(6, 182, 212, 0.3);
            animation-delay: 1s;
          }
          
          .orb-pink {
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 24rem;
            height: 24rem;
            background: rgba(236, 72, 153, 0.2);
            animation: pulse-glow 4s ease-in-out infinite;
          }

          @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
          }

          @keyframes pulse-glow {
            0%, 100% { opacity: 0.3; transform: scale(1) translate(-50%, -50%); }
            50% { opacity: 0.5; transform: scale(1.1) translate(-50%, -50%); }
          }

          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          @keyframes slide-up {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes bounce-subtle {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }

          .animate-float {
            animation: float 3s ease-in-out infinite;
          }

          .slide-up {
            animation: slide-up 0.8s ease-out forwards;
            opacity: 0;
          }

          .scroll-indicator {
            animation: bounce-subtle 1.5s ease-in-out infinite;
          }

          .glow-ring {
            background: conic-gradient(from 0deg, #8b5cf6, #06b6d4, #8b5cf6);
            animation: spin-slow 8s linear infinite;
            filter: blur(4px);
          }

          .glass-card {
            background: rgba(17, 24, 39, 0.7);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 1rem;
          }

          .gradient-text {
            background: linear-gradient(to right, #06b6d4, #8b5cf6, #06b6d4);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          .gradient-text-animated {
            background: linear-gradient(90deg, #06b6d4, #8b5cf6, #06b6d4, #8b5cf6);
            background-size: 200% 100%;
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: gradient-shift 3s ease infinite;
          }

          .gradient-text-green {
            background: linear-gradient(to right, #22c55e, #06b6d4);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          @keyframes gradient-shift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          .hover-lift {
            transition: all 0.3s ease;
          }

          .hover-lift:hover {
            transform: translateY(-8px) scale(1.02);
            box-shadow: 0 20px 40px rgba(139, 92, 246, 0.3);
          }

          .play-button {
            width: 5rem;
            height: 5rem;
            border-radius: 50%;
            background: linear-gradient(to right, #8b5cf6, #06b6d4);
            display: flex;
            align-items: center;
            justify-center;
            transition: transform 0.3s ease;
          }

          .play-button:hover {
            transform: scale(1.1);
          }

          .btn-gradient {
            padding: 1rem 2rem;
            background: linear-gradient(to right, #8b5cf6, #06b6d4);
            color: white;
            font-weight: bold;
            border-radius: 9999px;
            transition: all 0.3s ease;
          }

          .btn-gradient:hover {
            box-shadow: 0 0 40px rgba(168, 85, 247, 0.6);
            transform: translateY(-2px);
          }

          .btn-spotify {
            padding: 0.5rem 1rem;
            background: #1DB954;
            color: white;
            border-radius: 9999px;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }

          .btn-spotify:hover {
            background: #1ed760;
            transform: scale(1.05);
          }
        `}</style>
      </div>
    </>
  );
}

// Helper function to get social icons
function getSocialIcon(type: string) {
  const iconProps = { className: "w-full h-full" };
  
  const icons: { [key: string]: React.ReactElement } = {
    instagram: <FaInstagram {...iconProps} />,
    facebook: <FaFacebook {...iconProps} />,
    soundcloud: <FaSoundcloud {...iconProps} />,
    spotify: <FaSpotify {...iconProps} />,
    youtube: <FaYoutube {...iconProps} />,
    website: <FaGlobe {...iconProps} />,
  };

  return icons[type] || null;
}

// ==========================================
// SERVER-SIDE DATA FETCHING
// ==========================================

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const slug = params?.slug as string;

  const reservedSlugs = [
    'episodes', 'admin', 'track-of-the-week', 'about', 'api',
    'young-artists', '_next', 'images', 'favicon.ico',
  ];

  if (reservedSlugs.includes(slug)) {
    return { notFound: true };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Fetch artist
    const { data: artist, error: artistError } = await supabase
      .from('artists')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (artistError || !artist) {
      return { notFound: true };
    }

    // Fetch artist's episodes
    const { data: episodesData, error: episodesError } = await supabase
      .from('artist_episodes')
      .select(`
        role,
        episode_id,
        episodes (
          id, youtube_video_id, episode_number, title, clean_title,
          description, thumbnail_url, published_at, duration,
          view_count, is_special
        )
      `)
      .eq('artist_id', artist.id)
      .order('episode_id', { ascending: true });

    if (episodesError) {
      console.error('Error fetching episodes:', episodesError);
    }

    const episodes = (episodesData || []).map((item: any) => ({
      ...item.episodes,
      role: item.role,
    }));

    // Fetch Spotify data if artist has Spotify ID
    let spotifyRelease = null;
    let spotifyProfileImage = null;
    let spotifyProfile = null;
    let topTracks = null;
    let discography = null;
    
    if (artist.spotify_artist_id) {
      try {
        // Fetch all Spotify data in parallel
        const [release, profile, tracks, disco] = await Promise.all([
          getArtistLatestRelease(artist.spotify_artist_id),
          getArtistProfile(artist.spotify_artist_id),
          getArtistTopTracks(artist.spotify_artist_id),
          getArtistDiscography(artist.spotify_artist_id),
        ]);

        spotifyRelease = release;
        spotifyProfile = profile;
        topTracks = tracks;
        discography = disco;

        if (profile?.image) {
          spotifyProfileImage = profile.image;
        }
      } catch (error) {
        console.error('Failed to fetch Spotify data:', error);
      }
    }

    // Merge Spotify image with artist data
    const artistWithImage = {
      ...artist,
      profile_photo_url: spotifyProfileImage || artist.profile_photo_url,
      cover_photo_url: spotifyProfileImage || artist.cover_photo_url,
    };

    return {
      props: {
        artist: artistWithImage,
        episodes,
        spotifyRelease,
        spotifyProfile,
        topTracks,
        discography,
      },
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return { notFound: true };
  }
};

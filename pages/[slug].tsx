// pages/[slug].tsx - Premium Artist Profile Page
import Head from "next/head";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { createClient } from "@supabase/supabase-js";
import Navigation from "../components/Navigation";
import { getArtistLatestRelease, getArtistProfile } from "../lib/spotify";
import { useState, useEffect } from "react";

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

interface ArtistPageProps {
  artist: Artist;
  episodes: Episode[];
  spotifyRelease: SpotifyRelease | null;
}

// ==========================================
// COMPONENT
// ==========================================

export default function ArtistPage({ artist, episodes, spotifyRelease }: ArtistPageProps) {
  const displayName = artist.stage_name || artist.name;
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate parallax values
  const heroOpacity = Math.max(0, 1 - scrollY / 300);
  const heroTranslate = scrollY * 0.5;

  const socialLinks = [
    { 
      icon: 'instagram', 
      url: artist.instagram_url, 
      label: 'Instagram',
      color: 'hover:text-pink-400'
    },
    { 
      icon: 'facebook', 
      url: artist.facebook_url, 
      label: 'Facebook',
      color: 'hover:text-blue-400'
    },
    { 
      icon: 'soundcloud', 
      url: artist.soundcloud_url, 
      label: 'SoundCloud',
      color: 'hover:text-orange-400'
    },
    { 
      icon: 'spotify', 
      url: artist.spotify_url, 
      label: 'Spotify',
      color: 'hover:text-green-400'
    },
    { 
      icon: 'youtube', 
      url: artist.youtube_url, 
      label: 'YouTube',
      color: 'hover:text-red-400'
    },
    { 
      icon: 'website', 
      url: artist.website_url, 
      label: 'Website',
      color: 'hover:text-cyan-400'
    },
  ].filter(link => link.url);

  return (
    <>
      <Head>
        <title>{displayName} - יוצאים לטראק</title>
        <meta
          name="description"
          content={`${artist.bio || `כל הפרקים עם ${displayName}`}`}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/images/logo.png" />
        
        <meta property="og:title" content={`${displayName} - יוצאים לטראק`} />
        <meta property="og:description" content={artist.bio || `כל הפרקים עם ${displayName}`} />
        {artist.profile_photo_url && (
          <meta property="og:image" content={artist.profile_photo_url} />
        )}
        <meta property="og:type" content="profile" />
      </Head>

      <div className="min-h-screen bg-gray-900 text-white">
        {/* Navigation - Sticky */}
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
          <div 
            className="relative z-20 text-center max-w-4xl mx-auto px-6"
            style={{ opacity: heroOpacity }}
          >
            {/* Profile Photo with Animated Glow */}
            <div className="mb-8 inline-block animate-float">
              <div className="relative w-40 h-40 md:w-48 md:h-48 mx-auto">
                {/* Rotating Glow Ring */}
                <div className="absolute inset-0 rounded-full glow-ring" />
                <div className="absolute inset-1 rounded-full bg-gray-900" />
                
                {/* Profile Image */}
                <div className="absolute inset-2 rounded-full overflow-hidden border-4 border-cyan-400/50">
                  {artist.profile_photo_url ? (
                    <img
                      src={artist.profile_photo_url}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
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
          {/* Episode Showcase Section */}
          {episodes.length > 0 && (
            <section className="py-20 px-6">
              <div className="max-w-7xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center gradient-text">
                  {episodes.length === 1 ? 'פרק עם' : 'פרקים עם'} {displayName}
                </h2>

                {episodes.length === 1 ? (
                  // Single Episode - Large Showcase
                  <div className="max-w-6xl mx-auto">
                    <div className="glass-card overflow-hidden hover-lift">
                      <div className="grid md:grid-cols-2 gap-8 p-8">
                        {/* Thumbnail */}
                        <div className="relative aspect-video rounded-lg overflow-hidden group">
                          <img
                            src={episodes[0].thumbnail_url}
                            alt={episodes[0].title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          
                          {/* Play Button Overlay */}
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="play-button">
                              <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                            </div>
                          </div>

                          {/* Episode Number Badge */}
                          {episodes[0].episode_number && (
                            <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
                              #{episodes[0].episode_number}
                            </div>
                          )}
                        </div>

                        {/* Episode Details */}
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

                          {/* Watch Button */}
                          <a
                            href={`https://www.youtube.com/watch?v=${episodes[0].youtube_video_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-gradient inline-flex items-center justify-center gap-3 group"
                          >
                            <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                            <span className="text-lg">צפה בפרק המלא</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Multiple Episodes - Grid
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
                          <img
                            src={episode.thumbnail_url}
                            alt={episode.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
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
                            <span className="px-2 py-1 bg-purple-600/30 rounded">
                              {episode.role}
                            </span>
                            <span>
                              {new Date(episode.published_at).toLocaleDateString('he-IL')}
                            </span>
                          </div>

                          {episode.view_count && (
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                              </svg>
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

          {/* Spotify Latest Release Section */}
          {spotifyRelease && (
            <section className="py-20 px-6 bg-gradient-to-b from-transparent to-gray-900/50">
              <div className="max-w-5xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold mb-8 text-center flex items-center justify-center gap-3">
                  <span className="gradient-text-green">Latest Release</span>
                  <svg className="w-10 h-10 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                </h2>

                <div className="glass-card p-8">
                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                    {/* Release Info */}
                    <div className="flex flex-col justify-center">
                      <h3 className="text-3xl font-bold mb-4 text-white">
                        {spotifyRelease.name}
                      </h3>
                      <p className="text-gray-400 mb-6">
                        {spotifyRelease.type === 'album' ? 'Album' : 'Single'} • {new Date(spotifyRelease.releaseDate).getFullYear()}
                      </p>
                      <a
                        href={spotifyRelease.spotifyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-full transition-all duration-300 w-fit hover:shadow-[0_0_30px_rgba(34,197,94,0.5)]"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                        </svg>
                        <span>Listen on Spotify</span>
                      </a>
                    </div>

                    {/* Album Cover */}
                    {spotifyRelease.coverImage && (
                      <div className="relative aspect-square rounded-lg overflow-hidden">
                        <img
                          src={spotifyRelease.coverImage}
                          alt={spotifyRelease.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* Spotify Embed */}
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
          /* Animated Background Orbs */
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

          /* Animations */
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
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
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

          /* Glow Ring */
          .glow-ring {
            background: conic-gradient(
              from 0deg,
              #8b5cf6,
              #06b6d4,
              #8b5cf6
            );
            animation: spin-slow 8s linear infinite;
            filter: blur(4px);
          }

          /* Glass Card */
          .glass-card {
            background: rgba(17, 24, 39, 0.7);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 1rem;
          }

          /* Gradient Text */
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

          /* Hover Lift */
          .hover-lift {
            transition: all 0.3s ease;
          }

          .hover-lift:hover {
            transform: translateY(-8px) scale(1.02);
            box-shadow: 0 20px 40px rgba(139, 92, 246, 0.3);
          }

          /* Play Button */
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

          /* Button Gradient */
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
        `}</style>
      </div>
    </>
  );
}

// Helper function to get social icons
function getSocialIcon(type: string) {
  const icons: { [key: string]: JSX.Element } = {
    instagram: (
      <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
    facebook: (
      <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    soundcloud: (
      <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full">
        <path d="M7 17.939h-1v-8.068c.308-.231.639-.429 1-.566v8.634zm3 0h1v-9.224c-.229.265-.443.548-.621.857l-.379-.184v8.551zm-2 0h1v-8.848c-.508-.079-.623-.05-1-.01v8.858zm-4 0h1v-7.02c-.312.458-.555.971-.692 1.535l-.308-.182v5.667zm-3-5.25c-.606.547-1 1.354-1 2.268 0 .914.394 1.721 1 2.268v-4.536zm18.879-.671c-.204-2.837-2.404-5.079-5.117-5.079-1.022 0-1.964.328-2.762.877v10.123h9.089c1.607 0 2.911-1.393 2.911-3.106 0-2.233-2.168-3.772-4.121-2.815zm-16.879-.027c-.302-.024-.526-.03-1 .122v5.689c.446.143.636.138 1 .138v-5.949z"/>
      </svg>
    ),
    spotify: (
      <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
      </svg>
    ),
    youtube: (
      <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
    website: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
  };

  return icons[type] || null;
}

// ==========================================
// SERVER-SIDE DATA FETCHING
// ==========================================

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const slug = params?.slug as string;

  const reservedSlugs = [
    'episodes',
    'admin',
    'track-of-the-week',
    'about',
    'api',
    'young-artists',
    '_next',
    'images',
    'favicon.ico',
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
          id,
          youtube_video_id,
          episode_number,
          title,
          clean_title,
          description,
          thumbnail_url,
          published_at,
          duration,
          view_count,
          is_special
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
    
    if (artist.spotify_artist_id) {
      try {
        // Fetch latest release
        spotifyRelease = await getArtistLatestRelease(artist.spotify_artist_id);
        
        // Fetch artist profile for image
        const spotifyProfile = await getArtistProfile(artist.spotify_artist_id);
        
        if (spotifyProfile?.image) {
          spotifyProfileImage = spotifyProfile.image;
        }
      } catch (error) {
        console.error('Failed to fetch Spotify data:', error);
      }
    }

    // Merge Spotify image with artist data (Spotify takes priority if available)
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
      },
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return { notFound: true };
  }
};

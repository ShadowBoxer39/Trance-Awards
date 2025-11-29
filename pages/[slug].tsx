// pages/[slug].tsx - STUNNING Artist Page with Next-Level Visual Effects
import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { createClient } from "@supabase/supabase-js";
import Navigation from "../components/Navigation";
import { getArtistProfile } from "../lib/spotify";
import { 
  FaInstagram, 
  FaFacebook, 
  FaSoundcloud, 
  FaSpotify, 
  FaYoutube, 
  FaGlobe,
  FaPlay,
  FaEye,
  FaMusic,
  FaRocket,
  FaStar,
  FaAward,
  FaTrophy,
  FaHeart
} from 'react-icons/fa';

// ==========================================
// TYPES
// ==========================================

interface Achievement {
  year: string;
  title: string;
  description: string;
  icon: string;
}

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
  soundcloud_profile_url: string | null;
  spotify_url: string | null;
  youtube_url: string | null;
  website_url: string | null;
  genre: string | null;
  total_episodes: number;
  spotify_artist_id: string | null;
  instagram_reels: string[];
  achievements: Achievement[];
  primary_color: string;
  secondary_color: string;
  hero_video_url: string | null;
}

interface Episode {
  id: number;
  youtube_video_id: string;
  episode_number: number | null;
  title: string;
  clean_title: string;
  thumbnail_url: string;
  published_at: string;
  view_count: number | null;
  role: string;
}

interface SpotifyProfile {
  followers: number;
  popularity: number;
  image: string;
}

interface ArtistPageProps {
  artist: Artist;
  episodes: Episode[];
  spotifyProfile: SpotifyProfile | null;
}

// ==========================================
// PARTICLE COMPONENT
// ==========================================

const MusicParticles = ({ primaryColor }: { primaryColor: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: any[] = [];
    const particleCount = 50;

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        this.opacity = Math.random() * 0.5 + 0.2;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = `rgba(147, 51, 234, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [primaryColor]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.3 }}
    />
  );
};

// ==========================================
// AUDIO VISUALIZER COMPONENT
// ==========================================

const AudioVisualizer = () => {
  const bars = Array.from({ length: 40 });

  return (
    <div className="flex items-end justify-center gap-1 h-20">
      {bars.map((_, i) => (
        <div
          key={i}
          className="visualizer-bar bg-gradient-to-t from-purple-600 to-cyan-400"
          style={{
            width: '4px',
            animationDelay: `${i * 0.05}s`,
            height: `${Math.random() * 60 + 20}%`
          }}
        />
      ))}
    </div>
  );
};

// ==========================================
// ANIMATED COUNTER
// ==========================================

const AnimatedCounter = ({ end, suffix = "" }: { end: number; suffix?: string }) => {
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

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;
    const duration = 2000;
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
  }, [isVisible, end]);

  return (
    <div ref={ref} className="text-4xl md:text-5xl font-bold gradient-text">
      {count.toLocaleString()}{suffix}
    </div>
  );
};

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function ArtistPage({ artist, episodes, spotifyProfile }: ArtistPageProps) {
  const displayName = artist.stage_name || artist.name;
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const heroOpacity = Math.max(0, 1 - scrollY / 500);
  const heroScale = 1 + scrollY / 5000;

  const socialLinks = [
    { icon: 'instagram', url: artist.instagram_url, label: 'Instagram', color: 'from-pink-500 to-purple-500', Component: FaInstagram },
    { icon: 'soundcloud', url: artist.soundcloud_url, label: 'SoundCloud', color: 'from-orange-500 to-red-500', Component: FaSoundcloud },
    { icon: 'spotify', url: artist.spotify_url, label: 'Spotify', color: 'from-green-500 to-emerald-500', Component: FaSpotify },
    { icon: 'youtube', url: artist.youtube_url, label: 'YouTube', color: 'from-red-500 to-pink-500', Component: FaYoutube },
    { icon: 'facebook', url: artist.facebook_url, label: 'Facebook', color: 'from-blue-500 to-cyan-500', Component: FaFacebook },
    { icon: 'website', url: artist.website_url, label: 'Website', color: 'from-purple-500 to-pink-500', Component: FaGlobe },
  ].filter(link => link.url);

  const getAchievementIcon = (iconName: string) => {
    const icons: any = {
      music: FaMusic,
      rocket: FaRocket,
      star: FaStar,
      award: FaAward,
      trophy: FaTrophy,
      heart: FaHeart
    };
    return icons[iconName] || FaStar;
  };

  return (
    <>
      <Head>
        <title>{displayName} - יוצאים לטראק</title>
        <meta name="description" content={artist.bio || `כל הפרקים עם ${displayName}`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/images/logo.png" />
      </Head>

      <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
        {/* Navigation */}
        <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
          <Navigation currentPage="episodes" />
        </div>

        {/* Particles */}
        <MusicParticles primaryColor={artist.primary_color} />

        {/* Animated Gradient Background */}
        <div className="fixed inset-0 opacity-30 z-0">
          <div className="gradient-mesh" />
        </div>

        {/* Mouse Follower */}
        <div
          className="mouse-follower"
          style={{
            left: mousePos.x,
            top: mousePos.y,
          }}
        />

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Hero Background */}
          <div
            className="absolute inset-0 z-0"
            style={{
              opacity: heroOpacity,
              transform: `scale(${heroScale})`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-purple-900/50 via-black/80 to-black z-10" />
            {artist.profile_photo_url && (
              <img
                src={artist.profile_photo_url}
                alt={displayName}
                className="w-full h-full object-cover blur-3xl"
              />
            )}
          </div>

          {/* Hero Content */}
          <div className="relative z-20 text-center max-w-6xl mx-auto px-6 py-20">
            {/* Profile Photo with 3D Effect */}
            <div className="mb-8 inline-block perspective-1000">
              <div className="profile-card-3d">
                <div className="relative w-48 h-48 md:w-64 md:h-64 mx-auto">
                  <div className="absolute inset-0 rounded-full glow-ring-advanced" />
                  <div className="absolute inset-2 rounded-full overflow-hidden border-4 border-cyan-400/50 shadow-2xl">
                    {artist.profile_photo_url ? (
                      <img
                        src={artist.profile_photo_url}
                        alt={displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center">
                        <span className="text-8xl font-bold">{displayName[0]}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Name with Glitch Effect */}
            <h1 className="text-6xl md:text-8xl font-black mb-6 glitch-text" data-text={displayName}>
              {displayName}
            </h1>

            {/* Genre Badge */}
            {artist.genre && (
              <div className="mb-8 animate-fade-in-up delay-100">
                <span className="neon-badge">
                  {artist.genre}
                </span>
              </div>
            )}

            {/* Audio Visualizer */}
            <div className="mb-8">
              <AudioVisualizer />
            </div>

            {/* Bio */}
            {artist.bio && (
              <p className="text-gray-300 text-lg md:text-2xl max-w-4xl mx-auto mb-12 leading-relaxed animate-fade-in-up delay-200">
                {artist.bio}
              </p>
            )}

            {/* Scroll Indicator */}
            <div className="scroll-indicator-advanced">
              <div className="scroll-line" />
              <div className="scroll-text">Scroll to explore</div>
            </div>
          </div>
        </section>

        {/* Stats Bar with Particles */}
        {spotifyProfile && (
          <section className="relative py-20 px-6">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="stat-card-3d group">
                  <div className="stat-glow" />
                  <div className="text-center p-8">
                    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                      👥
                    </div>
                    <AnimatedCounter end={spotifyProfile.followers} />
                    <div className="text-gray-400 mt-2 text-lg">Spotify Followers</div>
                  </div>
                </div>

                <div className="stat-card-3d group">
                  <div className="stat-glow" />
                  <div className="text-center p-8">
                    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                      🔥
                    </div>
                    <AnimatedCounter end={spotifyProfile.popularity} suffix="%" />
                    <div className="text-gray-400 mt-2 text-lg">Popularity Score</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Achievements Timeline */}
        {artist.achievements && artist.achievements.length > 0 && (
          <section className="relative py-20 px-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-5xl md:text-6xl font-black mb-16 text-center">
                <span className="gradient-text-animated">Career Highlights</span>
              </h2>

              <div className="timeline">
                {artist.achievements.map((achievement, index) => {
                  const Icon = getAchievementIcon(achievement.icon);
                  return (
                    <div
                      key={index}
                      className="timeline-item"
                      style={{ animationDelay: `${index * 0.2}s` }}
                    >
                      <div className="timeline-dot">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="timeline-content">
                        <div className="timeline-year">{achievement.year}</div>
                        <h3 className="text-2xl font-bold mb-2 text-white">{achievement.title}</h3>
                        <p className="text-gray-400">{achievement.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Episode Showcase with 3D Card */}
        {episodes.length > 0 && (
          <section className="relative py-20 px-6">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-5xl md:text-6xl font-black mb-16 text-center gradient-text">
                פרק עם {displayName}
              </h2>

              <div className="max-w-5xl mx-auto">
                <div className="episode-card-3d group">
                  <div className="episode-glow" />
                  <div className="grid md:grid-cols-2 gap-8 p-8">
                    {/* Thumbnail */}
                    <div className="relative aspect-video rounded-2xl overflow-hidden">
                      <img
                        src={episodes[0].thumbnail_url}
                        alt={episodes[0].title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="play-button-3d">
                          <FaPlay className="text-white text-3xl ml-2" />
                        </div>
                      </div>
                      {episodes[0].episode_number && (
                        <div className="absolute top-4 right-4 episode-badge">
                          #{episodes[0].episode_number}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex flex-col justify-center">
                      <h3 className="text-3xl md:text-4xl font-black mb-4 text-white leading-tight">
                        {episodes[0].clean_title || episodes[0].title}
                      </h3>
                      <div className="flex items-center gap-4 text-gray-400 mb-6 text-lg">
                        <span>{new Date(episodes[0].published_at).toLocaleDateString('he-IL')}</span>
                        {episodes[0].view_count && (
                          <>
                            <span>•</span>
                            <div className="flex items-center gap-2">
                              <FaEye />
                              <span>{episodes[0].view_count.toLocaleString()}</span>
                            </div>
                          </>
                        )}
                      </div>
                      <a
                        href={`https://www.youtube.com/watch?v=${episodes[0].youtube_video_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-3d group/btn"
                      >
                        <span className="relative z-10 flex items-center justify-center gap-3">
                          <FaPlay className="text-xl transition-transform group-hover/btn:scale-110" />
                          <span className="text-xl font-bold">צפה בפרק המלא</span>
                        </span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Instagram Reels */}
        {artist.instagram_reels && artist.instagram_reels.length > 0 && (
          <section className="relative py-20 px-6">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-5xl md:text-6xl font-black mb-16 text-center flex items-center justify-center gap-4">
                <FaInstagram className="text-pink-500" />
                <span className="gradient-text">Instagram Reels</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {artist.instagram_reels.map((reelUrl, index) => (
                  <div key={index} className="reel-card group">
                    <div className="reel-glow" />
                    <iframe
                      src={`${reelUrl}embed`}
                      className="w-full h-[600px] rounded-2xl"
                      frameBorder="0"
                      scrolling="no"
                      allowTransparency={true}
                      allow="encrypted-media"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* SoundCloud Player */}
        {artist.soundcloud_profile_url && (
          <section className="relative py-20 px-6">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-5xl md:text-6xl font-black mb-16 text-center flex items-center justify-center gap-4">
                <FaSoundcloud className="text-orange-500" />
                <span className="gradient-text">Latest Tracks</span>
              </h2>

              <div className="soundcloud-card">
                <div className="soundcloud-glow" />
                <iframe
                  width="100%"
                  height="450"
                  scrolling="no"
                  frameBorder="no"
                  allow="autoplay"
                  src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(artist.soundcloud_profile_url)}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true`}
                  className="rounded-2xl"
                />
              </div>
            </div>
          </section>
        )}

        {/* Social Hub */}
        {socialLinks.length > 0 && (
          <section className="relative py-20 px-6">
            <div className="max-w-6xl mx-auto text-center">
              <h2 className="text-5xl md:text-6xl font-black mb-16 gradient-text">
                התחבר עם {displayName}
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-card-3d group"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className={`social-glow bg-gradient-to-br ${link.color}`} />
                    <div className="relative z-10 p-8 flex flex-col items-center gap-4">
                      <link.Component className="text-6xl transition-transform duration-500 group-hover:scale-125 group-hover:rotate-12" />
                      <span className="font-bold text-xl">{link.label}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Back Link */}
        <section className="py-12 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <Link href="/episodes">
              <span className="back-link group cursor-pointer">
                <span className="relative z-10">← חזרה לכל הפרקים</span>
              </span>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 mt-16 bg-black/50 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-gray-400">© 2025 יוצאים לטראק</div>
              <div className="flex gap-8 text-gray-400">
                <Link href="/" className="hover:text-white transition">בית</Link>
                <Link href="/episodes" className="hover:text-white transition">פרקים</Link>
                <Link href="/track-of-the-week" className="hover:text-white transition">טראק השבוע</Link>
              </div>
            </div>
          </div>
        </footer>

        {/* Styles - Part 1 */}
        <style jsx>{`
          /* ===== GRADIENT MESH ===== */
          .gradient-mesh {
            position: absolute;
            inset: 0;
            background: 
              radial-gradient(circle at 20% 50%, rgba(147, 51, 234, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 30%, rgba(6, 182, 212, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 40% 80%, rgba(236, 72, 153, 0.2) 0%, transparent 50%);
            animation: gradient-shift 15s ease infinite;
          }

          @keyframes gradient-shift {
            0%, 100% { transform: translate(0, 0) scale(1); }
            25% { transform: translate(10%, 5%) scale(1.1); }
            50% { transform: translate(-5%, -10%) scale(1.05); }
            75% { transform: translate(-10%, 5%) scale(1.1); }
          }

          /* ===== MOUSE FOLLOWER ===== */
          .mouse-follower {
            position: fixed;
            width: 300px;
            height: 300px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(147, 51, 234, 0.15) 0%, transparent 70%);
            pointer-events: none;
            transform: translate(-50%, -50%);
            transition: opacity 0.3s;
            z-index: 1;
          }

          /* ===== GLITCH TEXT ===== */
          .glitch-text {
            position: relative;
            background: linear-gradient(90deg, #06b6d4, #8b5cf6, #06b6d4);
            background-size: 200% 100%;
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: gradient-slide 3s ease infinite;
          }

          @keyframes gradient-slide {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }

          /* ===== NEON BADGE ===== */
          .neon-badge {
            display: inline-block;
            padding: 0.75rem 2rem;
            background: rgba(139, 92, 246, 0.1);
            border: 2px solid #8b5cf6;
            border-radius: 9999px;
            color: #a78bfa;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            box-shadow: 
              0 0 20px rgba(139, 92, 246, 0.5),
              inset 0 0 20px rgba(139, 92, 246, 0.1);
            animation: neon-pulse 2s ease-in-out infinite;
          }

          @keyframes neon-pulse {
            0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.5), inset 0 0 20px rgba(139, 92, 246, 0.1); }
            50% { box-shadow: 0 0 30px rgba(139, 92, 246, 0.8), inset 0 0 30px rgba(139, 92, 246, 0.2); }
          }

          /* ===== VISUALIZER BARS ===== */
          .visualizer-bar {
            border-radius: 4px 4px 0 0;
            animation: visualizer-bounce 0.8s ease-in-out infinite;
          }

          @keyframes visualizer-bounce {
            0%, 100% { transform: scaleY(0.3); }
            50% { transform: scaleY(1); }
          }

          /* ===== SCROLL INDICATOR ===== */
          .scroll-indicator-advanced {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
            animation: scroll-bob 2s ease-in-out infinite;
          }

          .scroll-line {
            width: 2px;
            height: 60px;
            background: linear-gradient(to bottom, #06b6d4, transparent);
          }

          .scroll-text {
            color: #06b6d4;
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
          }

          @keyframes scroll-bob {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(15px); }
          }

          /* ===== 3D PROFILE CARD ===== */
          .profile-card-3d {
            animation: float-slow 6s ease-in-out infinite;
          }

          @keyframes float-slow {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
          }

          .glow-ring-advanced {
            background: conic-gradient(from 0deg, #8b5cf6, #06b6d4, #ec4899, #8b5cf6);
            animation: spin-slow 10s linear infinite;
            filter: blur(8px);
          }

          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          /* ===== STAT CARDS ===== */
          .stat-card-3d {
            position: relative;
            background: rgba(17, 24, 39, 0.6);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 1.5rem;
            overflow: hidden;
            transform-style: preserve-3d;
            transition: all 0.5s cubic-bezier(0.23, 1, 0.320, 1);
          }

          .stat-card-3d:hover {
            transform: translateY(-10px) rotateX(5deg);
            border-color: rgba(139, 92, 246, 0.5);
          }

          .stat-glow {
            position: absolute;
            inset: 0;
            background: radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.2), transparent 70%);
            opacity: 0;
            transition: opacity 0.5s;
          }

          .stat-card-3d:hover .stat-glow {
            opacity: 1;
          }

          /* ===== TIMELINE ===== */
          .timeline {
            position: relative;
            padding-left: 2rem;
          }

          .timeline::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 2px;
            background: linear-gradient(to bottom, #8b5cf6, #06b6d4, #ec4899);
          }

          .timeline-item {
            position: relative;
            padding-bottom: 3rem;
            animation: fade-slide-up 0.8s ease-out backwards;
          }

          .timeline-dot {
            position: absolute;
            left: -2.75rem;
            top: 0;
            width: 3rem;
            height: 3rem;
            background: linear-gradient(135deg, #8b5cf6, #06b6d4);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-center;
            color: white;
            box-shadow: 0 0 20px rgba(139, 92, 246, 0.5);
            animation: pulse-ring 2s ease-in-out infinite;
          }

          @keyframes pulse-ring {
            0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.5); }
            50% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.8); }
          }

          .timeline-content {
            background: rgba(17, 24, 39, 0.6);
            backdrop-filter: blur(20px);
            padding: 1.5rem;
            border-radius: 1rem;
            border: 1px solid rgba(255, 255, 255, 0.1);
            margin-left: 2rem;
            transition: all 0.3s;
          }

          .timeline-content:hover {
            transform: translateX(10px);
            border-color: rgba(139, 92, 246, 0.5);
          }

          .timeline-year {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            background: linear-gradient(135deg, #8b5cf6, #06b6d4);
            border-radius: 9999px;
            font-size: 0.875rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
          }

          @keyframes fade-slide-up {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          /* ===== EPISODE CARD ===== */
          .episode-card-3d {
            position: relative;
            background: rgba(17, 24, 39, 0.8);
            backdrop-filter: blur(30px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 2rem;
            overflow: hidden;
            transition: all 0.5s cubic-bezier(0.23, 1, 0.320, 1);
          }

          .episode-card-3d:hover {
            transform: translateY(-15px);
            box-shadow: 0 30px 60px rgba(139, 92, 246, 0.3);
            border-color: rgba(139, 92, 246, 0.5);
          }

          .episode-glow {
            position: absolute;
            inset: -100%;
            background: radial-gradient(circle, rgba(139, 92, 246, 0.3), transparent 70%);
            opacity: 0;
            transition: opacity 0.5s;
          }

          .episode-card-3d:hover .episode-glow {
            opacity: 1;
            animation: glow-rotate 8s linear infinite;
          }

          @keyframes glow-rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          .episode-badge {
            background: linear-gradient(135deg, #8b5cf6, #06b6d4);
            padding: 0.5rem 1rem;
            border-radius: 9999px;
            font-weight: 700;
            font-size: 1.125rem;
            box-shadow: 0 0 20px rgba(139, 92, 246, 0.5);
          }

          .play-button-3d {
            width: 6rem;
            height: 6rem;
            background: linear-gradient(135deg, #8b5cf6, #06b6d4);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-center;
            box-shadow: 0 10px 30px rgba(139, 92, 246, 0.5);
            transition: all 0.3s;
            animation: pulse-grow 2s ease-in-out infinite;
          }

          .play-button-3d:hover {
            transform: scale(1.1);
            box-shadow: 0 15px 40px rgba(139, 92, 246, 0.7);
          }

          @keyframes pulse-grow {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }

          .btn-3d {
            position: relative;
            display: inline-block;
            padding: 1rem 3rem;
            background: linear-gradient(135deg, #8b5cf6, #06b6d4);
            border-radius: 9999px;
            font-weight: 700;
            overflow: hidden;
            transition: all 0.3s;
            box-shadow: 0 10px 30px rgba(139, 92, 246, 0.4);
          }

          .btn-3d:before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, #06b6d4, #8b5cf6);
            opacity: 0;
            transition: opacity 0.3s;
          }

          .btn-3d:hover:before {
            opacity: 1;
          }

          .btn-3d:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 40px rgba(139, 92, 246, 0.6);
          }

          /* ===== REEL CARDS ===== */
          .reel-card {
            position: relative;
            border-radius: 1.5rem;
            overflow: hidden;
            transition: transform 0.5s;
          }

          .reel-card:hover {
            transform: translateY(-10px) rotateZ(2deg);
          }

          .reel-glow {
            position: absolute;
            inset: -50%;
            background: radial-gradient(circle, rgba(236, 72, 153, 0.3), transparent);
            opacity: 0;
            transition: opacity 0.5s;
          }

          .reel-card:hover .reel-glow {
            opacity: 1;
            animation: glow-pulse 2s ease-in-out infinite;
          }

          @keyframes glow-pulse {
            0%, 100% { transform: scale(1); opacity: 0.3; }
            50% { transform: scale(1.2); opacity: 0.6; }
          }

          /* ===== SOUNDCLOUD CARD ===== */
          .soundcloud-card {
            position: relative;
            background: rgba(17, 24, 39, 0.6);
            backdrop-filter: blur(20px);
            padding: 2rem;
            border-radius: 2rem;
            border: 1px solid rgba(255, 255, 255, 0.1);
            overflow: hidden;
          }

          .soundcloud-glow {
            position: absolute;
            inset: -100%;
            background: radial-gradient(circle, rgba(255, 85, 0, 0.2), transparent 70%);
            animation: glow-rotate 10s linear infinite;
          }

          /* ===== SOCIAL CARDS ===== */
          .social-card-3d {
            position: relative;
            background: rgba(17, 24, 39, 0.8);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 1.5rem;
            overflow: hidden;
            transition: all 0.5s cubic-bezier(0.23, 1, 0.320, 1);
            animation: fade-slide-up 0.6s ease-out backwards;
          }

          .social-card-3d:hover {
            transform: translateY(-10px) scale(1.05);
            border-color: rgba(255, 255, 255, 0.3);
          }

          .social-glow {
            position: absolute;
            inset: 0;
            opacity: 0;
            transition: opacity 0.5s;
          }

          .social-card-3d:hover .social-glow {
            opacity: 0.2;
          }

          /* ===== BACK LINK ===== */
          .back-link {
            display: inline-block;
            padding: 1rem 2rem;
            background: rgba(17, 24, 39, 0.6);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 9999px;
            font-weight: 600;
            transition: all 0.3s;
          }

          .back-link:hover {
            background: rgba(139, 92, 246, 0.2);
            border-color: rgba(139, 92, 246, 0.5);
            transform: translateX(-5px);
          }

          /* ===== UTILITY ===== */
          .gradient-text {
            background: linear-gradient(90deg, #06b6d4, #8b5cf6, #06b6d4);
            background-size: 200% 100%;
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: gradient-slide 3s ease infinite;
          }

          .gradient-text-animated {
            background: linear-gradient(90deg, #06b6d4, #8b5cf6, #ec4899, #8b5cf6, #06b6d4);
            background-size: 300% 100%;
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: gradient-slide 5s ease infinite;
          }

          .animate-fade-in-up {
            animation: fade-slide-up 0.8s ease-out;
          }

          .delay-100 { animation-delay: 0.1s; }
          .delay-200 { animation-delay: 0.2s; }
          .delay-300 { animation-delay: 0.3s; }

          .perspective-1000 {
            perspective: 1000px;
          }
        `}</style>
      </div>
    </>
  );
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

    // Fetch episodes
    const { data: episodesData } = await supabase
      .from('artist_episodes')
      .select(`
        role,
        episode_id,
        episodes (
          id, youtube_video_id, episode_number, title, clean_title,
          thumbnail_url, published_at, view_count
        )
      `)
      .eq('artist_id', artist.id)
      .order('episode_id', { ascending: false })
      .limit(1);

    const episodes = (episodesData || []).map((item: any) => ({
      ...item.episodes,
      role: item.role,
    }));

    // Fetch Spotify profile
    let spotifyProfile = null;
    let spotifyProfileImage = null;

    if (artist.spotify_artist_id) {
      try {
        const profile = await getArtistProfile(artist.spotify_artist_id);
        if (profile) {
          spotifyProfile = {
            followers: profile.followers,
            popularity: profile.popularity,
            image: profile.image,
          };
          spotifyProfileImage = profile.image;
        }
      } catch (error) {
        console.error('Failed to fetch Spotify profile:', error);
      }
    }

    const artistWithImage = {
      ...artist,
      profile_photo_url: spotifyProfileImage || artist.profile_photo_url,
      achievements: artist.achievements || [],
      instagram_reels: artist.instagram_reels || [],
    };

    return {
      props: {
        artist: artistWithImage,
        episodes,
        spotifyProfile,
      },
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return { notFound: true };
  }
};

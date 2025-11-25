// pages/index.tsx - FIXED WITH MOBILE CORRECTIONS
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import Navigation from "../components/Navigation";
import { default as episodeApiHandler } from "./api/episodes";

interface Episode {
  id: number;
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  channelTitle: string;
}

// NEW: Track of the Week interface
interface TrackOfWeek {
  id: number;
  name: string;
  photo_url: string | null;
  track_title: string;
  youtube_url: string;
  description: string;
  created_at: string;
}

// Helper to extract YouTube video ID
function getYouTubeId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// --- Inline Component for Counting Stats ---
function CountUpStat({ target, suffix = '', label }: { target: number, suffix?: string, label: string }) {
  const [count, setCount] = useState(0);
  const duration = 1500;
  const step = target / (duration / 30); 

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const newValue = Math.min(target, 0 + step * (progress / 30));
      
      setCount(Math.floor(newValue));

      if (progress < duration) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(animationFrame);
  }, [target]);

  return (
    <div>
      <div className="text-4xl md:text-5xl font-semibold text-gradient mb-1">
        {count.toLocaleString('en-US')}{suffix}
      </div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}

// --- Rotating Comments Component ---
function FeaturedArtistComments() {
  const [comments, setComments] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch comments from the API
    const fetchComments = async () => {
      try {
        const response = await fetch('/api/artist-comments-public?artistId=kanok');
        if (response.ok) {
          const data = await response.json();
          setComments(data.comments || []);
        }
      } catch (error) {
        console.error('Failed to fetch comments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, []);

  useEffect(() => {
    if (comments.length === 0) return;

    // Rotate comments every 5 seconds
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % comments.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [comments.length]);

  if (isLoading) {
    return (
      <div className="bg-black/30 rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-3/4 mb-2" />
        <div className="h-4 bg-gray-700 rounded w-1/2" />
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="bg-black/30 rounded-lg p-4 border-2 border-purple-500/30">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">💬</span>
          <h4 className="text-sm font-semibold text-purple-400">מה הקהילה אומרת?</h4>
        </div>
        <p className="text-gray-400 text-sm">
          היו הראשונים להגיב על האמן!
        </p>
      </div>
    );
  }

  const currentComment = comments[currentIndex];

  return (
    <div className="relative">
      <div className="bg-black/30 rounded-lg p-4 border-2 border-purple-500/30 min-h-[100px]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">💬</span>
            <h4 className="text-sm font-semibold text-purple-400">מה הקהילה אומרת?</h4>
          </div>
          <div className="text-xs text-gray-500">
            {currentIndex + 1} / {comments.length}
          </div>
        </div>
        
        <div className="transition-opacity duration-500">
          <p className="text-gray-300 text-sm leading-relaxed mb-2">
            "{currentComment.text}"
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-purple-400 font-medium">
              — {currentComment.name}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(currentComment.timestamp).toLocaleDateString('he-IL')}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Dots */}
      {comments.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {comments.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentIndex
                  ? 'w-6 bg-purple-500'
                  : 'w-1.5 bg-gray-600 hover:bg-gray-500'
              }`}
              aria-label={`Comment ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// --- Track of the Week Rotating Comments Component ---
function TrackOfWeekComments({ trackId }: { trackId: number }) {
  const [comments, setComments] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch comments from the API
    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/track-comment?trackId=${trackId}`);
        if (response.ok) {
          const data = await response.json();
          setComments(data.comments || []);
        }
      } catch (error) {
        console.error('Failed to fetch track comments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [trackId]);

  useEffect(() => {
    if (comments.length === 0) return;

    // Rotate comments every 5 seconds
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % comments.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [comments.length]);

  if (isLoading) {
    return (
      <div className="bg-black/30 rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-3/4 mb-2" />
        <div className="h-4 bg-gray-700 rounded w-1/2" />
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="bg-black/30 rounded-lg p-4 border-2 border-green-500/30">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">💬</span>
          <h4 className="text-sm font-semibold text-green-400">מה הקהילה אומרת?</h4>
        </div>
        <p className="text-gray-400 text-sm">
          היו הראשונים להגיב על הטראק!
        </p>
      </div>
    );
  }

  const currentComment = comments[currentIndex];

  return (
    <div className="relative">
      <div className="bg-black/30 rounded-lg p-4 border-2 border-green-500/30 min-h-[100px]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">💬</span>
            <h4 className="text-sm font-semibold text-green-400">מה הקהילה אומרת?</h4>
          </div>
          <div className="text-xs text-gray-500">
            {currentIndex + 1} / {comments.length}
          </div>
        </div>
        
        <div className="transition-opacity duration-500">
          <p className="text-gray-300 text-sm leading-relaxed mb-2">
            "{currentComment.text}"
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-green-400 font-medium">
              — {currentComment.name}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(currentComment.timestamp).toLocaleDateString('he-IL')}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Dots */}
      {comments.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {comments.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentIndex
                  ? 'w-6 bg-green-500'
                  : 'w-1.5 bg-gray-600 hover:bg-gray-500'
              }`}
              aria-label={`Comment ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Home({ 
  episodes, 
  episodesError,
  trackOfWeek 
}: { 
  episodes: Episode[], 
  episodesError: string | null,
  trackOfWeek: TrackOfWeek | null 
}) {
  
  React.useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
  }, []);

  const latestEpisode = episodes.length > 0 ? episodes[episodes.length - 1] : null;
  const previousEpisodes = episodes.length > 1
    ? episodes.slice(Math.max(episodes.length - 4, 0), episodes.length - 1).reverse()
    : [];
      
  const episodesLoading = false; 

  return (
    <>
      <SEO
        title="בית"
        description="יוצאים לטראק - תכנית הטראנס הגדולה בישראל. נותנים כבוד לאגדות, מקדמים את הצעירים."
        url="https://yourdomain.com"
      />
      <Head>
        <title>יוצאים לטראק - תכנית הטראנס של ישראל</title>
        <meta name="description" content="יוצאים לטראק - תכנית הטראנס הגדולה בישראל" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/images/logo.png" />
      </Head>

      <div className="trance-backdrop min-h-screen text-gray-100">
        <Navigation currentPage="home" />

        {/* HERO - REDESIGNED */}
        <header className="relative overflow-hidden">
          {/* Animated Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-cyan-900/20 to-pink-900/20 animate-gradient" />
          
          {/* Floating Orbs */}
          <div className="absolute top-20 right-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-float-delayed" />
          
          <div className="max-w-7xl mx-auto px-6 pt-20 pb-16 relative z-10">
            <div className="text-center max-w-5xl mx-auto">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 mb-6 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                </span>
                <span className="text-sm font-medium text-purple-300 tracking-wide">תכנית הטראנס מספר 1 בישראל</span>
              </div>

              {/* Main Title with Gradient */}
              <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent animate-gradient-x">
                  יוצאים לטראק
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-xl md:text-3xl text-gray-300 mb-4 font-light leading-relaxed max-w-3xl mx-auto">
                עושים כבוד לאגדות, נותנים במה לצעירים
              </p>
              <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
                ועוזרים לקהילת הטראנס בישראל לצמוח
              </p>

              {/* CTA Buttons */}
           

<div className="flex flex-wrap gap-4 justify-center mb-16">
  {/* Primary Button: Listen to Episodes */}
  <Link 
    href="/episodes" 
    // Increased padding (px-10 py-4) and added justify-center for consistent alignment
    className="group relative px-10 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl font-bold text-lg text-white shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/70 transition-all duration-300 hover:scale-105 flex items-center justify-center min-w-[200px]"
  >
    <span className="relative z-10 flex items-center gap-2">
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
      </svg>
      האזינו לפרקים
    </span>
    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 blur opacity-50 group-hover:opacity-75 transition-opacity" />
  </Link>
  
  {/* Secondary Button: Young Artists */}
  <Link 
    href="/young-artists" 
    // Increased padding (px-10 py-4) to match primary button
    className="px-10 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl font-bold text-lg text-white hover:bg-white/20 transition-all duration-300 hover:scale-105 flex items-center gap-2 justify-center min-w-[200px]"
  >
    <span className="text-2xl">🌟</span>
    אמנים צעירים
  </Link>
</div>

            {/* Stats - MOBILE FIXED: Added smaller padding and responsive text sizing */}
              <div className="grid grid-cols-3 gap-3 md:gap-6 max-w-3xl mx-auto">
                {/* FIXED: Reduced padding on mobile (p-3 sm:p-4 md:p-6), smaller text on mobile */}
                <div className="glass-card rounded-2xl p-3 sm:p-4 md:p-6 hover:scale-105 transition-transform">
                  {/* FIXED: Smaller text on mobile - text-3xl sm:text-4xl md:text-5xl */}
                  <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-br from-purple-400 to-pink-400 bg-clip-text text-transparent mb-1 break-words">
                    <CountUpStat target={50} suffix="+" label="" />
                  </div>
                  <p className="text-xs sm:text-sm text-gray-400 font-medium">פרקים</p>
                </div>
                
                <div className="glass-card rounded-2xl p-3 sm:p-4 md:p-6 hover:scale-105 transition-transform">
                  <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-br from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-1 break-words">
                    <CountUpStat target={200} suffix="+" label="" />
                  </div>
                  <p className="text-xs sm:text-sm text-gray-400 font-medium">שעות תוכן</p>
                </div>
                
                <div className="glass-card rounded-2xl p-3 sm:p-4 md:p-6 hover:scale-105 transition-transform">
                  <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-br from-pink-400 to-purple-400 bg-clip-text text-transparent mb-1 break-words">
                    <CountUpStat target={40} suffix="+" label="" />
                  </div>
                  <p className="text-xs sm:text-sm text-gray-400 font-medium">אמנים צעירים</p>
                </div>
              </div>

              {/* Music Room Partner Card - PROMINENT */}
              <div className="mt-16 max-w-2xl mx-auto">
                <div className="glass-card rounded-2xl p-8 border-2 border-purple-500/40 hover:border-purple-500/70 transition-all shadow-xl shadow-purple-500/20">
                  <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-right">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-2xl ring-4 ring-purple-500/30">
                      <Image 
                        src="/images/musikroom.png" 
                        alt="Music Room Studio" 
                        width={140} 
                        height={140} 
                        className="object-contain" 
                        priority 
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-3 flex items-center justify-center md:justify-start gap-2">
                        <span className="text-3xl">🎙️</span>
                        שותפים בהפקה
                      </h3>
                      <p className="text-gray-300 text-base leading-relaxed mb-4">
                        התכנית מוקלטת באולפני <span className="font-bold text-purple-400">המיוזיק רום</span> – אולפן פודקאסטים ייחודי ומרחב יצירתי ל־DJs להפקות וידאו מקצועיות.
                      </p>
                      <a 
                        href="https://www.facebook.com/p/MusikRoom-61568565972669/" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-2 text-sm font-semibold text-purple-300 hover:text-purple-200 underline-offset-4 hover:underline transition"
                      >
                        לאתר המיוזיק רום
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Wave */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 120" className="w-full h-20 fill-current text-gray-900/50">
              <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" />
            </svg>
          </div>
        </header>

        {/* Latest Episode */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-semibold mb-6">הפרק האחרון</h2>

          {episodesLoading ? (
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="aspect-video bg-gray-900 animate-pulse" />
              <div className="p-6">
                <div className="h-6 bg-gray-800 rounded mb-3" />
                <div className="h-4 bg-gray-800 rounded mb-2" />
                <div className="h-4 bg-gray-800 rounded w-2/3" />
              </div>
            </div>
          ) : episodesError ? (
            <div className="glass-card rounded-xl p-6 text-center text-gray-300">
              <p className="mb-4">לא הצלחנו לטעון את הפרק האחרון. {episodesError}</p>
              <button onClick={() => window.location.reload()} className="btn-primary px-6 py-3 rounded-lg font-medium">
                נסה שוב
              </button>
            </div>
          ) : latestEpisode ? (
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="aspect-video bg-gray-900">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${latestEpisode.videoId}`}
                  title={latestEpisode.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{latestEpisode.title}</h3>
                <p className="text-gray-400 mb-4 text-sm leading-relaxed line-clamp-3">
                  {latestEpisode.description || "הפרק החדש ביותר של הפודקאסט - מוזיקה טובה, ווייבים טובים."}
                </p>
                <div className="flex flex-wrap gap-3">
                  <a href={`https://www.youtube.com/watch?v=${latestEpisode.videoId}`} target="_blank" rel="noopener noreferrer" className="btn-secondary px-4 py-2 rounded-lg text-sm font-medium">
                    YouTube
                  </a>
                  <a href="https://open.spotify.com/show/0LGP2n3IGqeFVv1fIZOkeZ" target="_blank" rel="noopener noreferrer" className="btn-secondary px-4 py-2 rounded-lg text-sm font-medium">
                    Spotify
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-400">אין פרקים להצגה כרגע.</p>
          )}
        </section>

        {/* REMOVED: Duplicate mobile-only MusikRoom section (lines 308-323) */}
        {/* This section was causing the duplicate appearance on mobile */}

        {/* Featured Young Artist */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="glass-card rounded-xl p-8 md:p-10 border-2 border-purple-500/30">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🌟</span>
                <h2 className="text-2xl md:text-3xl font-semibold text-gradient">
                  האמן שאתם צריכים להכיר
                </h2>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div className="w-full">
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-900">
                  <img src="/images/kanok.png" alt="Featured Artist" className="w-full h-full object-cover" />
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-2xl font-semibold mb-2">טל רנדליך (Kanok)</h3>
                  <p className="text-gray-400 leading-relaxed">
                  טל קאנוק הוא אמן שכשאתה שומע אותו אתה מרגיש שהוא פורט לך על מיתרי הרגש.
                    יש משהו בצלילים שהוא מייצר שמצליח ללטף אותך ולגרום לך להרגיש שאתה בידיים טובות.
                    לכו תשמעו את המוזיקה שלו, אתם לא תצטערו.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-3">הטראק המוצג</h4>
                  <div className="rounded-lg overflow-hidden">
                    <iframe width="100%" height="166" scrolling="no" style={{ border: 'none' }} allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/kanok_music/kanok-light-beam&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=false"></iframe>         
                  </div>
                </div>

                {/* NEW: Rotating Comments Section */}
                <FeaturedArtistComments />

                <div>
                  <h4 className="text-sm font-semibold mb-3 text-gray-400">עקבו אחריו</h4>
                  <div className="flex flex-wrap gap-3">
                    <a href="https://www.instagram.com/kanok_music/" target="_blank" rel="noopener noreferrer" className="btn-secondary px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                      Instagram
                    </a>
                    <a href="https://soundcloud.com/kanok_music" target="_blank" rel="noopener noreferrer" className="btn-secondary px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                      SoundCloud
                    </a>
                    <a href="https://open.spotify.com/artist/3gayXKIE0S2wgeaSigcwIC?si=MOMSUPgpS6mjB8T2Qu8dww" target="_blank" rel="noopener noreferrer" className="btn-secondary px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
                      Spotify
                    </a>
                  </div>
                </div>

                <div className="pt-2">
                  <Link href="/featured-artist" className="btn-primary px-6 py-3 rounded-lg font-medium inline-block">
                    עוד פרטים והגיבו ←
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* *** Track of the Week Section - FIXED *** */}
        <section className="max-w-7xl mx-auto px-6 pb-16">
          <div className="glass-card rounded-xl p-8 md:p-10 border-2 border-green-500/30">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="text-3xl">💬</span>
              <h2 className="text-2xl md:text-3xl font-semibold text-white">
                הטראק השבועי של הקהילה
              </h2>
            </div>

            {trackOfWeek ? (
              <div className="grid md:grid-cols-2 gap-6 items-start">
                {/* Left: YouTube Player */}
                <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${getYouTubeId(trackOfWeek.youtube_url)}`}
                    title={trackOfWeek.track_title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>

                {/* Right: Submitter Info */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-4">
                    {/* Profile Photo */}
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-green-500/50 bg-gray-700 flex-shrink-0">
                      {trackOfWeek.photo_url ? (
                        <img
                          src={trackOfWeek.photo_url}
                          alt={trackOfWeek.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // If image fails to load, show emoji instead
                            e.currentTarget.style.display = 'none';
                            if (e.currentTarget.nextElementSibling) {
                              (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      <div 
                        className="w-full h-full flex items-center justify-center text-3xl text-gray-500"
                        style={{ display: trackOfWeek.photo_url ? 'none' : 'flex' }}
                      >
                        👤
                      </div>
                    </div>

                    {/* Name & Title */}
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">
                        {trackOfWeek.track_title}
                      </h3>
                      <p className="text-green-400 font-medium">
                        {trackOfWeek.name}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="bg-black/30 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-2">למה הטראק הזה?</p>
                    <p className="text-gray-300 leading-relaxed">
                      {trackOfWeek.description}
                    </p>
                  </div>

                  {/* NEW: Rotating Comments */}
                  <TrackOfWeekComments trackId={trackOfWeek.id} />

                  {/* CTA */}
                  <Link
                    href="/track-of-the-week"
                    className="btn-secondary px-6 py-3 rounded-lg font-medium text-center"
                  >
                    עוד פרטים והגיבו ←
                  </Link>
                </div>
              </div>
            ) : (
              // No track approved yet
              <div className="text-center py-8">
                <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
                  הגיע הזמן לשמוע מה בוחרת קהילת הטראנס הגדולה בישראל! בכל שבוע, טרק חדש וסיפור אישי מאחוריו.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link
                    href="/track-of-the-week"
                    className="btn-primary px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2"
                  >
                    🎧 צפה בטרק השבועי
                  </Link>
                  <Link
                    href="/submit-track"
                    className="btn-secondary px-6 py-3 rounded-lg font-medium inline-block"
                  >
                    הגישו טרק משלכם
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Previous Episodes */}
        <section className="max-w-7xl mx-auto px-6 pb-16">
          <h3 className="text-xl font-semibold mb-4">פרקים קודמים</h3>

          {episodesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card rounded-lg overflow-hidden">
                  <div className="aspect-video bg-gray-900 animate-pulse" />
                  <div className="p-3">
                    <div className="h-4 bg-gray-800 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : episodesError ? (
            <div className="glass-card rounded-xl p-6 text-center text-gray-300">
              <p className="mb-4">לא הצלחנו לטעון פרקים קודמים. {episodesError}</p>
              <button onClick={() => window.location.reload()} className="btn-primary px-6 py-3 rounded-lg font-medium">
                רענן דף
              </button>
            </div>
          ) : previousEpisodes.length === 0 ? (
            <p className="text-gray-400">אין עדיין פרקים קודמים.</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {previousEpisodes.map((episode) => (
                  <a
                    key={episode.id}
                    href={`https://www.youtube.com/watch?v=${episode.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-card rounded-lg overflow-hidden hover:scale-105 transition-transform"
                  >
                    <div className="aspect-video bg-gray-800 relative">
                      <img src={episode.thumbnail} alt={episode.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <svg className="w-12 h-12 text-white/90" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium line-clamp-2">{episode.title}</p>
                    </div>
                  </a>
                ))}
              </div>

              <div className="text-center mt-6">
                <Link href="/episodes" className="btn-primary px-6 py-3 rounded-lg font-medium inline-block">
                  כל הפרקים
                </Link>
              </div>
            </>
          )}
        </section>

        {/* Platforms */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="glass-card rounded-xl p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">האזינו בכל הפלטפורמות</h2>
            <p className="text-gray-400 mb-8">כל הפרקים זמינים גם ב־YouTube, Spotify ועוד.</p>

            <div className="flex flex-wrap justify-center gap-4">
              <a href="https://open.spotify.com/show/0LGP2n3IGqeFVv1fIZOkeZ?si=47fdcc7c684e45f9" target="_blank" rel="noopener noreferrer" className="btn-secondary px-6 py-3 rounded-lg font-medium flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
                Spotify
              </a>
              <a href="https://www.youtube.com/@tracktripil" target="_blank" rel="noopener noreferrer" className="btn-secondary px-6 py-3 rounded-lg font-medium flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                YouTube
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-800 mt-16">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex flex-col items-center gap-6">
              <div className="flex flex-wrap justify-center gap-4">
                <a href="https://www.instagram.com/track_trip.trance/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-400 transition" aria-label="Instagram">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="https://www.facebook.com/tracktripil" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-400 transition" aria-label="Facebook">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="https://www.youtube.com/@tracktripil" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-400 transition" aria-label="YouTube">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
                <a href="https://open.spotify.com/show/0LGP2n3IGqeFVVlflZOkeZ?si=47fdcc7c684e45f9" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-400 transition" aria-label="Spotify">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
                </a>
                <a href="https://chat.whatsapp.com/LSZaHTgYXPn4HRvrsCnmTc" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-400 transition" aria-label="WhatsApp">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </a>
              </div>

              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <Link href="/episodes" className="text-gray-400 hover:text-gray-300 transition">פרקים</Link>
                <Link href="/young-artists" className="text-gray-400 hover:text-gray-300 transition">אמנים צעירים</Link>
                <Link href="/about" className="text-gray-400 hover:text-gray-300 transition">אודות</Link>
              </div>

              <div className="text-sm text-gray-500">© 2025 יוצאים לטראק</div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

// Server-side data fetching with Track of the Week
export async function getServerSideProps() {
  const mockReq = {} as any;
  let episodesData: any;
  
  const mockRes = {
    status: (code: number) => mockRes,
    json: (data: any) => {
      if (typeof data !== 'object' || !data.error) {
        episodesData = data;
      }
      return mockRes;
    },
    setHeader: () => mockRes,
  } as any;
  
  let episodes: Episode[] = [];
  let episodesError: string | null = null;
  let trackOfWeek: TrackOfWeek | null = null;

  // Fetch episodes
  try {
    await episodeApiHandler(mockReq, mockRes);
    episodes = episodesData && Array.isArray(episodesData) ? episodesData : [];
    if (episodesData && episodesData.error) {
      throw new Error(episodesData.error);
    }
  } catch (err: any) {
    console.error("SSR episode fetch failed:", err.message);
    episodesError = "שגיאה בטעינת הפרקים.";
  }

  // Fetch Track of the Week using Supabase
  try {
    const supabase = require('../lib/supabaseServer').default;
    const { data, error } = await supabase
      .from('track_of_the_week_submissions')
      .select('*')
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Track of Week fetch error:', error);
    } else if (data) {
      trackOfWeek = data;
    }
  } catch (err: any) {
    console.error("SSR Track of Week fetch failed:", err.message);
  }

  return {
    props: {
      episodes,
      episodesError,
      trackOfWeek,
    },
  };
}

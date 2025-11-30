// pages/[slug].tsx - V15: THE BENTO GRID REVOLUTION

import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { GetServerSideProps } from "next";
import { createClient } from "@supabase/supabase-js";
import Navigation from "../components/Navigation";
import { getArtistProfile, getArtistTopTracks, getArtistDiscography } from "../lib/spotify";
import { 
  FaInstagram, FaFacebook, FaSoundcloud, FaSpotify, FaYoutube, FaGlobe, 
  FaPlay, FaMusic, FaCompactDisc, FaStar, FaBroadcastTower, FaArrowRight, 
  FaBriefcase, FaEnvelope, FaExternalLinkAlt, FaExclamationTriangle, FaPause
} from 'react-icons/fa';

// ==========================================
// TYPES
// ==========================================
interface FestivalSet {
  title: string;
  youtube_id: string;
  thumbnail: string;
  festival: string;
  year: string;
  location: string;
}

interface Artist {
  id: number;
  slug: string;
  name: string;
  stage_name: string;
  short_bio: string;
  profile_photo_url: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  soundcloud_url: string | null;
  soundcloud_profile_url: string | null;
  spotify_url: string | null;
  youtube_url: string | null;
  website_url: string | null;
  genre: string | null;
  spotify_artist_id: string | null;
  instagram_reels: string[];
  festival_sets: FestivalSet[];
  primary_color: string;
  booking_company: string;
  record_label: string;
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
}

interface SpotifyTrack {
  id: string;
  name: string;
  album: { name: string; images: { url: string }[]; release_date: string; };
  external_urls: { spotify: string; };
  preview_url: string | null;
  duration: number;
}

interface SpotifyDiscographyItem {
    id: string;
    name: string;
    releaseDate: string;
    type: 'album' | 'single';
    coverImage: string;
    spotifyUrl: string;
    totalTracks: number;
}

interface ArtistPageProps {
  artist: Artist;
  episode: Episode | null;
  spotifyTopTracks: SpotifyTrack[];
  spotifyDiscography: SpotifyDiscographyItem[];
  spotifyProfile: { followers: number; popularity: number } | null;
}

// ==========================================
// COMPONENTS
// ==========================================

export default function ArtistPage({ 
  artist, episode, spotifyTopTracks, spotifyDiscography
}: ArtistPageProps) {
  
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const accentColor = artist.primary_color || '#8b5cf6'; 

  // Dynamic Styles for this artist
  const dynamicStyle = { 
    '--accent': accentColor,
    '--spotify': '#1DB954',
    '--youtube': '#FF0000',
    '--soundcloud': '#FF5500',
  } as React.CSSProperties;

  useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
  }, []);

  const handlePlayPreview = (previewUrl: string, trackId: string) => {
    if (currentlyPlaying === trackId && audioElement) {
      audioElement.pause();
      setCurrentlyPlaying(null);
      return;
    }
    if (audioElement) audioElement.pause();
    const audio = new Audio(previewUrl);
    audio.play();
    audio.onended = () => setCurrentlyPlaying(null);
    setAudioElement(audio);
    setCurrentlyPlaying(trackId);
  };

  // CSS (Bento Grid & Polish)
  const customStyles = `
    .bento-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
    @media (min-width: 1024px) {
      .bento-grid {
        grid-template-columns: 350px 1fr 300px;
        grid-template-rows: auto auto auto;
      }
      .bento-hero { grid-column: 1 / -1; }
      .bento-music { grid-column: 1 / 2; grid-row: 2 / 4; }
      .bento-media { grid-column: 2 / 3; grid-row: 2 / 4; }
      .bento-sidebar { grid-column: 3 / 4; grid-row: 2 / 4; }
      .bento-disco { grid-column: 1 / -1; }
    }
    
    /* Glass Cards */
    .glass-panel {
      background: rgba(13, 13, 20, 0.7);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 1.5rem;
      overflow: hidden;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .glass-panel:hover {
      border-color: var(--accent);
      box-shadow: 0 10px 40px -10px color-mix(in srgb, var(--accent) 30%, transparent);
    }

    /* Brand Cards */
    .brand-card {
      position: relative;
      height: 140px;
      border-radius: 1rem;
      overflow: hidden;
      border: 1px solid rgba(255,255,255,0.1);
      transition: all 0.3s ease;
    }
    .brand-card:hover {
      transform: scale(1.02);
      border-color: rgba(255,255,255,0.3);
    }
    .brand-bg {
      position: absolute;
      inset: 0;
      opacity: 0.15;
      filter: blur(2px);
      transition: opacity 0.3s ease;
    }
    .brand-card:hover .brand-bg { opacity: 0.3; }
    .brand-content {
      position: relative;
      z-index: 10;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
    }

    /* Scrollbar Hide */
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    
    /* Hero Glow */
    .hero-avatar {
      box-shadow: 0 0 50px color-mix(in srgb, var(--accent) 40%, transparent);
    }
  `;

  return (
    <>
      <Head>
        <title>{artist.stage_name} | Music Hub</title>
      </Head>
      <style jsx global>{customStyles}</style>
      <div className="min-h-screen bg-[#05050a] text-white pb-20" style={dynamicStyle}>
        <Navigation currentPage="episodes" />
        
        {/* BACKGROUND FX */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[var(--accent)] opacity-[0.08] blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-blue-600 opacity-[0.08] blur-[120px] rounded-full" />
        </div>

        <div className="max-w-[1400px] mx-auto px-4 pt-8 relative z-10">
          
          {/* BENTO GRID LAYOUT */}
          <div className="bento-grid">

            {/* 1. HERO SECTION (Full Width) */}
            <div className="bento-hero flex flex-col md:flex-row items-center gap-8 py-8 px-4 md:px-8">
               <div className="relative w-48 h-48 md:w-64 md:h-64 shrink-0">
                  <div className="absolute inset-0 rounded-full border-2 border-[var(--accent)] animate-pulse opacity-50"></div>
                  <img 
                    src={artist.profile_photo_url || '/images/logo.png'} 
                    alt={artist.stage_name}
                    className="w-full h-full object-cover rounded-full hero-avatar border-4 border-[#1a1a2e]"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur px-3 py-1 rounded-full border border-white/10 text-xs font-bold">
                    🇮🇱 {artist.genre}
                  </div>
               </div>
               <div className="text-center md:text-right flex-1">
                  <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500">
                    {artist.stage_name}
                  </h1>
                  <p className="text-xl text-gray-400 max-w-3xl ml-auto leading-relaxed">
                    {artist.short_bio}
                  </p>
                  <div className="flex gap-4 justify-center md:justify-start mt-6">
                    {artist.instagram_url && <a href={artist.instagram_url} target="_blank" className="p-3 bg-white/5 rounded-xl hover:bg-pink-500/20 hover:text-pink-400 transition"><FaInstagram size={24} /></a>}
                    {artist.spotify_url && <a href={artist.spotify_url} target="_blank" className="p-3 bg-white/5 rounded-xl hover:bg-green-500/20 hover:text-green-400 transition"><FaSpotify size={24} /></a>}
                    {artist.soundcloud_url && <a href={artist.soundcloud_url} target="_blank" className="p-3 bg-white/5 rounded-xl hover:bg-orange-500/20 hover:text-orange-400 transition"><FaSoundcloud size={24} /></a>}
                    {artist.youtube_url && <a href={artist.youtube_url} target="_blank" className="p-3 bg-white/5 rounded-xl hover:bg-red-500/20 hover:text-red-400 transition"><FaYoutube size={24} /></a>}
                  </div>
               </div>
            </div>

            {/* 2. MUSIC COLUMN (Left) */}
            <div className="bento-music space-y-6">
              {/* Spotify Top Tracks */}
              <div className="glass-panel p-6">
                <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                  <FaSpotify className="text-green-500 text-2xl" />
                  <h3 className="text-xl font-bold">Popular Tracks</h3>
                </div>
                <div className="space-y-3">
                  {spotifyTopTracks.length > 0 ? spotifyTopTracks.map((track, i) => (
                    <div key={track.id} className="group flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition cursor-pointer" onClick={() => track.preview_url && handlePlayPreview(track.preview_url, track.id)}>
                      <span className="text-gray-500 font-mono w-4 text-center">{i+1}</span>
                      <div className="relative w-10 h-10 rounded overflow-hidden shrink-0">
                        <img src={track.album.images[0].url} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center">
                          {currentlyPlaying === track.id ? <FaPause size={12}/> : <FaPlay size={12}/>}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold truncate group-hover:text-green-400 transition">{track.name}</div>
                        <div className="text-xs text-gray-400 truncate">{track.album.name}</div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-gray-500">No tracks available</div>
                  )}
                </div>
              </div>

               {/* SoundCloud Embed */}
               {artist.soundcloud_profile_url && (
                 <div className="glass-panel p-0 border-orange-500/20">
                   <div className="p-4 bg-gradient-to-r from-orange-900/20 to-transparent flex items-center gap-2">
                     <FaSoundcloud className="text-orange-500" />
                     <span className="text-sm font-bold text-orange-200">Latest Uploads</span>
                   </div>
                   <iframe width="100%" height="300" scrolling="no" frameBorder="no" allow="autoplay" src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(artist.soundcloud_profile_url)}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true`}></iframe>
                 </div>
               )}
            </div>

            {/* 3. MEDIA CENTER (Center - The Main Stage) */}
            <div className="bento-media space-y-6">
              
               {/* Featured Live Set */}
               {artist.festival_sets?.[0] && (
                 <div className="glass-panel p-0 group relative">
                    <div className="absolute top-4 left-4 z-20 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">LIVE SET</div>
                    <a href={`https://www.youtube.com/watch?v=${artist.festival_sets[0].youtube_id}`} target="_blank" className="block relative aspect-video">
                      <img src={artist.festival_sets[0].thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition flex items-center justify-center">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 transition">
                          <FaPlay size={24} className="ml-1" />
                        </div>
                      </div>
                      <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black via-black/60 to-transparent">
                        <h3 className="text-2xl font-bold mb-1">{artist.festival_sets[0].title}</h3>
                        <p className="text-gray-300 text-sm flex items-center gap-2">
                           <FaGlobe size={12} /> {artist.festival_sets[0].festival} • {artist.festival_sets[0].year}
                        </p>
                      </div>
                    </a>
                 </div>
               )}

               {/* The Episode (Smart Fallback) */}
               {episode ? (
                 <div className="glass-panel p-0 flex flex-col md:flex-row h-auto md:h-40 group">
                    <div className="relative md:w-48 shrink-0">
                      <img src={episode.thumbnail_url} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <FaYoutube size={30} className="text-white" />
                      </div>
                    </div>
                    <div className="p-5 flex flex-col justify-center">
                       <div className="text-purple-400 text-xs font-bold mb-1 tracking-wide">TRACK TRIP INTERVIEW</div>
                       <h3 className="font-bold text-lg leading-tight mb-2">{episode.clean_title}</h3>
                       <Link href={`https://www.youtube.com/watch?v=${episode.youtube_video_id}`} target="_blank" className="inline-flex items-center text-sm text-gray-400 hover:text-white transition">
                         Watch Full Episode <FaArrowRight className="ml-2 w-3 h-3" />
                       </Link>
                    </div>
                 </div>
               ) : (
                 // Visual placeholder if really missing, but code below tries to find it
                 <div className="glass-panel p-8 text-center border-dashed border-white/10">
                    <FaBroadcastTower className="text-4xl mx-auto mb-2 text-gray-600" />
                    <p className="text-gray-500">Interview coming soon...</p>
                 </div>
               )}

               {/* Instagram Reels (Grid) */}
               {artist.instagram_reels?.length > 0 && (
                 <div className="grid grid-cols-3 gap-4">
                    {artist.instagram_reels.slice(0, 3).map((url, i) => (
                      <div key={i} className="glass-panel aspect-[9/16] relative group">
                        <iframe src={`${url.replace(/\/$/, '')}/embed`} className="w-full h-full absolute inset-0" frameBorder="0" scrolling="no" />
                      </div>
                    ))}
                 </div>
               )}
            </div>

            {/* 4. REPRESENTATION (Right Sidebar) */}
            <div className="bento-sidebar space-y-4">
               <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Representation</div>
               
               {/* Booking Card */}
               <div className="brand-card group">
                  <img src="/images/sonic.jpg" className="brand-bg w-full h-full object-cover" />
                  <div className="brand-content p-4">
                     <div className="w-12 h-12 rounded-full border-2 border-white/20 overflow-hidden mb-3 bg-black">
                        <Image src="/images/sonic.jpg" width={48} height={48} alt="Booking" />
                     </div>
                     <div className="font-bold text-lg">{artist.booking_company || 'Sonic Booking'}</div>
                     <div className="text-xs text-cyan-400 uppercase font-bold tracking-wide mb-3">Worldwide Booking</div>
                     <a href={`mailto:booking@${artist.slug}.com`} className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold rounded-full transition">
                        Contact Agent
                     </a>
                  </div>
               </div>

               {/* Label Card */}
               <div className="brand-card group">
                  <img src="/images/shamanic.jpg" className="brand-bg w-full h-full object-cover" />
                  <div className="brand-content p-4">
                     <div className="w-12 h-12 rounded-full border-2 border-white/20 overflow-hidden mb-3 bg-black">
                        <Image src="/images/shamanic.jpg" width={48} height={48} alt="Label" />
                     </div>
                     <div className="font-bold text-lg">{artist.record_label || 'Shamanic Tales'}</div>
                     <div className="text-xs text-purple-400 uppercase font-bold tracking-wide mb-3">Record Label</div>
                     <Link href="https://shamanictales.com" target="_blank" className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-full transition">
                        Visit Label
                     </Link>
                  </div>
               </div>

               {/* Contact List */}
               <div className="glass-panel p-5 mt-6">
                  <h4 className="font-bold mb-4 text-gray-300">Contact Info</h4>
                  <ul className="space-y-3 text-sm">
                    <li>
                       <a href={`mailto:booking@${artist.slug}.com`} className="flex items-center gap-3 text-gray-400 hover:text-white transition">
                         <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center"><FaEnvelope /></div>
                         <span>booking@{artist.slug}.com</span>
                       </a>
                    </li>
                    <li>
                       <a href="#" className="flex items-center gap-3 text-gray-400 hover:text-white transition">
                         <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center"><FaBriefcase /></div>
                         <span>Press Kit (EPK)</span>
                       </a>
                    </li>
                  </ul>
               </div>
            </div>

            {/* 5. DISCOGRAPHY (Bottom - Full Width) */}
            <div className="bento-disco mt-8">
               <div className="flex items-center justify-between mb-6 px-4">
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <FaCompactDisc className="text-[var(--accent)]" /> Discography
                  </h2>
                  <a href={artist.spotify_url || '#'} target="_blank" className="text-sm text-gray-400 hover:text-white flex items-center gap-2 transition">
                    View on Spotify <FaExternalLinkAlt size={12} />
                  </a>
               </div>
               
               {/* Horizontal Scroll */}
               <div className="horizontal-scroll-container px-4 pb-8">
                 {spotifyDiscography.map((album) => (
                   <a href={album.spotifyUrl} target="_blank" key={album.id} className="group relative w-[200px] shrink-0">
                      <div className="aspect-square rounded-xl overflow-hidden mb-3 shadow-xl border border-white/10 group-hover:border-[var(--accent)] transition">
                        <img src={album.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <FaSpotify size={40} className="text-green-500 drop-shadow-lg" />
                        </div>
                      </div>
                      <h4 className="font-bold truncate pr-2">{album.name}</h4>
                      <div className="flex items-center justify-between text-xs text-gray-500 mt-1 pr-2">
                         <span>{new Date(album.releaseDate).getFullYear()}</span>
                         <span className="uppercase border border-white/10 px-1 rounded">{album.type}</span>
                      </div>
                   </a>
                 ))}
               </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

// ==========================================
// SERVER SIDE PROPS (WITH SMART FALLBACK)
// ==========================================

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const slug = params?.slug as string;
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  try {
    // 1. Get Artist
    const { data: artist } = await supabase.from('artists').select('*').eq('slug', slug).single();
    if (!artist) return { notFound: true };

    // 2. Get Episode (Smart Logic)
    let episode = null;
    
    // A. Try direct link
    const { data: linkData } = await supabase.from('artist_episodes')
      .select(`episodes (*)`).eq('artist_id', artist.id).maybeSingle();
      
    if (linkData?.episodes) {
      episode = linkData.episodes; // If array, take first? Supabase usually returns object on single join if 1:1, but let's be safe
      if (Array.isArray(episode)) episode = episode[0];
    } 
    
    // B. Fallback: Search by name if link missing
    if (!episode) {
       const { data: searchData } = await supabase.from('episodes')
         .select('*').ilike('title', `%${artist.name}%`).limit(1);
       if (searchData && searchData.length > 0) episode = searchData[0];
    }

    // 3. Spotify Data
    let spotifyTopTracks: any[] = [];
    let spotifyDiscography: any[] = [];
    let spotifyProfile = null;

    if (artist.spotify_artist_id) {
        try {
            const [profile, tracks, disco] = await Promise.all([
                getArtistProfile(artist.spotify_artist_id),
                getArtistTopTracks(artist.spotify_artist_id),
                getArtistDiscography(artist.spotify_artist_id)
            ]);
            spotifyProfile = profile;
            spotifyTopTracks = tracks || [];
            
            // De-duplicate discography
            if (disco) {
                spotifyDiscography = disco.filter((v: any, i: number, a: any[]) => 
                    a.findIndex((t: any) => (t.name === v.name)) === i
                );
            }
        } catch (e) { console.error("Spotify Error", e); }
    }

    return {
      props: {
        artist: { ...artist, festival_sets: artist.festival_sets || [] }, // Ensure array
        episode,
        spotifyTopTracks,
        spotifyDiscography,
        spotifyProfile
      }
    };
  } catch (error) {
    return { notFound: true };
  }
};

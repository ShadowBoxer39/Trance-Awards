// components/PlayerProvider.tsx
import React, { useState, useRef, useContext, createContext, useEffect } from "react";
import dynamic from "next/dynamic";

// Lazy load ReactPlayer to avoid hydration mismatch
const ReactPlayer = dynamic(() => import("react-player/lazy"), { ssr: false });

// ✅ HYBRID API: Supports both old and new usage
type PlayerAPI = {
  // LEGACY: Used by existing site pages
  playUrl: (url: string) => void;
  
  // NEW: Used by Daily Duel (supports metadata)
  playTrack: (data: { url: string; title: string; image: string; artist?: string }) => void;
  
  toggle: () => void;
  seek: (amount: number) => void;
  
  // STATE: Exposed for visual effects (Glow)
  isPlaying: boolean;
  activeUrl: string | null;
};

const PlayerContext = createContext<PlayerAPI>({
  playUrl: () => {},
  playTrack: () => {},
  toggle: () => {},
  seek: () => {},
  isPlaying: false,
  activeUrl: null,
});

export const usePlayer = () => useContext(PlayerContext);

export default function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [url, setUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [meta, setMeta] = useState({ title: "", image: "", artist: "" });
  const [played, setPlayed] = useState(0); 
  const [duration, setDuration] = useState(0);
  const [visible, setVisible] = useState(false);
  
  const playerRef = useRef<any>(null);

  // 1. NEW METHOD: Rich Metadata
  const playTrack = ({ url, title, image, artist = "" }: { url: string; title: string; image: string; artist?: string }) => {
    setUrl(url);
    setMeta({ title, image, artist });
    setPlaying(true);
    setVisible(true);
  };

  // 2. LEGACY METHOD: Fallback for existing site code
  const playUrl = (url: string) => {
    // We guess metadata since the old call didn't provide it
    playTrack({
        url, 
        title: "Playing Track...", 
        image: "/images/logo.png",
        artist: "Trance Awards"
    });
  };

  const toggle = () => setPlaying((p) => !p);

  const seek = (amount: number) => {
    if (playerRef.current) {
        // Handle both fractional (0-1) and seconds
        playerRef.current.seekTo(amount, amount < 1 ? "fraction" : "seconds");
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <PlayerContext.Provider
      value={{
        playUrl,   // ✅ Kept for backward compatibility
        playTrack, // ✅ New powerful function
        toggle,
        seek,
        isPlaying: playing,
        activeUrl: url,
      }}
    >
      {children}

      {/* --- THE ENGINE (Hidden) --- */}
      {url && (
        <div className="fixed top-0 left-0 w-px h-px opacity-0 pointer-events-none overflow-hidden">
          <ReactPlayer
            ref={playerRef}
            url={url}
            playing={playing}
            volume={1}
            width="100%"
            height="100%"
            onProgress={(state) => setPlayed(state.played)}
            onDuration={setDuration}
            onEnded={() => setPlaying(false)}
            config={{
              youtube: { playerVars: { playsinline: 1 } },
              soundcloud: { options: { auto_play: true } }
            }}
          />
        </div>
      )}

      {/* --- THE UI (Modern Floating Pill) --- */}
      {visible && (
        <div className="fixed bottom-6 left-0 right-0 z-[100] flex justify-center px-4 animate-slide-up">
          <div className="bg-black/90 backdrop-blur-2xl border border-white/10 rounded-full p-2 pr-6 pl-2 flex items-center gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.8)] w-full max-w-lg pointer-events-auto ring-1 ring-white/20">
            
            {/* Artwork & Play/Pause */}
            <button
              onClick={toggle}
              className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 group border border-white/10"
            >
              <img 
                src={meta.image || "/images/logo.png"} 
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" 
                alt="art" 
              />
              <div className="absolute inset-0 flex items-center justify-center text-white bg-black/20">
                {playing ? "⏸" : "▶"}
              </div>
            </button>

            {/* Track Info & Seeker */}
            <div className="flex-1 min-w-0 flex flex-col justify-center h-full" dir="rtl">
              <div className="flex justify-between items-baseline mb-1">
                <div className="flex flex-col min-w-0 pr-2">
                   <span className="text-white text-sm font-bold truncate">{meta.title}</span>
                   {meta.artist && meta.artist !== "Trance Awards" && (
                       <span className="text-xs text-gray-400 truncate">{meta.artist}</span>
                   )}
                </div>
                <span className="text-[10px] text-gray-400 font-mono shrink-0" dir="ltr">
                  {formatTime(duration * played)}
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="relative w-full h-1 bg-gray-700 rounded-full overflow-hidden cursor-pointer group/bar">
                <div 
                  className="absolute inset-y-0 right-0 bg-gradient-to-l from-purple-500 to-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${played * 100}%` }}
                />
                <input
                  type="range"
                  min={0}
                  max={1}
                  step="any"
                  value={played}
                  onChange={(e) => seek(parseFloat(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => {
                setPlaying(false);
                setVisible(false);
              }}
              className="text-gray-400 hover:text-white transition-colors p-2 text-lg"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </PlayerContext.Provider>
  );
}

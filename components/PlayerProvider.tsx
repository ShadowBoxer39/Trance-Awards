import React, { useState, useEffect, useRef, useContext, createContext, useCallback } from "react";

// --- Types ---
type TrackData = {
  url: string;
  title: string;
  image: string;
  artist?: string;
};

type PlayerAPI = {
  playTrack: (data: TrackData) => void;
  playUrl: (url: string) => void; // <--- Restored this property
  toggle: () => void;
  seek: (percentage: number) => void;
  activeUrl: string | null;
  isPlaying: boolean;
  progress: number;
};

const PlayerContext = createContext<PlayerAPI>({
  playTrack: () => {},
  playUrl: () => {}, // <--- Restored this default
  toggle: () => {},
  seek: () => {}, 
  activeUrl: null,
  isPlaying: false,
  progress: 0,
});

export const usePlayer = () => useContext(PlayerContext);

// --- Helper: Extract YouTube ID ---
const getYouTubeId = (url: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// --- Main Provider ---
export default function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const playerRef = useRef<any>(null); // The raw YT Player instance
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isSeekingRef = useRef(false);

  // 1. Initialize YouTube API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    // Define the global callback
    window.onYouTubeIframeAPIReady = () => {
      // API is ready
    };

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // 2. Setup/Update Player when URL changes
  useEffect(() => {
    if (!activeUrl) return;

    const videoId = getYouTubeId(activeUrl);
    if (!videoId) {
        console.warn("PlayerProvider: Non-YouTube URL detected or invalid ID", activeUrl);
        return;
    }

    if (!playerRef.current) {
      // Create Player if it doesn't exist
      if (window.YT && window.YT.Player) {
        playerRef.current = new window.YT.Player('yt-player-target', {
          height: '0',
          width: '0',
          videoId: videoId,
          playerVars: {
            'autoplay': 1,
            'controls': 0,
            'disablekb': 1,
            'fs': 0,
            'playsinline': 1,
          },
          events: {
            'onReady': (event: any) => {
              event.target.playVideo();
              setIsPlaying(true);
            },
            'onStateChange': (event: any) => {
              // 1 = Playing, 2 = Paused, 0 = Ended
              if (event.data === 1) setIsPlaying(true);
              if (event.data === 2) setIsPlaying(false);
              if (event.data === 0) {
                setIsPlaying(false);
                setProgress(0);
              }
            }
          }
        });
      }
    } else {
      // Player exists, just load new video
      playerRef.current.loadVideoById(videoId);
      setIsPlaying(true);
    }
  }, [activeUrl]);

  // 3. Progress Loop (Manual Polling)
  useEffect(() => {
    timerRef.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime && !isSeekingRef.current) {
        const current = playerRef.current.getCurrentTime();
        const duration = playerRef.current.getDuration();
        if (duration > 0) {
          setProgress(current / duration);
        }
      }
    }, 100); 

    return () => { 
      if (timerRef.current) clearInterval(timerRef.current); 
    };
  }, []);

  // --- Controls ---

  const playTrack = (data: TrackData) => {
    if (activeUrl === data.url) {
      toggle();
    } else {
      setActiveUrl(data.url);
      setProgress(0);
    }
  };

  // --- RESTORED FUNCTION ---
  const playUrl = (url: string) => {
    playTrack({ url, title: "Unknown Track", image: "" });
  };

  const toggle = () => {
    if (!playerRef.current || typeof playerRef.current.getPlayerState !== 'function') return;
    
    const state = playerRef.current.getPlayerState();
    if (state === 1) { // Playing
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    } else {
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  };

  const seek = useCallback((percentage: number) => {
    if (!playerRef.current || typeof playerRef.current.seekTo !== 'function') return;

    isSeekingRef.current = true;
    setProgress(percentage);

    const duration = playerRef.current.getDuration();
    if (duration) {
      const seekTime = duration * percentage;
      playerRef.current.seekTo(seekTime, true);
    }

    setTimeout(() => {
      isSeekingRef.current = false;
    }, 500);
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        playTrack,
        playUrl, // <--- Exposed to Context
        toggle,
        seek,
        activeUrl,
        isPlaying,
        progress,
      }}
    >
      {children}
      <div 
        id="yt-player-target" 
        className="fixed bottom-0 right-0 w-px h-px opacity-0 pointer-events-none z-[-1]" 
      />
    </PlayerContext.Provider>
  );
}

// Add types for global YT object
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: any;
  }
}

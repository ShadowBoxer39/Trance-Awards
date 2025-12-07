import React, { useState, useRef, useContext, createContext, useCallback } from "react";
import dynamic from "next/dynamic";

// Import types for ReactPlayer if needed, or use 'any' for the ref to be safe with dynamic
const ReactPlayer = dynamic(() => import("react-player/lazy"), { ssr: false });

type TrackData = {
  url: string;
  title: string;
  image: string;
  artist?: string;
};

type PlayerAPI = {
  playTrack: (data: TrackData) => void;
  playUrl: (url: string) => void;
  toggle: () => void;
  seek: (amount: number) => void;
  activeUrl: string | null;
  isPlaying: boolean;
  progress: number;
};

const PlayerContext = createContext<PlayerAPI>({
  playTrack: () => {},
  playUrl: () => {},
  toggle: () => {},
  seek: () => {}, 
  activeUrl: null,
  isPlaying: false,
  progress: 0,
});

export const usePlayer = () => useContext(PlayerContext);

export default function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [url, setUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0); 
  
  // We use a callback ref to ensure we capture the player instance even if it remounts
  const playerRef = useRef<any>(null);
  const isSeeking = useRef(false);
  const seekTimeout = useRef<NodeJS.Timeout | null>(null);
  
  const playTrack = (data: TrackData) => {
    if (url === data.url) {
      setPlaying(!playing);
    } else {
      setUrl(data.url);
      setPlaying(true);
      setProgress(0);
      isSeeking.current = false;
    }
  };

  const playUrl = (simpleUrl: string) => {
    playTrack({ url: simpleUrl, title: "", image: "" });
  };

  const toggle = () => setPlaying((p) => !p);

  const seek = useCallback((amount: number) => {
    // 1. Lock updates immediately to prevent jitter
    isSeeking.current = true;
    
    // 2. Clear existing timeout
    if (seekTimeout.current) clearTimeout(seekTimeout.current);

    // 3. Update Visual State immediately
    setProgress(amount);
    
    // 4. Perform the actual seek on the player
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      // 'fraction' seeks to a percentage (0 to 1)
      playerRef.current.seekTo(amount, "fraction");
    }

    // 5. Unlock after a short delay (prevents the player from snapping back to old time)
    seekTimeout.current = setTimeout(() => { 
        isSeeking.current = false; 
    }, 1000);
  }, []);

  // Callback ref to securely attach the player
  const handlePlayerRef = (player: any) => {
    playerRef.current = player;
  };

  return (
    <PlayerContext.Provider
      value={{
        playTrack,
        playUrl,
        toggle,
        seek,
        activeUrl: url,
        isPlaying: playing,
        progress,
      }}
    >
      {children}
      {/* Hidden Player */}
      <div className="fixed bottom-0 right-0 w-px h-px opacity-0 pointer-events-none overflow-hidden z-[-1]">
        {url && (
          <ReactPlayer
            ref={handlePlayerRef}
            url={url}
            playing={playing}
            volume={1}
            width="100%"
            height="100%"
            progressInterval={100} 
            onProgress={(state: any) => {
                if (!isSeeking.current) {
                    setProgress(state.played);
                }
            }}
            onEnded={() => setPlaying(false)}
            config={{
              youtube: { playerVars: { playsinline: 1 } },
              soundcloud: { options: { auto_play: true } },
              file: { attributes: { playsInline: true } }
            }}
          />
        )}
      </div>
    </PlayerContext.Provider>
  );
}

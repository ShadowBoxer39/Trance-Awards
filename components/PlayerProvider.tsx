import React, { useState, useRef, useContext, createContext } from "react";
import dynamic from "next/dynamic";

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
  
  // Anti-Flicker State
  const isSeeking = useRef(false);
  
  const playerRef = useRef<any>(null);
  
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

  const seek = (amount: number) => {
    // 1. User is dragging -> Stop listening to player updates
    isSeeking.current = true;
    
    // 2. Update slider visually instantly
    setProgress(amount);
    
    // 3. Move the player
    if (playerRef.current) {
      playerRef.current.seekTo(amount, "fraction");
    }

    // 4. Release lock after short delay
    setTimeout(() => { isSeeking.current = false; }, 500);
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
      
      {/* HIDDEN PLAYER ENGINE */}
      <div className="fixed bottom-0 right-0 w-px h-px opacity-0 pointer-events-none overflow-hidden z-[-1]">
        {url && (
          <ReactPlayer
            ref={playerRef}
            url={url}
            playing={playing}
            volume={1}
            width="100%"
            height="100%"
            progressInterval={100} // Fast updates
            onProgress={(state) => {
                if (!isSeeking.current) {
                    setProgress(state.played);
                }
            }}
            onEnded={() => setPlaying(false)}
            config={{
              youtube: { playerVars: { playsinline: 1 } },
              soundcloud: { options: { auto_play: true } }
            }}
          />
        )}
      </div>
    </PlayerContext.Provider>
  );
}

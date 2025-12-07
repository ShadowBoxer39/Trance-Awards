import React, { useState, useRef, useContext, createContext } from "react";
import dynamic from "next/dynamic";

// Lazy load to fix hydration
const ReactPlayer = dynamic(() => import("react-player/lazy"), { ssr: false });

type TrackData = {
  url: string;
  title: string;
  image: string;
  artist?: string;
};

type PlayerAPI = {
  playTrack: (data: TrackData) => void;
  playUrl: (url: string) => void; // Legacy support
  toggle: () => void;
  activeUrl: string | null;
  isPlaying: boolean;
  progress: number; // 0 to 1 (New!)
};

const PlayerContext = createContext<PlayerAPI>({
  playTrack: () => {},
  playUrl: () => {},
  toggle: () => {},
  activeUrl: null,
  isPlaying: false,
  progress: 0,
});

export const usePlayer = () => useContext(PlayerContext);

export default function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [url, setUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 1
  
  // We don't need meta/visible anymore since the UI is in the cards
  
  const playTrack = (data: TrackData) => {
    // If clicking the same track, just toggle
    if (url === data.url) {
      setPlaying(!playing);
    } else {
      setUrl(data.url);
      setPlaying(true);
      setProgress(0);
    }
  };

  const playUrl = (simpleUrl: string) => {
    playTrack({ url: simpleUrl, title: "", image: "" });
  };

  const toggle = () => setPlaying((p) => !p);

  return (
    <PlayerContext.Provider
      value={{
        playTrack,
        playUrl,
        toggle,
        activeUrl: url,
        isPlaying: playing,
        progress,
      }}
    >
      {children}

      {/* THE INVISIBLE ENGINE */}
      {/* We keep it 1x1px so YouTube techincally "sees" it and allows playback */}
      <div className="fixed bottom-0 right-0 w-px h-px opacity-0 pointer-events-none overflow-hidden z-[-1]">
        {url && (
          <ReactPlayer
            url={url}
            playing={playing}
            volume={1}
            width="100%"
            height="100%"
            onProgress={(state) => setProgress(state.played)}
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

import React from "react";
import Script from "next/script";

// 1. Update Type to accept metadata
type PlayerAPI = {
  playUrl: (url: string, title?: string, image?: string) => void;
  toggle: () => void;
  seek: (seconds: number) => void;
  activeUrl: string | null;
  isPlaying: boolean;
};

const PlayerContext = React.createContext<PlayerAPI>({
  playUrl: () => {},
  toggle: () => {},
  seek: () => {},
  activeUrl: null,
  isPlaying: false,
});

export const usePlayer = () => React.useContext(PlayerContext);

export default function PlayerProvider({ children }: { children: React.ReactNode }) {
  const iframeRef = React.useRef<HTMLIFrameElement | null>(null);
  const widgetRef = React.useRef<any>(null);
  const pollTimer = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const [apiReady, setApiReady] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  
  // State
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [url, setUrl] = React.useState<string | null>(null);
  
  // NEW: Store metadata locally
  const [trackTitle, setTrackTitle] = React.useState("Loading...");
  const [trackImage, setTrackImage] = React.useState("");

  const [duration, setDuration] = React.useState(0);
  const [position, setPosition] = React.useState(0);

  function setupWidget() {
    if (!iframeRef.current) return;
    // @ts-ignore
    const SC = (window as any).SC;
    if (!SC || !SC.Widget) return;
    // @ts-ignore
    const w = SC.Widget(iframeRef.current);
    widgetRef.current = w;
    setApiReady(true);

    w.bind("play", () => setIsPlaying(true));
    w.bind("pause", () => setIsPlaying(false));
    w.bind("finish", () => setIsPlaying(false));
    w.bind("playProgress", (e: any) => {
      if (typeof e?.currentPosition === "number") {
        setPosition(Math.max(0, Math.round(e.currentPosition / 1000)));
      }
    });
  }

  // ✅ UPDATED: Accepts title/image for instant display
  function loadAndPlay(scUrl: string, title?: string, image?: string) {
    const clean = scUrl.split("?")[0];
    setUrl(clean);
    
    // Set metadata instantly
    if (title) setTrackTitle(title);
    if (image) setTrackImage(image);
    
    setVisible(true);

    if(!widgetRef.current) return;

    widgetRef.current.load(clean, {
      auto_play: true,
      visual: false,
      show_user: false,
      show_comments: false,
      show_teaser: false,
      show_reposts: false,
      hide_related: true,
    });

    setTimeout(() => {
      const w = widgetRef.current;
      if (!w) return;
      w.getDuration((ms: number) => setDuration(Math.round((ms || 0) / 1000)));
      
      // Cleanup timer
      if (pollTimer.current !== null) clearInterval(pollTimer.current);
      pollTimer.current = setInterval(() => {
        w.getPosition((ms: number) => setPosition(Math.round((ms || 0) / 1000)));
        w.getDuration((ms: number) => setDuration(Math.round((ms || 0) / 1000)));
      }, 250);
    }, 500);
  }

  React.useEffect(() => {
    return () => {
      if (pollTimer.current !== null) clearInterval(pollTimer.current);
    };
  }, []);

  const api: PlayerAPI = {
    playUrl: (u, t, i) => {
      if (widgetRef.current) loadAndPlay(u, t, i);
    },
    toggle: () => {
      const w = widgetRef.current;
      if (w) w.isPaused((paused: boolean) => (paused ? w.play() : w.pause()));
    },
    seek: (seconds: number) => {
      const w = widgetRef.current;
      if (w) {
        const clamped = Math.max(0, Math.min(seconds, duration || seconds));
        w.seekTo(clamped * 1000);
        setPosition(clamped);
      }
    },
    activeUrl: url,
    isPlaying: isPlaying,
  };

  function formatTime(sec: number) {
    if (!sec || !isFinite(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  return (
    <>
      <Script
        src="https://w.soundcloud.com/player/api.js"
        strategy="afterInteractive"
        onLoad={setupWidget}
      />

      <PlayerContext.Provider value={api}>
        {children}

        {/* 🎵 THE NEW FLOATING PLAYER PILL 🎵 */}
        {visible && (
          <div className="fixed bottom-6 left-0 right-0 z-[100] flex justify-center px-4 pointer-events-none animate-slide-up">
            <div className="bg-black/90 backdrop-blur-2xl border border-white/10 rounded-full p-2 pr-6 pl-2 flex items-center gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.8)] w-full max-w-lg pointer-events-auto ring-1 ring-white/20">
              
              {/* Artwork / Play Button Combo */}
              <button
                onClick={api.toggle}
                disabled={!apiReady}
                className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 group border border-white/10"
              >
                {trackImage && (
                    <img src={trackImage} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" alt="art" />
                )}
                <div className="absolute inset-0 flex items-center justify-center text-white bg-black/20">
                    {isPlaying ? "⏸" : "▶"}
                </div>
              </button>

              {/* Info & Progress */}
              <div className="flex-1 min-w-0 flex flex-col justify-center h-full" dir="rtl">
                 <div className="flex justify-between items-baseline mb-1">
                   <span className="text-white text-sm font-bold truncate pl-2">
                     {trackTitle}
                   </span>
                   <span className="text-[10px] text-gray-400 font-mono" dir="ltr">
                     {formatTime(position)}
                   </span>
                 </div>
                 
                 {/* Progress Bar */}
                 <div className="relative w-full h-1 bg-gray-700 rounded-full overflow-hidden cursor-pointer group/bar">
                   <div 
                     className="absolute inset-y-0 right-0 bg-gradient-to-l from-purple-500 to-blue-500 rounded-full transition-all duration-300"
                     style={{ width: `${(position / (duration || 1)) * 100}%` }}
                   />
                   <input
                    type="range"
                    min={0}
                    max={Math.max(1, duration)}
                    value={Math.min(position, duration)}
                    onChange={(e) => api.seek(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                 </div>
              </div>

              {/* Close */}
              <button
                onClick={() => {
                  setVisible(false);
                  setIsPlaying(false);
                  setTrackTitle("");
                }}
                className="text-gray-400 hover:text-white transition-colors p-2 text-lg"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          title="SoundCloud Player"
          allow="autoplay"
          className="fixed -bottom-[2000px] left-0"
          width="100%"
          height="166"
          src="https://w.soundcloud.com/player/?url=https://soundcloud.com/stream&auto_play=false&visual=false&show_user=false&show_comments=false&show_reposts=false&hide_related=true"
        />
      </PlayerContext.Provider>
    </>
  );
}

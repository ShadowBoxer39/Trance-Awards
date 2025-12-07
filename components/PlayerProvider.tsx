import React from "react";
import Script from "next/script";

// 1. Define the API shape including State
type PlayerAPI = {
  playUrl: (url: string) => void;
  toggle: () => void;
  seek: (seconds: number) => void;
  activeUrl: string | null;  // Exposed for Duel Glow
  isPlaying: boolean;        // Exposed for Duel Glow
};

const PlayerContext = React.createContext<PlayerAPI>({
  playUrl: () => {},
  toggle: () => {},
  seek: () => {},
  activeUrl: null,
  isPlaying: false,
});

// 2. Export the Hook
export const usePlayer = () => React.useContext(PlayerContext);

type SoundMeta = {
  title?: string;
  permalink_url?: string;
  artwork_url?: string;
  user?: { username?: string };
};

export default function PlayerProvider({ children }: { children: React.ReactNode }) {
  const iframeRef = React.useRef<HTMLIFrameElement | null>(null);
  const widgetRef = React.useRef<any>(null);
  const pollTimer = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const [apiReady, setApiReady] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  
  // State exposed to the app
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [url, setUrl] = React.useState<string | null>(null);

  const [duration, setDuration] = React.useState(0);
  const [position, setPosition] = React.useState(0);
  const [meta, setMeta] = React.useState<SoundMeta>({});

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

  function loadAndPlay(scUrl: string) {
    const clean = scUrl.split("?")[0];
    setUrl(clean);
    setVisible(true);
    // Reset meta immediately so we don't show old track info
    setMeta({ title: "Loading Track..." });

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
      w.getCurrentSound((snd: any) => {
        if (snd) {
          setMeta({
            title: snd.title,
            permalink_url: snd.permalink_url,
            artwork_url: snd.artwork_url,
            user: { username: snd.user?.username },
          });
        }
      });

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
    playUrl: (u: string) => {
      if (widgetRef.current) loadAndPlay(u);
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

        {visible && (
          <div className="fixed bottom-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none animate-slide-up">
            <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-full p-2 pr-6 flex items-center gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] w-full max-w-xl pointer-events-auto ring-1 ring-white/20">
              
              {/* Play/Pause Button */}
              <button
                onClick={api.toggle}
                disabled={!apiReady}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all shadow-lg shadow-purple-500/30"
              >
                {isPlaying ? (
                  <span className="text-xl">⏸</span>
                ) : (
                  <span className="text-xl pl-1">▶</span>
                )}
              </button>

              {/* Info & Progress */}
              <div className="flex-1 min-w-0 flex flex-col justify-center h-full">
                 <div className="flex justify-between items-baseline mb-1">
                   <span className="text-white text-sm font-bold truncate pr-2">
                     {meta.title || "טוען..."}
                   </span>
                   <span className="text-[10px] text-gray-400 font-mono">
                     {formatTime(position)} / {formatTime(duration)}
                   </span>
                 </div>
                 
                 {/* Custom Progress Bar */}
                 <div className="relative w-full h-1.5 bg-gray-700 rounded-full overflow-hidden group cursor-pointer">
                   <div 
                     className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-300"
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

              {/* Close Button */}
              <button
                onClick={() => {
                  setVisible(false);
                  setIsPlaying(false);
                  setMeta({});
                }}
                className="text-gray-400 hover:text-white transition-colors p-2"
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

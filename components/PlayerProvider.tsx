import React from "react";
import Script from "next/script";

// UPDATED TYPE: Now includes state!
type PlayerAPI = {
  playUrl: (url: string) => void;
  toggle: () => void;
  seek: (seconds: number) => void;
  activeUrl: string | null;  // <--- NEW
  isPlaying: boolean;        // <--- NEW
};

const PlayerContext = React.createContext<PlayerAPI>({
  playUrl: () => {},
  toggle: () => {},
  seek: () => {},
  activeUrl: null,
  isPlaying: false,
});

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
      if (pollTimer.current !== null) {
        clearInterval(pollTimer.current);
        pollTimer.current = null;
      }
      pollTimer.current = setInterval(() => {
        w.getPosition((ms: number) => setPosition(Math.round((ms || 0) / 1000)));
        w.getDuration((ms: number) => setDuration(Math.round((ms || 0) / 1000)));
      }, 250);
    }, 250);
  }

  React.useEffect(() => {
    return () => {
      if (pollTimer.current !== null) {
        clearInterval(pollTimer.current);
        pollTimer.current = null;
      }
    };
  }, []);

  const api: PlayerAPI = {
    playUrl: (u: string) => {
      if (!widgetRef.current) return;
      loadAndPlay(u);
    },
    toggle: () => {
      const w = widgetRef.current;
      if (!w) return;
      w.isPaused((paused: boolean) => (paused ? w.play() : w.pause()));
    },
    seek: (seconds: number) => {
      const w = widgetRef.current;
      if (!w) return;
      const clamped = Math.max(0, Math.min(seconds, duration || seconds));
      w.seekTo(clamped * 1000);
      setPosition(clamped);
    },
    // EXPOSE STATE
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
          <div
            className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/60 backdrop-blur"
            dir="ltr"
          >
            <div className="mx-auto max-w-6xl px-3 py-2 flex items-center gap-3 text-white">
              <button
                onClick={api.toggle}
                disabled={!apiReady}
                className="shrink-0 border rounded-xl px-3 py-1 text-xs hover:bg-white/10"
              >
                {isPlaying ? "⏸" : "▶"}
              </button>

              <div className="text-xs tabular-nums text-white/80 shrink-0">
                {formatTime(position)}
              </div>

              <input
                type="range"
                min={0}
                max={Math.max(1, duration)}
                value={Math.min(position, duration)}
                onChange={(e) => api.seek(Number(e.target.value))}
                className="mx-2 w-full accent-purple-500"
              />

              <div className="text-xs tabular-nums text-white/80 shrink-0">
                {formatTime(duration)}
              </div>

              <div className="min-w-0 pl-2">
                <div className="text-xs font-medium truncate">
                  {meta.title || url}
                </div>
              </div>

              <button
                onClick={() => {
                  setVisible(false);
                  setIsPlaying(false);
                  setMeta({});
                }}
                className="ml-1 shrink-0 border rounded-xl px-2 py-1 text-xs hover:bg-white/10"
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

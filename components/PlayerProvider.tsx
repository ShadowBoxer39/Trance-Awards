import React from "react";
import Script from "next/script";

type PlayerAPI = {
  playUrl: (url: string) => void;
  toggle: () => void;
  seek: (seconds: number) => void;
};

const PlayerContext = React.createContext<PlayerAPI>({
  playUrl: () => {},
  toggle: () => {},
  seek: () => {},
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

  // IMPORTANT: this type works in both browser & Node typings
  const pollTimer = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const [apiReady, setApiReady] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [url, setUrl] = React.useState<string | null>(null);

  const [duration, setDuration] = React.useState(0); // seconds
  const [position, setPosition] = React.useState(0); // seconds
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
    const clean = scUrl.split("?")[0]; // drop tracking params
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

    // fetch meta & start polling
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

      // clear previous interval (if any), then start a new one
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

  // cleanup on unmount
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
          <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/60 backdrop-blur">
            <div className="mx-auto max-w-6xl px-3 py-2 flex items-center gap-3 text-white">
              {/* artwork */}
              {meta.artwork_url ? (
                <img
                  src={meta.artwork_url.replace("-large.jpg", "-t300x300.jpg")}
                  alt=""
                  className="w-8 h-8 rounded-md object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-md bg-white/10" />
              )}

              {/* title/artist */}
              <div className="min-w-0">
                <div className="text-xs font-medium truncate">{meta.title || url}</div>
                <div className="text-[11px] text-white/70 truncate">
                  {meta.user?.username || "SoundCloud"}
                </div>
              </div>

              {/* play/pause */}
              <button
                onClick={api.toggle}
                disabled={!apiReady}
                className="shrink-0 border rounded-xl px-3 py-1 text-xs hover:bg-white/10"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? "⏸" : "▶"}
              </button>

              {/* skip -/+ 15s */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => api.seek(position - 15)}
                  className="border rounded-xl px-2 py-1 text-xs hover:bg-white/10"
                  title="חזרה 15 שניות"
                >
                  « 15s
                </button>
                <button
                  onClick={() => api.seek(position + 15)}
                  className="border rounded-xl px-2 py-1 text-xs hover:bg-white/10"
                  title="קדימה 15 שניות"
                >
                  15s »
                </button>
              </div>

              {/* seek slider */}
              <input
                type="range"
                min={0}
                max={Math.max(1, duration)}
                value={Math.min(position, duration)}
                onChange={(e) => api.seek(Number(e.target.value))}
                className="mx-2 w-full"
              />

              {/* time */}
              <div className="text-xs tabular-nums text-white/80">
                {formatTime(position)} / {formatTime(duration)}
              </div>

              {/* open in SC */}
              {meta.permalink_url && (
                <a
                  href={meta.permalink_url}
                  target="_blank"
                  rel="noreferrer"
                  className="border rounded-xl px-3 py-1 text-xs hover:bg-white/10"
                >
                  Open
                </a>
              )}

              {/* close */}
              <button
                onClick={() => {
                  setVisible(false);
                  setIsPlaying(false);
                  setMeta({});
                  setDuration(0);
                  setPosition(0);
                  if (pollTimer.current !== null) {
                    clearInterval(pollTimer.current);
                    pollTimer.current = null;
                  }
                }}
                className="ml-1 border rounded-xl px-2 py-1 text-xs hover:bg-white/10"
                title="סגור נגן"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Hidden SC widget iframe (stable src; we swap tracks via widget.load) */}
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

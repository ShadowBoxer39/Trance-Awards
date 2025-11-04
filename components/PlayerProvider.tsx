import React from "react";
import Script from "next/script";

type PlayerAPI = {
  playUrl: (url: string) => void;
  toggle: () => void;
};

const PlayerContext = React.createContext<PlayerAPI>({
  playUrl: () => {},
  toggle: () => {},
});

export const usePlayer = () => React.useContext(PlayerContext);

export default function PlayerProvider({ children }: { children: React.ReactNode }) {
  const iframeRef = React.useRef<HTMLIFrameElement | null>(null);
  const widgetRef = React.useRef<any>(null);
  const [barVisible, setBarVisible] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentUrl, setCurrentUrl] = React.useState<string | null>(null);
  const [apiReady, setApiReady] = React.useState(false);

  // Init widget once SC script is ready
  function setupWidget() {
    if (!iframeRef.current) return;
    // @ts-ignore
    if (!(window as any).SC || !(window as any).SC.Widget) return;
    // @ts-ignore
    const w = (window as any).SC.Widget(iframeRef.current);
    widgetRef.current = w;
    setApiReady(true);

    w.bind("play", () => setIsPlaying(true));
    w.bind("pause", () => setIsPlaying(false));
    w.bind("finish", () => setIsPlaying(false));
  }

  const value: PlayerAPI = {
    playUrl: (url: string) => {
      setCurrentUrl(url);
      setBarVisible(true);
      if (widgetRef.current) {
        widgetRef.current.load(url, {
          auto_play: true,
          visual: false,
          show_user: false,
          show_comments: false,
          show_teaser: false,
          show_reposts: false,
          hide_related: true,
        });
      }
    },
    toggle: () => {
      const w = widgetRef.current;
      if (!w) return;
      // There’s no "toggle" method; query paused state then play/pause
      w.isPaused((paused: boolean) => {
        if (paused) w.play();
        else w.pause();
      });
    },
  };

  return (
    <>
      <Script
        src="https://w.soundcloud.com/player/api.js"
        strategy="afterInteractive"
        onLoad={setupWidget}
      />

      <PlayerContext.Provider value={value}>
        {children}

        {barVisible && (
          <div className="fixed bottom-0 left-0 right-0 bg-black/60 backdrop-blur text-white border-t border-white/10 z-50">
            <div className="max-w-5xl mx-auto flex items-center gap-3 p-2">
              <button
                className="border rounded-xl px-3 py-1 text-xs"
                onClick={value.toggle}
                disabled={!apiReady}
              >
                {isPlaying ? "⏸ Pause" : "▶ Play"}
              </button>
              <span className="text-xs opacity-70 truncate">
                {currentUrl ?? ""}
              </span>
            </div>
          </div>
        )}

        {/* Hidden SoundCloud player iframe.
            Important: keep a stable player URL; we use widget.load(...) to change tracks */}
        <iframe
          ref={iframeRef}
          allow="autoplay"
          title="SoundCloud Player"
          className="fixed -bottom-[2000px] left-0"
          width="100%"
          height="166"
          src={"https://w.soundcloud.com/player/?url=https://soundcloud.com/stream&auto_play=false&visual=false&show_user=false&show_comments=false&show_reposts=false&hide_related=true"}
        />
      </PlayerContext.Provider>
    </>
  );
}

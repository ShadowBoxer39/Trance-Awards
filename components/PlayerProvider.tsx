import React from "react";
import Script from "next/script";

// Create a context so any button can control the player
const PlayerContext = React.createContext({
  playUrl: (url: string) => {},
});

export const usePlayer = () => React.useContext(PlayerContext);

export default function PlayerProvider({ children }: { children: React.ReactNode }) {
  const iframeRef = React.useRef<HTMLIFrameElement | null>(null);
  const widgetRef = React.useRef<any>(null);
  const [currentUrl, setCurrentUrl] = React.useState<string | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);

  function setupWidget() {
    if (!iframeRef.current || !("SC" in window)) return;
    // @ts-ignore
    const w = (window as any).SC.Widget(iframeRef.current);
    widgetRef.current = w;

    w.bind("play", () => setIsPlaying(true));
    w.bind("pause", () => setIsPlaying(false));
  }

  const value = {
    playUrl: (url: string) => {
      setCurrentUrl(url);
      setTimeout(() => {
        if (widgetRef.current) widgetRef.current.play();
      }, 100);
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

        {/* Floating mini-player bar */}
        {currentUrl && (
          <div className="fixed bottom-0 left-0 right-0 bg-black/60 backdrop-blur text-white border-t border-white/10 z-50">
            <div className="max-w-5xl mx-auto flex items-center gap-3 p-2">
              <button
                onClick={() =>
                  widgetRef.current?.toggle?.() ||
                  (isPlaying ? widgetRef.current?.pause() : widgetRef.current?.play())
                }
                className="border rounded-xl px-3 py-1 text-xs"
              >
                {isPlaying ? "⏸ Pause" : "▶ Play"}
              </button>
              <span className="text-xs opacity-70 truncate">{currentUrl}</span>
            </div>
          </div>
        )}

        {/* Hidden SoundCloud iframe player */}
        <iframe
          ref={iframeRef}
          allow="autoplay"
          className="hidden"
          src={
            currentUrl
              ? `https://w.soundcloud.com/player/?url=${encodeURIComponent(
                  currentUrl
                )}&auto_play=true&hide_related=true&show_comments=false&show_user=false&show_reposts=false&visual=false`
              : "about:blank"
          }
          width="100%"
          height="166"
        />
      </PlayerContext.Provider>
    </>
  );
}

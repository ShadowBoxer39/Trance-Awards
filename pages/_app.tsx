// /pages/_app.tsx
import "../styles/globals.css";
import "../styles/theme.css";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { milkyway, gan } from "../lib/fonts";
import PlayerProvider from "../components/PlayerProvider";
import { trackPageVisit } from "../lib/analytics";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      trackPageVisit(url);
    };

    // Track initial page load
    trackPageVisit(router.pathname);

    // Track route changes
    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  return (
    <main className={`${milkyway.variable} ${gan.variable} font-gan`}>
      <PlayerProvider>
        <Component {...pageProps} />
      </PlayerProvider>
    </main>
  );
}

// /pages/_app.tsx
import "../styles/globals.css";
import "../styles/theme.css";
import type { AppProps } from "next/app";
import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { milkyway, primaryFont } from "../lib/fonts";
import PlayerProvider from "../components/PlayerProvider";
import { trackPageVisit, trackPageExit } from "../lib/analytics";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const visitIdRef = useRef<string | null>(null);

  useEffect(() => {
    // 1. Track initial page load
    visitIdRef.current = trackPageVisit(router.pathname);

    // 2. Track route changes
    const handleRouteChange = (url: string) => {
      // When a route changes, log exit of old page and entry of new page
      if (visitIdRef.current) {
        trackPageExit(visitIdRef.current);
      }
      visitIdRef.current = trackPageVisit(url);
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    // 3. Track browser/tab closing
    const handleBeforeUnload = () => {
      if (visitIdRef.current) {
        trackPageExit(visitIdRef.current);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [router]);

  return (
    <>
      <Head>
        <meta name="google-site-verification" content="FB62yhdwejgL4Mr9ZnDf-owMzfeP2nBoRVoCxXyTsGI" />
      </Head>

      <main className={`${milkyway.variable} ${primaryFont.variable} ${primaryFont.className}`}>
        <PlayerProvider>
          <Component {...pageProps} />
        </PlayerProvider>
      </main>
    </>
  );
}

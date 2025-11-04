// /pages/_app.tsx
import "../styles/globals.css";
import "../styles/theme.css";

import type { AppProps } from "next/app";
import { milkyway, gan } from "../lib/fonts";
import PlayerProvider from "../components/PlayerProvider"; // ← add this

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={`${milkyway.variable} ${gan.variable} font-gan`}>
      <PlayerProvider>
        <Component {...pageProps} />
      </PlayerProvider>
    </main>
  );
}

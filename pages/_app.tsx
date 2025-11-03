import "../styles/globals.css";
import type { AppProps } from "next/app";
import { milkyway, gan } from "../lib/fonts";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={`${milkyway.variable} ${gan.variable} font-gan`}>
      <Component {...pageProps} />
    </main>
  );
}

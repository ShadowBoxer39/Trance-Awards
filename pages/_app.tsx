// pages/_app.tsx
import "../styles/globals.css";            // ⬅️ use relative path
import type { AppProps } from "next/app";
import { milkyway } from "../lib/fonts";   // ⬅️ already relative

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={`${milkyway.variable} font-milkyway`}>
      <Component {...pageProps} />
    </main>
  );
}

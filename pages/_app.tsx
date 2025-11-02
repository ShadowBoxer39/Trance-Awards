// pages/_app.tsx
import type { AppProps } from "next/app";
import "../styles/globals.css";
import { gan, milky } from "../lib/fonts";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className={`${gan.variable} ${milky.variable}`}>
      <Component {...pageProps} />
    </div>
  );
}

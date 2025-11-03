// pages/_app.tsx
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { milkyway } from "@/lib/fonts";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={`${milkyway.variable} font-milkyway`}>
      <Component {...pageProps} />
    </main>
  );
}

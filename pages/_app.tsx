// pages/_app.tsx
import type { AppProps } from "next/app";
import "../styles/globals.css"; // <-- IMPORTANT (use this relative path)

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

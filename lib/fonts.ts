// lib/fonts.ts
import localFont from "next/font/local";

// Note: fonts.ts sits in /lib, so the .ttf is at ./fonts/...
export const milkyway = localFont({
  src: [{ path: "./fonts/Milkyway DEMO.ttf", weight: "400", style: "normal" }],
  display: "swap",
  variable: "--font-milkyway",
});

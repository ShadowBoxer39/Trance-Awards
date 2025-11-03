import localFont from "next/font/local";

export const milkyway = localFont({
  src: [{ path: "./fonts/Milkyway DEMO.ttf", weight: "400", style: "normal" }],
  display: "swap",
  variable: "--font-milkyway",
});

export const gan = localFont({
  src: [{ path: "./fonts/Gan CLM Bold.ttf", weight: "700", style: "normal" }],
  display: "swap",
  variable: "--font-gan",
});

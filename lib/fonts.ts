import localFont from "next/font/local";

// Hebrew — Gan CLM (regular + bold)
export const gan = localFont({
  src: [
    { path: "./fonts/Gan CLM Bold.ttf", weight: "400", style: "normal" },
  ],
  variable: "--font-gan",
  display: "swap",
});

// English — Milky Way (regular)
export const milky = localFont({
  src: [{ path: "./fonts/Milkyway DEMO.ttf", weight: "400", style: "normal" }],
  variable: "--font-milky",
  display: "swap",
});

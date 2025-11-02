import localFont from "next/font/local";

// Hebrew — Gan CLM (regular + bold)
export const gan = localFont({
  src: [
    { path: "./fonts/GanCLM-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/GanCLM-Bold.woff2",    weight: "700", style: "normal" },
  ],
  variable: "--font-gan",
  display: "swap",
});

// English — Milky Way (regular)
export const milky = localFont({
  src: [{ path: "./fonts/MilkyWay-Regular.woff2", weight: "400", style: "normal" }],
  variable: "--font-milky",
  display: "swap",
});

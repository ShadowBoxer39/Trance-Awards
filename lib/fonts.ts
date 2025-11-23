// lib/fonts.ts - UPDATED

import localFont from "next/font/local";
import { Heebo } from "next/font/google"; // <-- NEW: Import Heebo from Google Fonts

export const milkyway = localFont({
  src: [{ path: "./fonts/Milkyway DEMO.ttf", weight: "400", style: "normal" }],
  display: "swap",
  variable: "--font-milkyway",
});

// REMOVED: export const gan = localFont(...)

// NEW: Define Heebo as the primary font
export const heebo = Heebo({ 
    subsets: ['hebrew'], 
    weight: ['300', '400', '500', '700', '900'], // Import all common weights
    variable: '--font-primary', // Use a generic variable name
    display: 'swap',
});

// NOTE: You will need to change references from `gan` to `heebo` in step 2.

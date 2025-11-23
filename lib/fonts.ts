// lib/fonts.ts - UPDATED for Heebo
import localFont from "next/font/local";
import { Heebo } from "next/font/google"; // <-- NEW: Import Heebo from Google Fonts

export const milkyway = localFont({
  src: [{ path: "./fonts/Milkyway DEMO.ttf", weight: "400", style: "normal" }],
  display: "swap",
  variable: "--font-milkyway",
});

// NEW: Define Heebo as the primary font (using the desired name)
export const primaryFont = Heebo({ 
    subsets: ['hebrew'], 
    weight: ['300', '400', '500', '700', '900'], // Import necessary weights
    variable: '--font-primary', 
    display: 'swap',
});

// To ensure full compatibility and avoid export issues, ensure the export name matches the import name.
// The name "primaryFont" is correct here.

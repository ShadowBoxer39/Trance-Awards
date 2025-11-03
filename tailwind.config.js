/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        gan: ["var(--font-gan)", "sans-serif"],
        milkyway: ["var(--font-milkyway)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        pitch: "#000000",
        obsidian: "#0a0f12",
        "surface-low": "#12181c",
        ice: "#7dd3fc",
        "ice-light": "#c5eaff",
        "ice-fixed": "#c0e8ff",
        "ice-text": "#dfe3e7",
        "ice-muted": "#899298",
      },
    },
  },
  plugins: [],
};
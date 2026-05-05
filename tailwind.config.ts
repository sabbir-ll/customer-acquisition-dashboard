import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#080d1a",
        surface: "#0d1526",
        "surface-2": "#111e36",
        border: "#1a2d4a",
        "border-bright": "#243d62",
        fb: "#3b82f6",
        "fb-dim": "#1d4ed8",
        goog: "#22c55e",
        "goog-dim": "#15803d",
        muted: "#475569",
        subtle: "#64748b",
      },
      fontFamily: {
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;

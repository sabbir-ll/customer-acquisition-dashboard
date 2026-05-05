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
        bg:              "#F3FBF8",
        surface:         "#FFFFFF",
        "surface-2":     "#EAF5EE",
        border:          "#C5E5D4",
        "border-bright": "#8DCFB0",
        primary:         "#2DB88A",
        "primary-dark":  "#1A9470",
        "primary-light": "#5DCBA8",
        "text-main":     "#0B2518",
        subtle:          "#5A8A70",
        muted:           "#96B8A6",
        // channel accent colours (kept for charts / dots)
        fb:   "#3b82f6",
        goog: "#22c55e",
      },
    },
  },
  plugins: [],
};

export default config;

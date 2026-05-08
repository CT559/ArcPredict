import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ArcPredict Design System
        arc: {
          bg: "#080B14",
          surface: "#0D1220",
          elevated: "#131929",
          border: "#1E2D4A",
          muted: "#243044",
          // Accent blues
          primary: "#3B82F6",
          "primary-hover": "#2563EB",
          "primary-dim": "#1D3A6B",
          secondary: "#6366F1",
          // Semantic
          yes: "#22C55E",
          "yes-dim": "#14532D",
          no: "#EF4444",
          "no-dim": "#7F1D1D",
          warn: "#F59E0B",
          // Text
          "text-primary": "#F1F5F9",
          "text-secondary": "#94A3B8",
          "text-muted": "#475569",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        "arc-grid":
          "linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px)",
        "arc-glow":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59,130,246,0.15), transparent)",
        "card-shine":
          "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 50%)",
      },
      backgroundSize: {
        grid: "40px 40px",
      },
      boxShadow: {
        "arc-card": "0 0 0 1px rgba(30,45,74,0.8), 0 4px 24px rgba(0,0,0,0.4)",
        "arc-glow": "0 0 24px rgba(59,130,246,0.25)",
        "arc-yes": "0 0 16px rgba(34,197,94,0.2)",
        "arc-no": "0 0 16px rgba(239,68,68,0.2)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 2s linear infinite",
        "fade-up": "fadeUp 0.4s ease-out forwards",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

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
      fontFamily: {
        sans: ["var(--font-outfit)", "sans-serif"],
        display: ["var(--font-syne)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      colors: {
        gold: {
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
        },
        teal: {
          300: "#5EEAD4",
          400: "#2DD4BF",
          500: "#14B8A6",
        },
        cyan: {
          300: "#67E8F9",
          400: "#22D3EE",
          500: "#06B6D4",
          600: "#0891B2",
        },
        arc: {
          bg: "#050B18",
          surface: "#0A1628",
          card: "#0F1E38",
          border: "#1A2F52",
          muted: "#243A5E",
        },
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)",
        "cyan-gradient": "linear-gradient(135deg, #22D3EE 0%, #0891B2 100%)",
        "hero-gradient": "radial-gradient(ellipse at 20% 50%, rgba(251,191,36,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(34,211,238,0.12) 0%, transparent 60%)",
        "card-gradient": "linear-gradient(135deg, rgba(15,30,56,0.9) 0%, rgba(10,22,40,0.95) 100%)",
        "mesh-gradient": "radial-gradient(at 27% 37%, #0F1E38 0px, transparent 50%), radial-gradient(at 97% 21%, rgba(251,191,36,0.08) 0px, transparent 50%), radial-gradient(at 52% 99%, rgba(34,211,238,0.08) 0px, transparent 50%)",
      },
      boxShadow: {
        gold: "0 0 30px rgba(251,191,36,0.3)",
        "gold-sm": "0 0 15px rgba(251,191,36,0.2)",
        cyan: "0 0 30px rgba(34,211,238,0.3)",
        "cyan-sm": "0 0 15px rgba(34,211,238,0.2)",
        card: "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
        "card-hover": "0 8px 40px rgba(0,0,0,0.5), 0 0 20px rgba(251,191,36,0.1), inset 0 1px 0 rgba(255,255,255,0.08)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "ticker": "ticker 30s linear infinite",
      },
      keyframes: {
        glow: {
          from: { boxShadow: "0 0 10px rgba(251,191,36,0.2)" },
          to: { boxShadow: "0 0 30px rgba(251,191,36,0.5)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};

export default config;

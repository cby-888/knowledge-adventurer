import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // RPG + 科幻 深色主题
        ink: {
          900: "#0a0e1a",
          800: "#111827",
          700: "#1a2233",
        },
        neon: {
          DEFAULT: "#22d3ee",
          purple: "#a78bfa",
          green: "#34d399",
          gold: "#fbbf24",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(34, 211, 238, 0.25)",
        "glow-purple": "0 0 20px rgba(167, 139, 250, 0.25)",
      },
      animation: {
        "float-slow": "float 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

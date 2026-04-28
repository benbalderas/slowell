/** @type {import('tailwindcss').Config} */
const { fontFamily } = require("tailwindcss/defaultTheme");

module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "var(--color-surface)",
          raised: "var(--color-surface-raised)",
          deep: "var(--color-surface-deep)",
        },
        ink: {
          DEFAULT: "var(--color-ink)",
          secondary: "var(--color-ink-secondary)",
        },
        accent: {
          DEFAULT: "#D3FB67",
          text: "#000000",
        },
        destructive: {
          DEFAULT: "#FB7667",
          text: "#FFFFFF",
        },
      },
      fontFamily: {
        sans: ["var(--font-neue-montreal)", ...fontFamily.sans],
        bit: ["var(--font-neue-bit)", "monospace"],
      },
      fontSize: {
        xs: ["11px", { lineHeight: "1.4" }],
        sm: ["13px", { lineHeight: "1.4" }],
        base: ["15px", { lineHeight: "1.5" }],
        lg: ["17px", { lineHeight: "1.4" }],
        xl: ["22px", { lineHeight: "1.2" }],
        "2xl": ["28px", { lineHeight: "1.1" }],
        display: ["48px", { lineHeight: "1.0" }],
      },
      borderRadius: {
        sm: "8px",
        md: "14px",
        lg: "20px",
        full: "9999px",
      },
      spacing: {
        1: "4px",
        2: "8px",
        3: "12px",
        4: "16px",
        5: "20px",
        6: "24px",
        8: "32px",
        10: "40px",
        12: "48px",
        16: "64px",
      },
      boxShadow: {
        subtle: "0 2px 12px rgba(0, 0, 0, 0.06)",
        none: "none",
      },
      keyframes: {
        "skeleton-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
      },
      animation: {
        "skeleton-pulse": "skeleton-pulse 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

import type { Config } from "tailwindcss";

/**
 * Alle kleuren verwijzen naar de tokens in app/globals.css.
 * Nooit hardcoded hex in componenten — gebruik deze schaal.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "rgb(var(--paper-rgb) / <alpha-value>)",
        ink: "rgb(var(--ink-rgb) / <alpha-value>)",
        glass: "rgb(var(--glass-rgb) / <alpha-value>)",
        grad: {
          1: "rgb(var(--grad-1-rgb) / <alpha-value>)",
          2: "rgb(var(--grad-2-rgb) / <alpha-value>)",
          3: "rgb(var(--grad-3-rgb) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["Satoshi", "var(--font-fallback)", "system-ui", "sans-serif"],
      },
      fontSize: {
        display: ["clamp(2.6rem, 1.4rem + 4.2vw, 5.2rem)", { lineHeight: "0.95", letterSpacing: "-0.05em" }],
        title: ["clamp(2rem, 1.3rem + 2.4vw, 3.4rem)", { lineHeight: "1.02", letterSpacing: "-0.04em" }],
        lede: ["clamp(1.05rem, 0.98rem + 0.4vw, 1.3rem)", { lineHeight: "1.55", letterSpacing: "-0.01em" }],
      },
      borderRadius: {
        card: "var(--radius-card)",
        pill: "var(--radius-pill)",
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        lift: "var(--shadow-lift)",
      },
      backgroundImage: {
        merk: "linear-gradient(100deg, rgb(var(--grad-1-rgb)), rgb(var(--grad-2-rgb)), rgb(var(--grad-3-rgb)))",
      },
      maxWidth: {
        shell: "76rem",
      },
    },
  },
  plugins: [],
};

export default config;

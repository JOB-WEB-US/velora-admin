import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        admin: {
          bg: "#f8fafc",        // Light background (slate-50)
          card: "#ffffff",      // White card background
          border: "#e2e8f0",    // Soft border (slate-200)
          hover: "#f1f5f9",     // Hover state (slate-100)
          accent: "#2563eb",    // Vibrant primary blue (blue-600)
          "accent-hover": "#1d4ed8",
          text: "#0f172a",      // High-contrast dark text (slate-900)
          muted: "#64748b",     // Muted text (slate-500)
          success: "#059669",
          warning: "#d97706",
          danger: "#dc2626",
          purple: "#7c3aed",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;

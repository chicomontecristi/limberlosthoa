import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Designed for 65+ legibility — high contrast, no light grays on white.
        ink: "#0F1B2D",        // body text
        primary: "#1F3A5F",    // navy — buttons, headings
        primaryHover: "#0F1B2D",
        accent: "#C19A4B",     // warm gold accent
        surface: "#FFFFFF",
        surfaceAlt: "#F5F7FA",
        success: "#1B5E20",    // dues paid
        warn: "#B45309",       // dues pending
        danger: "#991B1B",     // dues due
        border: "#CBD5E1",
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      fontSize: {
        // Override Tailwind defaults — bumped one step for 65+ readability.
        base: ["1.25rem", { lineHeight: "1.65" }],      // 20px
        lg: ["1.375rem", { lineHeight: "1.6" }],         // 22px
        xl: ["1.625rem", { lineHeight: "1.5" }],         // 26px
        "2xl": ["2rem", { lineHeight: "1.4" }],          // 32px
        "3xl": ["2.5rem", { lineHeight: "1.3" }],        // 40px
        "4xl": ["3.25rem", { lineHeight: "1.2" }],       // 52px
      },
      spacing: {
        "touch": "3rem",  // 48px minimum tap target
      },
      borderRadius: {
        DEFAULT: "0.5rem",
      },
    },
  },
  plugins: [],
};
export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: "#0a0a0a",
          light: "#141414",
          lighter: "#1c1c1c",
        },
        gold: {
          DEFAULT: "#c9a84c",
          light: "#e2c97e",
          dark: "#a08333",
          muted: "rgba(201, 168, 76, 0.15)",
        },
        crimson: {
          DEFAULT: "#8b1a1a",
          light: "#b22222",
          dark: "#5c1010",
          muted: "rgba(139, 26, 26, 0.15)",
        },
        cream: {
          DEFAULT: "#f0ece0",
          dim: "#b8b4a8",
          dark: "#8a8578",
        },
      },
      fontFamily: {
        heading: ['"Cormorant Garamond"', "Georgia", "serif"],
        body: ['"DM Sans"', "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #e2c97e, #c9a84c, #a08333)",
        "gold-gradient-h": "linear-gradient(90deg, #e2c97e, #c9a84c, #a08333)",
        "crimson-gradient": "linear-gradient(135deg, #b22222, #8b1a1a, #5c1010)",
      },
      boxShadow: {
        "glow-gold": "0 0 20px rgba(201, 168, 76, 0.3), 0 0 60px rgba(201, 168, 76, 0.1)",
        "glow-gold-sm": "0 0 10px rgba(201, 168, 76, 0.2)",
        "glow-gold-lg": "0 0 40px rgba(201, 168, 76, 0.4), 0 0 80px rgba(201, 168, 76, 0.15)",
        "glow-crimson": "0 0 20px rgba(139, 26, 26, 0.4), 0 0 60px rgba(139, 26, 26, 0.15)",
        "glow-crimson-sm": "0 0 10px rgba(139, 26, 26, 0.3)",
      },
    },
  },
  plugins: [],
};
export default config;

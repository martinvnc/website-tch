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
        background: "var(--background)",
        foreground: "var(--foreground)",
        green: {
          900: "#1a2e1c",
          800: "#2d4a30",
          600: "#4c7650",
          500: "#639268",
        },
        yellow: {
          DEFAULT: "#f6ca73",
          400: "#f6ca73",
        },
        "off-white": "#f7f5f0",
      },
      fontFamily: {
        sans: ["var(--font-quicksand)", "sans-serif"],
        display: ["var(--font-dm-serif)", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;

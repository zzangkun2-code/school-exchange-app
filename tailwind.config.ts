import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        mint: {
          50: "#effdf8",
          100: "#d7f8ee",
          200: "#aef0de",
          500: "#42c7a6",
          700: "#16846f"
        },
        skysoft: {
          50: "#f0f8ff",
          100: "#dceeff",
          200: "#b7dcff",
          500: "#62aef4",
          700: "#246fac"
        },
        peach: {
          50: "#fff7ed",
          100: "#ffead1",
          200: "#ffd1a3",
          500: "#fb9b5f",
          700: "#c86124"
        },
        pinkwarm: {
          50: "#fff5fa",
          100: "#ffe4f0",
          200: "#ffc5dd",
          500: "#ef6fa5",
          700: "#bc326d"
        },
        ink: {
          700: "#334155",
          900: "#172033"
        }
      },
      boxShadow: {
        soft: "0 12px 30px rgba(47, 84, 120, 0.12)",
        lift: "0 18px 40px rgba(47, 84, 120, 0.18)"
      },
      borderRadius: {
        card: "8px"
      },
      fontFamily: {
        sans: [
          "Pretendard",
          "ui-sans-serif",
          "system-ui",
          "Apple SD Gothic Neo",
          "Malgun Gothic",
          "Segoe UI",
          "sans-serif"
        ]
      }
    }
  },
  plugins: []
};

export default config;

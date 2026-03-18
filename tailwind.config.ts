import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ember: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12"
        },
        abyss: {
          900: "#0b1022",
          800: "#121933",
          700: "#1b2450"
        }
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        text: ["'Manrope'", "sans-serif"]
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(251,146,60,0.35), 0 10px 30px rgba(249,115,22,0.25)"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" }
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.45" },
          "50%": { opacity: "0.95" }
        }
      },
      animation: {
        float: "float 5s ease-in-out infinite",
        pulseSoft: "pulseSoft 3s ease-in-out infinite"
      }
    }
  },
  plugins: [],
} satisfies Config;

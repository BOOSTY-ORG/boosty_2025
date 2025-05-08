/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        eq: "equalize 0.8s ease-in-out infinite",
      },
      keyframes: {
        pulse: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
        equalize: {
          "0%, 100%": { height: "var(--base-height)" },
          "50%": { height: "calc(var(--base-height) * 1.3)" },
        },
      },
      fontFamily: {
        openSans: ["Open Sans", "serif"],
      },
      colors: {
        boosty_yellow: "#F3B921E0",
        boosty_green: "#374646",
        body_text: "#2B2D2C",
        body_text_secondary: "#3D3E3E",
        btn_text: "#F5C13C",
      },
      screens: {
        ipad: "820px",
      },
    },
  },
  plugins: [],
};

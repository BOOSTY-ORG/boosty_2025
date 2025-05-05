/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
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

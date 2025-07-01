/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        boostyYellow: "#F5C13C",
        boostyBlack: "#202D2D",
        boostyLightGray: "#E8F2F2",
        boostyCTABG: "#F3F8F8",
        boostyFooterTxt: "#F3B921",
        boostyFooterBG: "#374646",
      },
      fontFamily: {
        openSans: ["Open Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};

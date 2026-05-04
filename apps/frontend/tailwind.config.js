/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ["Montserrat", "sans-serif"],
        openSans: ["Open Sans", "sans-serif"],
      },
      colors: {
        primary: "#F28C28",
        secondary: "#2D6A4F",
        success: "#27AE60",
        error: "#E74C3C",
        info: "#3B82F6",
        warning: "#EAB308",
        admin: "#7E22CE",
        bgapp: "#FDFCF8",
      },
    },
  },
  plugins: [],
};

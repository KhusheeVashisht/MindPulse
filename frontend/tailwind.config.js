/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#14213d",
        sand: "#f7f3eb",
        ember: "#d97706",
        mint: "#7dd3a7",
        blush: "#f4b6a8",
      },
      fontFamily: {
        display: ["Poppins", "ui-sans-serif", "system-ui"],
        body: ["Manrope", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        panel: "0 24px 60px rgba(20, 33, 61, 0.12)",
      },
    },
  },
  plugins: [],
};

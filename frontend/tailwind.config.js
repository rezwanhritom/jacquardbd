import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Trojan Pro"'],
      },
      colors: {
        customBlack: "#09090B",
        lightBlack: "#171618",
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: ["luxury", "forest"],
  },
};

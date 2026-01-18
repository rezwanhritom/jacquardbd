import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
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

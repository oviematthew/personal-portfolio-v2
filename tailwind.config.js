// tailwind.config.js
import plugin from "tailwindcss/plugin";

export const content = [
  "./app/**/*.{js,ts,jsx,tsx}",
  "./components/**/*.{js,ts,jsx,tsx}",
  "./pages/**/*.{js,ts,jsx,tsx}",
];
export const theme = {
  extend: {
    colors: {
      brand: "#F15A24",
    },
  },
};
export const plugins = [];

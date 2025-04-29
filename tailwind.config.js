/** @type {import('tailwindcss').Config} */
export const content = [
  "./pages/**/*.{js,ts,jsx,tsx}",
  "./components/**/*.{js,ts,jsx,tsx}",
  "./app/**/*.{js,ts,jsx,tsx}",
];
export const theme = {
  extend: {
    fontFamily: {
      lato: ["var(--font-lato)", "serif"],
      montserrat: ["var(--font-montserrat)", "serif"],
      quicksand: ["var(--font-quicksand)", "sans-serif"],
    },
  },
};
export const plugins = [];

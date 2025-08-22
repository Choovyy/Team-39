/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        peach: "#F5B57F",
        teal: "#323C47",
        brown: "#47323C",
        maroon: "#88343B",
        blue: "#566C82",
      },
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
};

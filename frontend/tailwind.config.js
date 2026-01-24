/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0F766E', // Dark turquoise
        secondary: '#14B8A6', // Turquoise
        white: '#FFFFFF',
      },
    },
  },
  plugins: [],
}

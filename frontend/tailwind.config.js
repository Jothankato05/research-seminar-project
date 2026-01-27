/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1B5E20', // Veritas Academic Green
        secondary: '#0D47A1', // Navy Blue (Security/Trust)
        accent: '#F9A825', // Gold (Excellence)
        white: '#FFFFFF',
      },
    },
  },
  plugins: [],
}

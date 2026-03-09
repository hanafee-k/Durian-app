/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'durian-green': '#4CAF50', // สีธีมเขียวทุเรียน
        'durian-dark': '#2E7D32',
      }
    },
  },
  plugins: [],
}
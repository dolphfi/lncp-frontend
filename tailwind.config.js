/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary': '#F5F7FA',
        'secondary': '#1E90FF',
        'dark': '#1A1A1A',
      }
    },
  },
  plugins: [],
}

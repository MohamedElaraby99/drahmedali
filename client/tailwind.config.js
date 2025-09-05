/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Lemonada', 'cursive'],
        'lemonada': ['Lemonada', 'cursive'],
        'inter': ['Inter', 'sans-serif'],
        'lato': ['Lato', 'sans-serif'],
        'nunito-sans': ['Nunito Sans', 'sans-serif'],
        'open-sans': ['Open Sans', 'sans-serif'],
        'roboto': ['Roboto', 'sans-serif'],
      },
      colors: {
        'input-bg': '#ffffff',
        'input-text': '#000000',
        'input-border': '#d1d5db',
      },
      fontWeight: {
        'lemonada-light': '300',
        'lemonada-regular': '400',
        'lemonada-medium': '500',
        'lemonada-semibold': '600',
        'lemonada-bold': '700',
      }
    },
  },
  darkMode: 'class',
  plugins: [require('daisyui')],
}
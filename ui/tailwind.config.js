const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f3faf8',
          100: '#d5f2e7',
          200: '#ace3d0',
          300: '#7aceb4',
          400: '#4eb396',
          500: '#35977d',
          600: '#267360',
          700: '#246153',
          800: '#204f45',
          900: '#1f423a',
          950: '#0d2622',
        },
        gray: colors.neutral,
      },
    },
  },
  plugins: [],
};

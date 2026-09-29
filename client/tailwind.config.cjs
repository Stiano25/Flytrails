const path = require('path');

/** @type {import('tailwindcss').Config} */
// Paths must be anchored to this file: Vite's cwd is the repo root, so relative globs would scan ./src instead of ./client/src.
module.exports = {
  content: [
    path.join(__dirname, 'index.html'),
    path.join(__dirname, 'src', '**', '*.{js,jsx}'),
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1B4332',
        accent: '#D4A96A',
        'brand-dark': '#0D1B2A',
        'brand-light': '#FFFFFF',
        'brand-bg': '#F8F5F0',
        /** Orange from the Flytrails logo; pair with brand-dark text for contrast. */
        'brand-orange': '#EE921E',
      },
      fontFamily: {
        /** Site typeface: Poppins, self-hosted in /public/fonts (Helvetica stack as fallback). */
        sans: ['Poppins', '"Helvetica Neue"', 'Helvetica', 'Arial', 'system-ui', 'sans-serif'],
        display: ['Poppins', '"Helvetica Neue"', 'Helvetica', 'Arial', 'system-ui', 'sans-serif'],
        /** Hero word "Adventures": MonteCarlo script, self-hosted. */
        script: ['MonteCarlo', '"Brush Script MT"', 'cursive'],
      },
      keyframes: {
        /** Opacity only: a lingering transform would turn the page wrapper into the containing block for
         *  position: fixed children (sticky booking bars) and pin them to the page instead of the screen. */
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.35s ease-out forwards',
      },
    },
  },
  plugins: [],
};

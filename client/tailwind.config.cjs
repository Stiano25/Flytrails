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
      },
      fontFamily: {
        /** Site typeface: Inter, self-hosted variable font in /public/fonts (Helvetica stack as fallback). */
        sans: ['Inter', '"Helvetica Neue"', 'Helvetica', 'Arial', 'system-ui', 'sans-serif'],
        display: ['Inter', '"Helvetica Neue"', 'Helvetica', 'Arial', 'system-ui', 'sans-serif'],
        inter: ['Inter', '"Helvetica Neue"', 'Helvetica', 'Arial', 'system-ui', 'sans-serif'],
        /** Headline face: tall condensed Oswald for the hero word and section titles */
        headline: ['Oswald', '"Arial Narrow"', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.35s ease-out forwards',
      },
    },
  },
  plugins: [],
};

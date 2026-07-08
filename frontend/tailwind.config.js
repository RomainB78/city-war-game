/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        chatou: {
          light: '#3b82f6',
          DEFAULT: '#1d4ed8',
          dark: '#1e3a8a',
        },
        imperiale: {
          light: '#f87171',
          DEFAULT: '#b91c1c',
          dark: '#7f1d1d',
        },
        gold: {
          light: '#fcd34d',
          DEFAULT: '#d97706',
          dark: '#b45309',
        },
      },
    },
  },
  plugins: [],
}

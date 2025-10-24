/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'princess-peach': '#F9C6B0',    // soft peach
        'princess-lavender': '#E6D7FF', // gentle lavender
        'princess-cream': '#FFF6E5',    // pale cream
        'princess-rose': '#FFD1DC',     // blush pink
        'princess-sky': '#C7E8F3',      // baby blue
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

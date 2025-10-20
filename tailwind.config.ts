import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: ['./src/app/**/*.{ts,tsx}', './src/components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        princess: {
          peach: '#FFD1C2',
          cream: '#FFF4E6',
          lavender: '#E8D8FF',
          rose: '#F7A7A7',
          mint: '#BDE6C3',
          honey: '#FFE083',
          lilac: '#D1B3FF'
        }
      },
      borderRadius: { xl: '1rem', '2xl': '1.25rem' }
    }
  },
  plugins: []
} satisfies Config;

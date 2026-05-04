import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        eem: {
          red: '#ff5757',
          'red-soft': '#ff7a7a',
          'red-deep': '#e64545',
          'red-tint': '#fff0f0',
          dark: '#252424',
          'dark-soft': '#3d3c3c',
          grey: '#cbcfcf',
          'grey-50': 'rgba(203,207,207,0.5)',
          'grey-15': 'rgba(203,207,207,0.18)',
          bg: '#f7f5f3',
          line: 'rgba(37,36,36,0.08)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;

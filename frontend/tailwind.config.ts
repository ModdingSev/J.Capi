import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#CC0000',
          50: '#FFF0F0',
          100: '#FFDDDD',
          200: '#FFC0C0',
          300: '#FF9494',
          400: '#FF5757',
          500: '#FF2323',
          600: '#FF0000',
          700: '#CC0000',
          800: '#A80000',
          900: '#8B0000',
          950: '#4B0000',
        },
        background: '#F4F2EE',
        surface: '#FFFFFF',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      screens: {
        xs: '480px',
      },
      boxShadow: {
        card: '0 2px 8px 0 rgba(0,0,0,0.08)',
        'card-hover': '0 8px 24px 0 rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
};

export default config;

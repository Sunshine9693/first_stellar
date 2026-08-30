/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        stellar: {
          50: '#f0f5ff',
          100: '#e0ebff',
          200: '#b8d2fe',
          300: '#75a8fd',
          400: '#2b78f9',
          500: '#0657e8',
          600: '#003ecc',
          700: '#002fa8',
          800: '#052787',
          900: '#0a226c',
          950: '#061343',
        },
        cosmic: {
          bg: '#090b14',
          card: 'rgba(17, 24, 39, 0.75)',
          border: 'rgba(255, 255, 255, 0.1)',
          glow: 'rgba(99, 102, 241, 0.15)',
        }
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 15px rgba(59, 130, 246, 0.3)' },
          '100%': { boxShadow: '0 0 30px rgba(147, 51, 234, 0.5)' },
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}

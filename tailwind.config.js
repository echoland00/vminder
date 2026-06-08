/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#EEF2FF',
          100: '#E0E7FF',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
        }
      },
      animation: {
        'pulse-ring': 'pulse-ring 1.4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in':    'fade-in 0.2s ease-out',
        'slide-up':   'slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        'pulse-ring': {
          '0%, 100%': { transform: 'scale(1)',   opacity: '1' },
          '50%':      { transform: 'scale(1.1)', opacity: '0.7' },
        },
        'fade-in':    { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'slide-up':   { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
      }
    },
  },
  plugins: [],
}

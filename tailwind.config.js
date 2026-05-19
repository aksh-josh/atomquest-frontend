/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      colors: {
        ink: {
          900: '#0A0A0F',
          800: '#12121A',
          700: '#1C1C28',
          600: '#252535',
          500: '#35354A',
        },
        volt: {
          DEFAULT: '#C8F135',
          dark: '#A8CC1A',
          light: '#DEFF6E',
        },
        slate: {
          soft: '#E8E8F0',
          mid: '#9999B3',
          dim: '#5A5A78',
        },
        danger: '#FF4D6D',
        warn: '#FFB547',
        info: '#47B8FF',
        success: '#4DFFB4',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'volt': '0 0 30px rgba(200,241,53,0.25)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
        'glow': '0 0 60px rgba(200,241,53,0.15)',
      },
      animation: {
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1)',
        'fade-in': 'fadeIn 0.3s ease',
        'pulse-volt': 'pulseVolt 2s infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        pulseVolt: {
          '0%,100%': { boxShadow: '0 0 20px rgba(200,241,53,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(200,241,53,0.6)' },
        },
      },
    },
  },
  plugins: [],
}

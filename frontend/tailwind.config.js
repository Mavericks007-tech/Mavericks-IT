/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        'deep-space': '#0A0A0F',
        'midnight-navy': '#0F172A',
        'midnight-elevated': '#1E293B',
        'soft-gray': '#94A3B8',
        'electric-cyan': '#00D9FF',
        'plasma-blue': '#0066FF',
        'aurora-green': '#00FF88',
        'sunset-orange': '#FF6B35',
        'crimson-red': '#FF3366',
      },
      fontFamily: {
        display: ['ClashDisplay', 'CabinetGrotesk', 'system-ui', 'sans-serif'],
        body: ['Satoshi', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrainsMono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        h1: ['clamp(2.5rem, 5vw + 1rem, 4.5rem)', { lineHeight: '1.1', fontWeight: '700' }],
        h2: ['clamp(2rem, 4vw + 1rem, 3.5rem)', { lineHeight: '1.15', fontWeight: '700' }],
        h3: ['clamp(1.75rem, 3vw + 0.5rem, 2.5rem)', { lineHeight: '1.2', fontWeight: '600' }],
        h4: ['clamp(1.375rem, 2vw + 0.5rem, 1.75rem)', { lineHeight: '1.3', fontWeight: '600' }],
        'body-lg': ['clamp(1.125rem, 0.5vw + 1rem, 1.25rem)', { lineHeight: '1.6', fontWeight: '400' }],
      },
      spacing: {
        xs: '0.5rem',
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
        xl: '3rem',
        '2xl': '4rem',
        '3xl': '6rem',
        '4xl': '8rem',
      },
      backgroundColor: {
        'surface': 'rgba(15, 23, 42, 1)',
        'surface-elevated': 'rgba(30, 41, 59, 1)',
        'surface-deep': 'rgba(51, 51, 123, 1)',
      },
      animation: {
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 8s ease infinite',
        'spin-slow': 'spin 20s linear infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { opacity: '0.4', filter: 'blur(40px)' },
          '50%': { opacity: '0.8', filter: 'blur(60px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      boxShadow: {
        'glow-cyan': '0 0 40px rgba(0, 217, 255, 0.4)',
        'glow-cyan-lg': '0 0 80px rgba(0, 217, 255, 0.6)',
        'glow-blue': '0 0 40px rgba(0, 102, 255, 0.4)',
        'inner-glow': 'inset 0 0 20px rgba(0, 217, 255, 0.2)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

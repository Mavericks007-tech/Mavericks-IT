/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'deep-space': '#0A0A0F',
        'midnight-navy': '#0F172A',
        'pure-white': '#FFFFFF',
        'soft-gray': '#94A3B8',
        'electric-cyan': '#00D9FF',
        'plasma-blue': '#0066FF',
        'aurora-green': '#00FF88',
        'sunset-orange': '#FF6B35',
        'crimson-red': '#FF3366',
      },
      fontFamily: {
        'clash': ['Clash Display', 'sans-serif'],
        'satoshi': ['Satoshi', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}

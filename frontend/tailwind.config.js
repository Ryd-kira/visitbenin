// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Palette VisitBénin
        or:        { DEFAULT: '#C8922A', light: '#F0C878', dark: '#8B6510' },
        terracotta:{ DEFAULT: '#C4501E', light: '#E87050', dark: '#8B2500' },
        vert:      { DEFAULT: '#3A6B47', light: '#5A9B67', dark: '#1B4332' },
        nuit:      { DEFAULT: '#0E0A06', soft: '#1C1208' },
        sable:     { DEFAULT: '#F5EDD6', light: '#FBF6EC', dark: '#E8D8B0' },
        brun:      { DEFAULT: '#3D2B10', light: '#7A5C30' },
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body:    ['DM Sans', 'system-ui', 'sans-serif'],
        mono:    ['Bebas Neue', 'sans-serif'],
      },
      animation: {
        'fade-up':   'fadeUp 0.6s ease both',
        'fade-in':   'fadeIn 0.4s ease both',
        'slow-zoom': 'slowZoom 8s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeUp:   { from: { opacity: 0, transform: 'translateY(24px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:   { from: { opacity: 0 }, to: { opacity: 1 } },
        slowZoom: { from: { transform: 'scale(1)' }, to: { transform: 'scale(1.06)' } },
      },
    },
  },
  plugins: [],
}

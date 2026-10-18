/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        atelier: {
          espresso: '#11100f',
          stone: '#171412',
          surface: '#1c1917',
          raised: '#24201d',
          parchment: '#29231e',
          border: '#38312b',
          'border-subtle': '#2a2420',
          crimson: '#991b1b',
          'crimson-deep': '#7f1d1d',
          terracotta: '#c2410c',
          amber: '#b45309',
          gold: '#d97706',
          bronze: '#78350f',
          muted: '#a8a29e',
        },
        'stone-surface': '#1c1917',
        'stone-surface-raised': '#24201d',
        'stone-parchment': '#29231e',
        'stone-border': '#38312b',
        'stone-border-subtle': '#2a2420',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'Cambria', 'serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'tactile-card': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.07), 0 16px 36px -6px rgba(0, 0, 0, 0.75)',
        'tactile-raised': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1), 0 20px 40px -10px rgba(0, 0, 0, 0.85)',
        'tactile-recessed': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.65)',
        'tactile-button': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.12), 0 4px 14px rgba(0, 0, 0, 0.6)',
        'crimson-glow': '0 0 24px -4px rgba(153, 27, 27, 0.45)',
        'amber-glow': '0 0 24px -4px rgba(180, 83, 9, 0.35)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};

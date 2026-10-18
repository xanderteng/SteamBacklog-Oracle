/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#06080d',
          900: '#0a0d14',
          850: '#0e121c',
          800: '#121824',
          750: '#171f30',
          700: '#1c263c',
          600: '#283654',
        },
        neon: {
          cyan: '#06b6d4',
          indigo: '#6366f1',
          amber: '#f59e0b',
          crimson: '#ef4444',
          emerald: '#10b981',
          violet: '#8b5cf6',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        display: ['"Rajdhani"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -3px rgba(6, 182, 212, 0.45)',
        'glow-amber': '0 0 20px -3px rgba(245, 158, 11, 0.45)',
        'glow-crimson': '0 0 20px -3px rgba(239, 68, 68, 0.45)',
        'glow-indigo': '0 0 20px -3px rgba(99, 102, 241, 0.45)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};

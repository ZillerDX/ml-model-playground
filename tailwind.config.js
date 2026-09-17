/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ground: 'var(--color-ground)',
        surface: {
          DEFAULT: 'var(--color-surface)',
          subtle: 'var(--color-surface-subtle)',
          hover: 'var(--color-surface-hover)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          focus: '#3F72AF',
        },
        ink: {
          primary: 'var(--color-ink-primary)',
          secondary: 'var(--color-ink-secondary)',
          muted: 'var(--color-ink-muted)',
        },
        palette: {
          lightBg: '#F9F7F7',
          iceBlue: '#DBE2EF',
          blue: '#3F72AF',
          navy: '#112D4E',
        },
        accent: {
          blue: '#3F72AF',
          blueHover: '#4d82c2',
          navy: '#112D4E',
          ice: '#DBE2EF',
          white: '#F9F7F7',
          coral: '#E25B45', // High-contrast warm accent for outliers
          rose: '#D9534F',
          emerald: '#2EA44F',
          amber: '#F0AD4E',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

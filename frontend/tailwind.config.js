/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#152420',
          50: '#f2f5f3',
          100: '#dfe7e2',
          200: '#b9c9c0',
          300: '#8ea79b',
          400: '#5c7d6d',
          500: '#3c5c4d',
          600: '#284237',
          700: '#1d322a',
          800: '#152420',
          900: '#0d1613',
        },
        paper: '#EFF2ED',
        card: '#F8F9F6',
        moss: {
          DEFAULT: '#2F6B4F',
          50: '#eef6f1',
          100: '#d3e8dc',
          300: '#7fb99b',
          500: '#2F6B4F',
          600: '#255740',
          700: '#1c4331',
        },
        sky: {
          DEFAULT: '#3A6EA5',
          100: '#dde9f5',
          500: '#3A6EA5',
          700: '#2a5480',
        },
        plum: {
          DEFAULT: '#6B4A7A',
          100: '#e6dcea',
          500: '#6B4A7A',
          700: '#523A5D',
        },
        gold: {
          DEFAULT: '#C9A24B',
          100: '#f5ecd4',
          500: '#C9A24B',
          700: '#9c7a34',
        },
        brick: {
          DEFAULT: '#B54B3A',
          100: '#f3ddd7',
          500: '#B54B3A',
          700: '#8c3728',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(21,36,32,0.06), 0 4px 16px rgba(21,36,32,0.06)',
      },
      borderRadius: {
        xl: '14px',
        '2xl': '20px',
      },
    },
  },
  plugins: [],
}

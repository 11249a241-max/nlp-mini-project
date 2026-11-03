/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f7ff',
          100: '#ebf0fe',
          200: '#d6e0fd',
          300: '#b4c7fb',
          400: '#8ca6f7',
          500: '#6382f2',
          600: '#4361eb',
          700: '#2f48d6',
          800: '#1e2f97',
          900: '#141e5f',
          950: '#0c1340',
        },
        navy: {
          800: '#0f172a',
          900: '#0b1120',
          950: '#060a13',
        },
        purpleAccent: {
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

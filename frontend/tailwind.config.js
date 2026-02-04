/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0a0a0f',
          800: '#12121a',
          700: '#1a1a25',
          600: '#252530',
        },
        status: {
          healthy: '#22c55e',
          degraded: '#eab308',
          unhealthy: '#ef4444',
          unknown: '#6b7280',
        }
      }
    },
  },
  plugins: [],
}

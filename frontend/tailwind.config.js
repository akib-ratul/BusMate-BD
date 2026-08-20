/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0f172a', // deep blue/navy
          light: '#1e293b',
        },
        accent: {
          DEFAULT: '#10b981', // green for active/live
          hover: '#059669',
        },
        danger: {
          DEFAULT: '#ef4444', // red for SOS/emergency
          hover: '#dc2626',
        },
        warning: {
          DEFAULT: '#f59e0b', // warning orange
          hover: '#d97706',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'admin-primary': '#1ea25cff',
        'admin-secondary': '#179e26ff',
      },
    },
  },
  plugins: [],
}




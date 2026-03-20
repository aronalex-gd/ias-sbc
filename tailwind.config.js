/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // This tells Tailwind to use 'Inter' (from Google Fonts) as the default sans font
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        // Custom IAS Colors
        iasGreen: '#00B050',
        darkBg: '#0A0A0A',
        cardBg: '#161616',
      },
    },
  },
  plugins: [],
}
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./features/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: '#09090B', // Deep zinc-950 for absolute premium contrast
        surface: '#18181B', // Zinc-900 for cards
        primary: '#4F46E5', // Indigo-600 - a very sleek, modern premium brand color
        text: '#FAFAFA', // Zinc-50
        muted: '#A1A1AA', // Zinc-400
        border: '#27272A' // Zinc-800
      }
    },
  },
  plugins: [],
}

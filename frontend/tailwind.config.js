/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // để bật theme dark khi thêm class "dark"
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#ffffff", // màu nền mặc định
        foreground: "#000000", // màu chữ mặc định
        border: "#e5e7eb",     // màu viền (mặc định là gray-200)
        ring: "#3b82f6",       // màu outline (blue-500)
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular"]
      },
      colors: {
        brand: {
          DEFAULT: "#38bdf8",
          soft: "#0f172a"
        }
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.75rem"
      },
      boxShadow: {
        soft: "0 18px 50px rgba(15,23,42,0.8)"
      }
    }
  },
  plugins: []
};
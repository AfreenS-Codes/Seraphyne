/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        medblue: { 50: "#f0f6ff", 100: "#dbe9ff", 200: "#bcd7ff", 500: "#2563eb", 600: "#1d4ed8", 700: "#1e40af" },
        softblue: "#eef4fb",
        teal: { 500: "#0d9488", 600: "#0f766e" },
      },
    },
  },
  plugins: [],
};

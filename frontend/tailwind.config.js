/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Manrope", "system-ui", "sans-serif"],
      },
      colors: {
        violet: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c5cfc", // Refined primary brand violet
          700: "#6a46f9",
          800: "#5b34e6",
          900: "#4c1d95",
          950: "#2e1065",
        },
        luminous: {
          violet: "#a78bfa",
          purple: "#c084fc",
          fuchsia: "#e879f9",
        },
        fuchsia: {
          400: "#e879f9",
          500: "#d946ef",
          600: "#c026d3",
          700: "#a21caf",
        },
        clinical: {
          bg: "#faf9fe", // Soft white-to-lavender base
          surface: "#ffffff",
          subtle: "#f5f3ff",
          border: "#e9e5fb",
          darkBg: "#130e26", // Deep indigo-violet base (no pure black)
          darkSurface: "#1c1533",
          darkCard: "rgba(28, 21, 51, 0.85)",
          darkBorder: "#2b224c",
        },
        navy: {
          800: "#181335",
          900: "#130e26",
          950: "#0c081a",
        },
        gold: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
        },
        softblue: "#f0f4f9",
      },
      borderRadius: {
        'xl': '14px',
        '2xl': '18px',
        '3xl': '24px',
      },
      boxShadow: {
        'soft': '0 2px 12px -2px rgba(124, 92, 252, 0.06), 0 1px 3px -1px rgba(15, 23, 42, 0.04)',
        'card': '0 4px 20px -2px rgba(124, 92, 252, 0.08), 0 1px 4px -1px rgba(15, 23, 42, 0.03)',
        'card-hover': '0 10px 25px -4px rgba(124, 92, 252, 0.14), 0 4px 10px -2px rgba(124, 92, 252, 0.06)',
        'elevated': '0 16px 36px -4px rgba(19, 14, 38, 0.15), 0 4px 12px -2px rgba(124, 92, 252, 0.08)',
        'glow-violet': '0 0 24px -2px rgba(124, 92, 252, 0.35)',
        'glow-luminous': '0 0 30px -2px rgba(192, 132, 252, 0.45)',
        'glow-gold': '0 0 20px -2px rgba(245, 158, 11, 0.25)',
      },
    },
  },
  plugins: [],
};


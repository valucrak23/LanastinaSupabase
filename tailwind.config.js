/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta girly oscura - Turquesa y Lila
        primary: {
          50: '#f0f9ff',   // turquesa muy claro
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',  // turquesa claro
          500: '#0ea5e9',  // turquesa principal
          600: '#0284c7',  // turquesa medio
          700: '#0369a1',  // turquesa oscuro
          800: '#075985',  // turquesa muy oscuro
          900: '#0c4a6e',  // turquesa super oscuro
        },
        secondary: {
          50: '#faf5ff',   // lila muy claro
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',  // lila claro
          500: '#a855f7',  // lila principal
          600: '#9333ea',  // lila medio
          700: '#7c3aed',  // lila oscuro
          800: '#6b21a8',  // lila muy oscuro
          900: '#581c87',  // lila super oscuro
        },
        accent: {
          50: '#fdf2f8',   // rosa muy claro
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',  // rosa claro
          500: '#ec4899',  // rosa principal
          600: '#db2777',  // rosa medio
          700: '#be185d',  // rosa oscuro
          800: '#9d174d',  // rosa muy oscuro
          900: '#831843',  // rosa super oscuro
        },
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        }
      }
    },
  },
  plugins: [],
}

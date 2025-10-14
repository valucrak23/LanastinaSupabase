/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta crochet master - Colores vivos
        crochet: {
          // Fondos Dracula suaves
          bg: {
            primary: '#1a1b26',
            secondary: '#24283b',
            card: '#2d3748',
            hover: '#353a52',
          },
          // Textos suaves
          text: {
            primary: '#f8f8f2',
            secondary: '#a9b1d6',
            muted: '#565f89',
          },
          // Colores vivos
          turquesa: '#26d0ce',
          violeta: '#bb9af7',
          rosa: '#f7768e',
          amarillo: '#e0af68',
          verde: '#9ece6a',
          azul: '#7aa2f7',
        },
        // Compatibilidad con clases existentes
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#26d0ce',  // turquesa vivo
          600: '#1fb5b3',
          700: '#1a9b99',
          800: '#158180',
          900: '#0f6766',
        },
        secondary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#bb9af7',  // violeta vivo
          600: '#a88de6',
          700: '#957fd5',
          800: '#8271c4',
          900: '#6f63b3',
        },
        accent: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#f7768e',  // rosa vivo
          600: '#f55a7a',
          700: '#f33e66',
          800: '#f12252',
          900: '#ef063e',
        },
        dark: {
          50: '#f8f8f2',
          100: '#a9b1d6',
          200: '#565f89',
          300: '#353a52',
          400: '#2d3748',
          500: '#24283b',
          600: '#1e2130',
          700: '#1a1b26',
          800: '#161820',
          900: '#12141a',
        }
      }
    },
  },
  plugins: [],
}

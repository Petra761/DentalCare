/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#E0F2F1',      // Verde/turquesa claro para resaltados
          100: '#B2DFDB',     // Verde/turquesa un poco más oscuro
          400: '#00BFA5',     // Color de acento brillante
          600: '#00897B',
          700: '#00796B',     // Color principal verde/turquesa
          800: '#004D40',     // Verde oscuro de la marca
          900: '#00251A',
        },
        bgApp: '#F5F9FC',     // Fondo azul claro principal
      }
    },
  },
  plugins: [],
}

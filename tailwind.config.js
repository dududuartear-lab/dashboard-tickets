/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sonata: {
          roxoescuro: '#4208af',
          roxoclaro:  '#534794',
          ouro:       '#d2b211',
          cinza:      '#d9d7df',
          verde:      '#1e8a76',
          preto:      '#252525',
        }
      },
      fontFamily: {
        titulo: ['"Anta"', 'sans-serif'],
        texto:  ['"Raleway"', 'sans-serif'],
      }
    }
  },
  plugins: [],
};

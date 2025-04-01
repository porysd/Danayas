import PrimeUI from 'tailwindcss-primeui';

module.exports = {
    purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
    mode: 'jit',
    darkMode: ['selector', '[class~="my-app-dark"]'],  
    theme: {
      extend: {},
    },
    variants: {
      extend: {},
    },
    plugins: [PrimeUI],
    corePlugins:{
        // preflight: false,
    }
  }
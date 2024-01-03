/// Tailwind CSS config
import { Config } from 'tailwindcss';

// Export config
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {}
  },
  plugins: []
} satisfies Config;

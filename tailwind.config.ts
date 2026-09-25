import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['var(--font-heading)', 'ui-sans-serif', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config

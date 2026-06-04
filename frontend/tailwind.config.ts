import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#F4F1EB',
          dark:    '#EDEAE3',
          darker:  '#E4E0D8',
        },
        ink: {
          DEFAULT: '#0A0A0A',
          soft:    '#141414',
          muted:   '#3A3A3A',
          faint:   '#7A7A7A',
        },
        red: {
          DEFAULT: '#E8230A',
          hover:   '#C41E08',
          light:   '#FFE8E5',
        },
        border: {
          DEFAULT: '#D8D4CC',
          dark:    '#2A2A2A',
          grid:    '#D0CCC4',
        },
        success: { DEFAULT: '#1A7A4A', light: '#E6F4ED' },
        warning: { DEFAULT: '#B85A00', light: '#FFF3E6' },
        error:   { DEFAULT: '#E8230A', light: '#FFE8E5' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'xs':   ['11px', { lineHeight: '1.5' }],
        'sm':   ['13px', { lineHeight: '1.5' }],
        'base': ['15px', { lineHeight: '1.6' }],
        'lg':   ['17px', { lineHeight: '1.5' }],
        'xl':   ['20px', { lineHeight: '1.4' }],
        '2xl':  ['26px', { lineHeight: '1.2' }],
        '3xl':  ['34px', { lineHeight: '1.1' }],
        '4xl':  ['46px', { lineHeight: '1.0' }],
        '5xl':  ['64px', { lineHeight: '1.0' }],
        '6xl':  ['84px', { lineHeight: '0.95' }],
      },
      letterSpacing: {
        widest: '0.14em',
        wider:  '0.10em',
        wide:   '0.06em',
      },
      borderRadius: {
        none:    '0px',
        sm:      '2px',
        DEFAULT: '4px',
        md:      '4px',
        lg:      '6px',
        full:    '9999px',
      },
      boxShadow: {
        'flat-sm':   '2px 2px 0px rgba(0,0,0,0.08)',
        'flat-md':   '4px 4px 0px rgba(0,0,0,0.10)',
        'flat-lg':   '6px 6px 0px rgba(0,0,0,0.12)',
        'flat-dark': '4px 4px 0px rgba(0,0,0,0.5)',
        'flat-red':  '4px 4px 0px rgba(232,35,10,0.3)',
      },
      backgroundImage: {
        // Subtle grid pattern matching the reference design
        'grid-pattern': `
          linear-gradient(to right, #D0CCC4 1px, transparent 1px),
          linear-gradient(to bottom, #D0CCC4 1px, transparent 1px)
        `,
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
    },
  },
  plugins: [],
}

export default config

/**
 * AnalyticaAI — Tailwind CSS Token Extension
 * Editorial / industrial AI aesthetic
 * Off-white grid background + red accent + heavy black typography
 *
 * Usage in tailwind.config.ts:
 *   import tokens from '../docs/design-tokens/tailwind-tokens'
 *   export default { theme: { extend: { ...tokens } } }
 */

const tokens = {
  colors: {
    // Backgrounds
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
    // Accent
    red: {
      DEFAULT: '#E8230A',
      hover:   '#C41E08',
      light:   '#FFE8E5',
    },
    // Borders
    border: {
      DEFAULT: '#D8D4CC',
      dark:    '#2A2A2A',
      grid:    '#D0CCC4',
    },
    // Semantic
    success: { DEFAULT: '#1A7A4A', light: '#E6F4ED' },
    warning: { DEFAULT: '#B85A00', light: '#FFF3E6' },
    error:   { DEFAULT: '#E8230A', light: '#FFE8E5' },
    info:    { DEFAULT: '#0A4A8A', light: '#E6EFF8' },
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
    '5xl':  ['64px', { lineHeight: '1.0', letterSpacing: '-0.02em' }],
    '6xl':  ['84px', { lineHeight: '0.95', letterSpacing: '-0.03em' }],
  },

  letterSpacing: {
    tighter: '-0.03em',
    tight:   '-0.01em',
    normal:  '0em',
    wide:    '0.06em',
    wider:   '0.10em',
    widest:  '0.14em',
  },

  borderRadius: {
    'none': '0px',
    'sm':   '2px',
    DEFAULT: '4px',
    'md':   '4px',
    'lg':   '6px',
    'full': '9999px',
  },

  boxShadow: {
    'flat-sm':  '2px 2px 0px rgba(0,0,0,0.08)',
    'flat-md':  '4px 4px 0px rgba(0,0,0,0.10)',
    'flat-lg':  '6px 6px 0px rgba(0,0,0,0.12)',
    'flat-dark':'4px 4px 0px rgba(0,0,0,0.5)',
    'flat-red': '4px 4px 0px rgba(232,35,10,0.3)',
  },

  spacing: {
    sidebar:  '220px',
    navbar:   '60px',
  },

  maxWidth: {
    content: '1200px',
    page:    '1440px',
  },
}

module.exports = tokens

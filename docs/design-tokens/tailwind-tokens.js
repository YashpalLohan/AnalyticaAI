/**
 * AnalyticaAI — Tailwind Tokens v2
 * Palette: Warm linen + Deep navy + Electric blue accent
 */

const tokens = {
  colors: {
    linen: {
      DEFAULT: '#F0EEE9',
      dark:    '#E8E5DE',
      darker:  '#DEDAD2',
    },
    navy: {
      DEFAULT: '#1A1F2E',
      soft:    '#222839',
      light:   '#2C3347',
    },
    ink: {
      DEFAULT: '#16191F',
      muted:   '#363A45',
      faint:   '#6B7080',
    },
    blue: {
      DEFAULT: '#4F6EF7',
      hover:   '#3A57E8',
      light:   '#EAEEff',
      dark:    '#6B86FF',
    },
    border: {
      DEFAULT: '#DEDAD2',
      strong:  '#C8C4BC',
      dark:    '#2E3448',
    },
    success: { DEFAULT: '#1E8A52', light: '#E8F7EF' },
    warning: { DEFAULT: '#C47A00', light: '#FFF5E6' },
    error:   { DEFAULT: '#D94040', light: '#FDEAEA' },
  },

  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
    mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
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
    'flat-sm':   '2px 2px 0px rgba(22,25,31,0.07)',
    'flat-md':   '4px 4px 0px rgba(22,25,31,0.09)',
    'flat-lg':   '6px 6px 0px rgba(22,25,31,0.11)',
    'flat-dark': '4px 4px 0px rgba(0,0,0,0.45)',
    'flat-blue': '4px 4px 0px rgba(79,110,247,0.28)',
  },
}

module.exports = tokens

/**
 * AnalyticaAI — Tailwind CSS Token Extension
 * Add this to your tailwind.config.ts under `theme.extend`
 */

const tokens = {
  colors: {
    brand: {
      50:  '#EFF6FF',
      100: '#DBEAFE',
      200: '#BFDBFE',
      300: '#93C5FD',
      400: '#60A5FA',
      500: '#3B82F6',
      600: '#2563EB',   // primary accent
      700: '#1D4ED8',   // hover
      800: '#1E40AF',
      900: '#1E3A8F',
    },
    surface: {
      primary:   '#FFFFFF',
      secondary: '#F8FAFC',
      tertiary:  '#F1F5F9',
    },
    border: {
      default: '#E2E8F0',
      strong:  '#CBD5E1',
      focus:   '#2563EB',
    },
    text: {
      primary:   '#0F172A',
      secondary: '#64748B',
      tertiary:  '#94A3B8',
      inverse:   '#FFFFFF',
      disabled:  '#CBD5E1',
    },
    chart: {
      1: '#2563EB',
      2: '#7C3AED',
      3: '#059669',
      4: '#D97706',
      5: '#DC2626',
      6: '#0284C7',
      7: '#DB2777',
      8: '#65A30D',
    },
  },
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
  },
  spacing: {
    sidebar: '240px',
    navbar:  '64px',
  },
  maxWidth: {
    content: '1280px',
    page:    '1440px',
  },
  borderRadius: {
    sm:   '4px',
    md:   '8px',
    lg:   '12px',
    xl:   '16px',
    '2xl': '24px',
  },
  boxShadow: {
    card:  '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.05)',
    panel: '0 4px 6px rgba(0,0,0,0.07)',
    modal: '0 20px 25px rgba(0,0,0,0.12)',
  },
  zIndex: {
    dropdown: '100',
    sticky:   '200',
    overlay:  '300',
    modal:    '400',
    toast:    '500',
    tooltip:  '600',
  },
};

module.exports = tokens;

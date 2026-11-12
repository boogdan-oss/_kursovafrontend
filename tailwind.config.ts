import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        border: { DEFAULT: token('border'), strong: token('border-strong') },
        input: token('input'),
        ring: token('ring'),
        background: token('background'),
        foreground: token('foreground'),
        tertiary: token('tertiary'),
        elevated: token('elevated'),
        primary: {
          DEFAULT: token('primary'),
          soft: token('primary-soft'),
          foreground: token('primary-foreground'),
        },
        action: { DEFAULT: token('action'), foreground: token('action-foreground') },
        secondary: { DEFAULT: token('secondary'), foreground: token('secondary-foreground') },
        muted: { DEFAULT: token('muted'), foreground: token('muted-foreground') },
        accent: { DEFAULT: token('accent'), foreground: token('accent-foreground') },
        popover: { DEFAULT: token('popover'), foreground: token('popover-foreground') },
        card: { DEFAULT: token('card'), foreground: token('card-foreground') },
        success: { DEFAULT: token('success'), soft: token('success-soft') },
        warning: { DEFAULT: token('warning'), soft: token('warning-soft') },
        destructive: {
          DEFAULT: token('destructive'),
          soft: token('destructive-soft'),
          foreground: token('destructive-foreground'),
        },
        chart: {
          1: token('chart-1'),
          2: token('chart-2'),
          3: token('chart-3'),
          4: token('chart-4'),
          5: token('chart-5'),
        },
      },
      fontSize: {
        display: ['40px', { lineHeight: '48px', letterSpacing: '-0.01em', fontWeight: '700' }],
        h1: ['32px', { lineHeight: '40px', fontWeight: '700' }],
        h2: ['24px', { lineHeight: '32px', fontWeight: '700' }],
        h3: ['18px', { lineHeight: '26px', fontWeight: '600' }],
        body: ['16px', { lineHeight: '24px' }],
        caption: ['14px', { lineHeight: '20px' }],
        small: ['12px', { lineHeight: '16px', fontWeight: '500' }],
        num: ['28px', { lineHeight: '36px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'num-lg': ['40px', { lineHeight: '48px', letterSpacing: '-0.01em', fontWeight: '700' }],
        label: ['10px', { lineHeight: '14px', letterSpacing: '0.06em' }],
        meta: ['11px', { lineHeight: '14px' }],
        ui: ['12px', { lineHeight: '18px' }],
        'ui-lg': ['13px', { lineHeight: '18px' }],
        data: ['16px', { lineHeight: '20px' }],
        kpi: ['20px', { lineHeight: '28px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'kpi-lg': ['26px', { lineHeight: '32px', letterSpacing: '-0.01em', fontWeight: '600' }],
      },
      borderRadius: {
        xl: 'var(--radius)',
        lg: 'var(--radius)',
        md: 'var(--radius)',
        sm: 'var(--radius)',
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [animate],
} satisfies Config

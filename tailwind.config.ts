import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          950: '#060606',
          900: '#0a0a0a',
          850: '#0f0f10',
          800: '#141416',
          700: '#1c1c1f'
        },
        ink: {
          primary: '#ededf0',
          secondary: '#9a9aa2',
          tertiary: '#6b6b72'
        },
        accent: {
          DEFAULT: '#3ddc97',
          dim: '#2a9d6f',
          glow: 'rgba(61, 220, 151, 0.16)'
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace']
      },
      backdropBlur: {
        xs: '2px'
      },
      boxShadow: {
        glass: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 8px 24px -8px rgba(0,0,0,0.6)',
        'glass-sm': '0 1px 0 0 rgba(255,255,255,0.03) inset, 0 4px 12px -4px rgba(0,0,0,0.5)'
      },
      borderRadius: {
        xl2: '1.25rem'
      },
      keyframes: {
        'digit-in': {
          '0%': { transform: 'translateY(-6px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      },
      animation: {
        'digit-in': 'digit-in 260ms cubic-bezier(0.22, 1, 0.36, 1)',
        'fade-in': 'fade-in 200ms ease-out'
      }
    }
  },
  plugins: []
};

export default config;

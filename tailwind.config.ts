import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      /* ============================================================
         Color Palette - Light & Dark Mode
         ============================================================ */
      colors: {
        // Primary (Gold Accent) - Same in both modes
        primary: '#B8860B',
        'primary-pressed': '#9A6F08',
        'primary-active': '#7A5506',
        'on-primary': '#ffffff',

        // Canvas & Surfaces - Light Mode
        canvas: '#FAF6F1',
        'surface-card': '#ffffff',
        'surface-soft': '#F5EBE0',
        'surface-doc': '#ffffff',
        'surface-dark': '#1F1F1F',

        // Text - Light Mode
        ink: '#4A4A4A',
        body: '#4A4A4A',
        charcoal: '#333333',
        mute: '#8B7355',
        ash: '#9b9c92',
        stone: '#b6b7af',

        // Borders - Light Mode
        hairline: '#e5cdb3',
        'hairline-soft': '#f0e1d0',

        // Semantic - Light Mode
        'link-blue': '#1d4ed8',
        'link-teal': '#1078a3',
        'accent-blue': '#2c84e0',
        'accent-blue-soft': '#dceaf6',
        'accent-red': '#cd4239',
        'accent-red-soft': '#f7d6d3',
        'accent-green': '#2c8c66',
        'accent-green-soft': '#d9eddf',
        'accent-purple': '#7c44a6',
        'accent-purple-soft': '#e7d8ee',
      },

      /* ============================================================
         Typography
         ============================================================ */
      fontSize: {
        'display-xl': ['36px', { lineHeight: '1.5', fontWeight: '700' }],
        'display-lg': ['24px', { lineHeight: '1.33', fontWeight: '800', letterSpacing: '-0.6px' }],
        'heading-lg': ['21px', { lineHeight: '1.4', fontWeight: '700', letterSpacing: '-0.5px' }],
        'heading-md': ['20px', { lineHeight: '1.4', fontWeight: '700' }],
        'heading-sm': ['18px', { lineHeight: '1.5', fontWeight: '700' }],
        'body-md': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'body-strong': ['16px', { lineHeight: '1.5', fontWeight: '600' }],
        'body-sm': ['15px', { lineHeight: '1.71', fontWeight: '400' }],
        'body-xs': ['14px', { lineHeight: '1.43', fontWeight: '500' }],
        'button-md': ['14px', { lineHeight: '1.5', fontWeight: '700' }],
        code: ['14px', { lineHeight: '1.43', fontWeight: '400' }],
      },

      /* ============================================================
         Border Radius
         ============================================================ */
      borderRadius: {
        none: '0px',
        xs: '2px',
        sm: '4px',
        md: '6px',
        lg: '8px',
        full: '9999px',
      },

      /* ============================================================
         Font Family
         ============================================================ */
      fontFamily: {
        plex: ['var(--font-ibm-plex)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-source-code)', 'ui-monospace', 'monospace'],
      },
    },
  },

  /* ============================================================
     Dark Mode Configuration
     ============================================================ */
  darkMode: 'class',

  plugins: [
    function ({ addBase, theme }: any) {
      addBase({
        '@supports (color: oklch(0 0 0))': {
          ':root': {
            colorScheme: 'light dark',
          },
        },
      });

      // Dark mode color overrides using CSS custom properties
      const darkModeColors = {
        // Primary (Gold Accent - same as light)
        '--color-primary': '#D4AF37',
        '--color-primary-pressed': '#be950e',
        '--color-primary-active': '#7A5506',
        '--color-on-primary': '#1F1F1F',

        // Canvas & Surfaces - Dark Mode
        '--color-canvas': '#1F1F1F',
        '--color-surface-card': '#242424',
        '--color-surface-soft': '#2A2A2A',
        '--color-surface-doc': '#242424',
        '--color-surface-dark': '#000000',

        // Text - Dark Mode
        '--color-ink': '#F5F5F5',
        '--color-body': '#F5F5F5',
        '--color-charcoal': '#FFFFFF',
        '--color-mute': '#B0B0B0',
        '--color-ash': '#8B7355',
        '--color-stone': '#808080',

        // Borders - Dark Mode
        '--color-hairline': '#3a3a3a',
        '--color-hairline-soft': '#2a2a2a',

        // Semantic - Dark Mode
        '--color-link-blue': '#5ba3ff',
        '--color-link-teal': '#4db8d8',
        '--color-accent-blue': '#5ba3ff',
        '--color-accent-blue-soft': '#1a3a52',
        '--color-accent-red': '#ff6b5b',
        '--color-accent-red-soft': '#4a2a28',
        '--color-accent-green': '#5bcc8a',
        '--color-accent-green-soft': '#2a4a38',
        '--color-accent-purple': '#b88aff',
        '--color-accent-purple-soft': '#4a3a5a',
      };

      addBase({
        '.dark': darkModeColors,
      });
    },
  ],
};

export default config;

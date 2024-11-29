const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind');
const { join } = require('path');
const sharedTailwindConfig = require('../../../shared/css-framework/tailwind/tailwind.config');

// Colors mapped using https://find-nearest-tailwind-colour.netlify.app/
/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [sharedTailwindConfig],
  // Needed for widget
  safelist: ['bg-zinc-800', 'max-w-[72px]', 'h-[50px]', 'p-4', 'bg-alert-gradient'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'Arial', 'sans-serif'],
      },
      screens: {
        xs: { max: '480px' },
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1440px',
        '3xl': '1921px',
        sc: '1568px',
        'touch-devices': { raw: '(pointer: coarse)' },
      },
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        white: '#ffffff',
        black: '#000000',
        zinc: {
          800: '#282828',
          900: '#1d1f20',
          950: '#040308',
        },
        green: {
          400: '#49bc74',
        },
        neutral: {
          700: '#403f42',
          800: '#1F2123',
        },
        emerald: {
          400: '#48b69c',
        },
        slate: {
          500: '#7c7198',
        },
        stone: {
          300: '#c8c7cc',
        },
        red: {
          500: '#ba5342',
        },
        yellow: {
          800: '#7e771d',
        },
        amber: {
          300: '#e2d356',
        },
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: 'normal' }],
        xs: ['0.75rem', { lineHeight: 'normal' }],
        sm: ['0.875rem', { lineHeight: 'normal' }],
        base: ['1rem', { lineHeight: 'normal' }],
        lg: ['1.125rem', { lineHeight: 'normal' }],
        xl: ['1.25rem', { lineHeight: 'normal' }],
        '2xl': ['1.5rem', { lineHeight: 'normal' }],
        '3xl': ['1.875rem', { lineHeight: 'normal' }],
        '4xl': ['2.25rem', { lineHeight: 'normal' }],
        '5xl': ['3rem', { lineHeight: 'normal' }],
        '6xl': ['3.75rem', { lineHeight: 'normal' }],
        '7xl': ['4.5rem', { lineHeight: 'normal' }],
        '8xl': ['6rem', { lineHeight: 'normal' }],
        '9xl': ['8rem', { lineHeight: 'normal' }],
      },
      lineHeight: {
        none: '1',
        tight: '1.1',
        snug: '1.375',
        normal: '1.5',
        relaxed: '1.625',
        loose: '2',
        3: '.75rem',
        4: '1rem',
        5: '1.25rem',
        6: '1.5rem',
        7: '1.75rem',
        8: '2rem',
        9: '2.25rem',
        10: '2.5rem',
      },
      backgroundImage: {
        'alert-gradient':
          'linear-gradient(180deg, rgba(254, 141, 249, 0.8) 0%, rgba(255, 80, 48, 0.8) 92.44%)',
      },
      zIndex: {
        1: '1',
        2: '2',
        3: '3',
        4: '4',
        5: '5',
      },
    },
  },
  content: [
    join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
};

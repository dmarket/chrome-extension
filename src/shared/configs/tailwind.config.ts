import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';
import { join } from 'path';

// https://github.com/tailwindlabs/tailwindcss/blob/master/stubs/config.full.js

export default {
  content: [ join(__dirname, '../../**/!(*.stories|*.spec|*.config).{ts,html}'),],
  safelist: [
    'bg-gradient-to-t',
    'bg-gradient-to-b',
    'bg-gradient-to-br',
    'from-blue-200',
    'to-blue-300',
    'from-green-300',
    'to-cyan-300',
    'from-orange-200',
    'to-orange-300',
    'from-fuchsia-200',
    'to-fuchsia-300',
    'bg-zinc-800',
    'bg-dm-zinc-800',
  ],
  theme: {
    fontFamily: { sans: ['Montserrat', 'Arial', 'sans-serif'] },
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1440px',
      '3xl': '1920px',
    },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#ffffff',
      black: '#000000',
      neutral: {
        500: '#727273',
        600: '#555556',
        700: '#3d3d3d',
        800: '#242425',
        900: '#181818',
        950: '#0d0e0e',
      },
      zinc: {
        200: '#e4e4e7',
        300: '#d9d9d9',
        400: '#bfc0c0',
        500: '#858586',
        600: '#636364',
        700: '#49494a',
        800: '#303031',
        900: '#181819',
      },
      green: {
        200: '#8dd294',
        300: '#7dffad',
        400: '#59ed90',
      },
      emerald: {
        500: '#04da8d',
        600: '#12745A',
        700: '#066f50',
      },
      cyan: {
        300: '#59edff',
        400: '#00DDdD',
      },
      stone: {
        200: '#cecfcf',
        950: '#0e0f0f',
      },
      slate: {
        100: '#4c907c',
        500: '#3c818f',
      },
      lime: {
        500: '#83b135',
      },
      amber: {
        300: '#d7be48',
      },
      orange: {
        200: '#ffca7b',
        300: '#ffc671',
        400: '#f08141',
      },
      red: {
        300: '#EF6373',
        400: '#ff6464',
        500: '#ec4f3d',
      },
      fuchsia: {
        200: '#f2ccff',
        300: '#e5adff',
        400: '#ef8dff',
      },
      blue: {
        200: '#9fc6ff',
        300: '#85bdff',
        400: '#4daef8',
      },
      teal: {
        300: '#63d8c7',
      },
      yellow: {
        300: '#ffe142',
        400: '#faff00',
      },
      'dm-green': {
        300: '#9cd099',
        400: '#8dd294',
      },
      'dm-neutral': {
        600: '#3E4044',
        700: '#35373a',
      },
      'dm-orange': {
        300: '#ffb661',
      },
      'dm-violet': {
        400: '#af7fff',
        500: '#7056e1',
      },
      'dm-dark-blue': {
        500: '#203cd3',
      },
      'dm-grapefruit': {
        400: '#fc7e73',
      },
      'dm-pink-orange': {
        400: '#e47b8e',
      },
      'dm-zinc': {
        800: '#2a2c2e',
      },
    },
    borderRadius: {
      none: '0px',
      sm: '0.125rem',
      DEFAULT: '0.25rem',
      md: '0.375rem',
      lg: '10px',
      xl: '0.75rem',
      '2xl': '1rem',
      '3xl': '1.5rem',
      '4xl': '40px',
      full: '9999px',
    },
    borderWidth: {
      DEFAULT: '1px',
      '0': '0',
      '2': '2px',
      '3': '3px',
      '4': '4px',
      '6': '6px',
      '8': '8px',
      '30': '30px',
    },
    fontSize: {
      '2xs': ['0.6785rem', { lineHeight: 'normal' }],
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
    extend: {
      spacing: {
        15: '60px',
        26: '104px',
        82: '328px',
        120: '30rem',
        108: '27rem',
        144: '36rem',
        390: '1560px',
        432: '1728px',
        initial: 'initial',
      },
      backgroundImage: {
        'dm-gradient-green': 'linear-gradient(253.3deg, #75cbbe 0%, #63ca7c 100%)',
        'dm-gradient-orange': 'linear-gradient(253.3deg, #f0965d 0%, #f5d673 100%)',
        'dm-gradient-violet': 'linear-gradient(253.3deg, #4b55f5 0%, #7556f5 100%)',
        'dm-gradient-dark-blue': 'linear-gradient(261.44deg, #203cd3 13.53%, #2684dc 139.3%)',
        'dm-gradient-grapefruit':
          'linear-gradient(180deg, #fc7e73, #fc7e73), linear-gradient(0deg, #df7053, #df7053), #8dd294',
        'dm-gradient-pink-orange': 'linear-gradient(223.23deg, #df678f 0%, #f7cc88 100%, #e9a2d2 100%)',
      },
      scale: {
        flip: 'scaleX(-1)',
      },
      aspectRatio: {
        '5/4': '5 / 4',
        '4/3': '4 / 3',
        '3/2': '3 / 2',
        '16/11': '16 / 11',
        '18/14': '18 / 14',
      },
      padding: {
        '15%': '15%',
      },
      zIndex: {
        1: '1',
        2: '2',
        3: '3',
        4: '4',
        5: '5',
      },
      saturate: {
        65: '.65',
      },
      animation: {
        ['progress-bar']: 'progressBar 5.5s linear 1',
        ['spinner-circle']: 'rotation 1s infinite linear',
        ['iconCloseRotate']: 'halfRotate 250ms 1 linear',
        ['single-ping']: 'singlePing 250ms cubic-bezier(0, 0, 0.2, 1)',
      },
      keyframes: {
        rotation: {
          '0%': { transform: 'rotate(0)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        halfRotate: {
          '0%': { transform: 'rotate(0)' },
          '100%': { transform: 'rotate(180deg)' },
        },
        progressBar: {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
        scrollingText: {
          '0%': { transform: 'translateX(0%)' },
          // include element paddings for shift
          '100%': { transform: 'translateX(calc(0px - 50% - 200px))' },
        },
        singlePing: {
          '10%': {
            transform: 'scale(1.5)',
            opacity: '0.5',
          },
          '100%': {
            transform: 'scale(1)',
            opacity: '1',
          },
        },
      },
      textShadow: {
        DEFAULT:
          '-1px -1px 0 var(--tw-shadow-color), 1px -1px 0 var(--tw-shadow-color), -1px 1px 0 var(--tw-shadow-color), 1px 1px 0 var(--tw-shadow-color)',
      },
      gridTemplateRows: {
        'xl-hero-grid': 'repeat(10, minmax(0, 60px))',
        'api-grid': 'repeat(1, minmax(400px, 1fr))',
      },
      gridTemplateColumns: {
        'qr-grid': 'auto 128px',
      },
    },
    boxShadow: {
      'dm-btn-inner': 'inset 0 -70px 0 0 rgba(0, 0, 0, 0.1)',
      DEFAULT:
        '-1px -1px 0 var(--tw-shadow-color), 1px -1px 0 var(--tw-shadow-color), -1px 1px 0 var(--tw-shadow-color), 1px 1px 0 var(--tw-shadow-color)',
    },
    transitionProperty: {
      'dm-primary': 'all 250ms ease-in-out',
      'dm-secondary': 'all 150ms ease-in-out',
    },
  },
  plugins: [
    plugin(function ({ addBase, theme }) {
      addBase({
        h11: { fontSize: theme('fontSize.4xl') },
      });
    }),
    plugin(function ({ addUtilities }) {
      const newUtilities = {
        '.backface-visibility-hidden': {
          '-webkit-backface-visibility': 'hidden',
        },
        '.clip-circle': {
          'clip-path': 'circle(40% at 50% 50%)',
        },
      };
      addUtilities(newUtilities, { respectPrefix: true });
    }),
    plugin(function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          'text-shadow': value => ({
            textShadow: value,
          }),
        },
        { values: theme('textShadow') },
      );
    }),
  ],
} satisfies Config;

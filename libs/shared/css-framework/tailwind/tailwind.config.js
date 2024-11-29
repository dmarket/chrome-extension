const plugin = require('tailwindcss/plugin');

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {},
  plugins: [
    plugin(({ addBase, theme }) => {
      addBase({
        h1: { fontSize: theme('fontSize.4xl') },
      });
    }),
    plugin(({ addUtilities }) => {
      const newUtilities = {
        '.backface-visibility-hidden': {
          '-webkit-backface-visibility': 'hidden',
        },
        '.webkit-text-fill-transparent': {
          '-webkit-text-fill-color': 'transparent',
        },
        '.clip-circle': {
          'clip-path': 'circle(40% at 50% 50%)',
        },
      };
      addUtilities(newUtilities, { respectPrefix: true });
    }),
    plugin(({ matchUtilities, theme }) => {
      matchUtilities(
        {
          'text-shadow': (value) => ({
            textShadow: value,
          }),
        },
        { values: theme('textShadow') },
      );
    }),
  ],
};

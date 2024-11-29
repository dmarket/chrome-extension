const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind');
const { join } = require('path');
const dmExtConfig = require('../../libs/dmarket-chrome-extension/css-framework/tailwind/tailwind.config');

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [dmExtConfig],
  content: [
    join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
};

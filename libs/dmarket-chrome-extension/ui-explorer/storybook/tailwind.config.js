const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind');
const { join } = require('path');
const twConfig = require('../../css-framework/tailwind/tailwind.config');

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [twConfig],
  content: [
    join(__dirname, '../../ui/**/!(*.spec).{ts,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
};

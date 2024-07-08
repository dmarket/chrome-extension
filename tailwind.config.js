const { join } = require('path');
const sharedTailwindConfig = require('./src/shared/configs/tailwind.config');

module.exports = {
  presets: [sharedTailwindConfig],
  content: [
    join(__dirname, './src/**/!(*.stories|*.spec|*.config).{ts,html}'),
  ],
};

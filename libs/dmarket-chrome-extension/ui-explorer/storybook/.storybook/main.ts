import type { StorybookConfig } from '@storybook/angular';

const config: StorybookConfig = {
  stories: [
    '../../../ui/base/**/src/lib/**/*.stories.ts',
    '../../../ui/domains/**/src/lib/**/*.stories.ts',
  ],
  addons: ['@storybook/addon-essentials', '@storybook/addon-interactions', '@storybook/addon-a11y'],
  framework: {
    name: '@storybook/angular',
    options: {},
  },
  previewHead: (head) => `${head}`,
  core: {
    disableTelemetry: true,
  },
  docs: {
    defaultName: 'Documentation',
  },
  staticDirs: [
    { from: '../../../../../apps/dmarket-chrome-extension/src/assets', to: '/assets' },
    { from: '../../../../../.storybook/assets', to: '/' },
    // { from: '../../../../../.storybook/assets/favicon.svg', to: '.' },
  ],
};

export default config;

// To customize your webpack configuration you can use the webpackFinal field.
// Check https://storybook.js.org/docs/react/builders/webpack#extending-storybooks-webpack-config
// and https://nx.dev/recipes/storybook/custom-builder-configs

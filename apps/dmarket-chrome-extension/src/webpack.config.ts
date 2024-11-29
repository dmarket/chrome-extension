import { Configuration } from 'webpack';

export default {
  entry: {
    background: { import: 'apps/dmarket-chrome-extension/src/background.ts', runtime: false },
    content_dmarket: {
      import: 'apps/dmarket-chrome-extension/src/content/dmarket.ts',
      runtime: false,
    },
    content_steamcommunity: {
      import: 'apps/dmarket-chrome-extension/src/content/steamcommunity.ts',
      runtime: false,
    },
    content_google: {
      import: 'apps/dmarket-chrome-extension/src/content/google.ts',
      runtime: false,
    },
    content_utils: {
      import: 'apps/dmarket-chrome-extension/src/content/utils.ts',
      runtime: false,
    },
  },
} as Configuration;

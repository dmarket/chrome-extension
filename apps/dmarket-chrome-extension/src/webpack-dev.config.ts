import type { Configuration } from 'webpack';
import * as ExtensionReloader from 'webpack-ext-reloader';
import config from './webpack.config';

module.exports = {
  ...config,
  mode: 'development',
  plugins: [
    // @ts-expect-error valid import statement
    new ExtensionReloader({
      port: 4201,
      reloadPage: true, // Force the reload of the page also
      entries: {
        // The entries used for the content/background scripts or extension pages
        background: 'background',
        extensionPage: 'popup',
        popup: 'main.js',
      },
    }),
  ],
} as Configuration;

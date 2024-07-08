import type { Configuration } from 'webpack';

export default {
  entry: { background: { import: './src/background.ts', runtime: false } },
} as Configuration;

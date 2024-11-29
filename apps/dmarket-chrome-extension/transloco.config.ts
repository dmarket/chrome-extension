/** This is used for the transloco-keys-manager lib. */
import { TranslocoGlobalConfig } from '@jsverse/transloco-utils';

const config: TranslocoGlobalConfig = {
  langs: ['en', 'ko', 'zh'],
  keysManager: {
    input: ['apps/dmarket-chrome-extension/src/app', 'libs/dmarket-chrome-extension'],
    defaultValue: '{{keyWithoutScope}}',
    fileFormat: 'json',
    addMissingKeys: true,
  },
};

export default config;

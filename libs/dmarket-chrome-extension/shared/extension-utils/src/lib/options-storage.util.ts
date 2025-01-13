import { DmExtTabStatus } from '@myth/dm-ext-shared-constants';
import OptionsSync from 'webext-options-sync';

export type DmExtOptions = typeof optionsStorageDefaults;

export const optionsStorageDefaults = {
  domainAuthenticityVerification: true,
  tradeBotsVerification: true,
  liveAnalysis: false,
  currentTabStatus: DmExtTabStatus.Unknown,
  lastValidatedDomain: '',
  tutorialShowed: false,
  domainMapUpdatedAt: 0,
  userDomainsWhiteList: '',
};

export const optionsStorage = new OptionsSync({
  defaults: optionsStorageDefaults,
  migrations: [
    (savedOptions) => {
      // Can rename the property if it was renamed here
      // if (Object.prototype.hasOwnProperty(savedOptions, 'some_old_prop') {
      //   savedOptions['new_prop'] = savedOptions['some_old_prop'];
      //   delete savedOptions['some_old_prop'];
      // }
    },
    OptionsSync.migrations.removeUnused,
  ],
  logging: false,
});

// Mock Storage for web browser development
const mockStorageKey = 'dmExtOptions';
const getMockOptions = () => {
  try {
    const options = localStorage.getItem(mockStorageKey);
    if (!options) return optionsStorageDefaults;
    return JSON.parse(options);
  } catch (e) {
    return optionsStorageDefaults;
  }
};

export const optionsStorageMock = {
  set: async (options: Partial<DmExtOptions>) => {
    const storedOptions = getMockOptions();
    localStorage.setItem(mockStorageKey, JSON.stringify({ ...storedOptions, ...options }));
  },
  getAll: async () => {
    return getMockOptions();
  },
} as unknown as OptionsSync<DmExtOptions>;

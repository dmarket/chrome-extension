export const dmExtId = 'oamkfipicfhlhahhjhkhbfmimhjaddhg';
export const dmExtDefaultTitle = 'DMarket Trust Shield';
export const dmExtDmarketOfficialUrl = 'https://dmarket.com';
export const dmExtUninstallUrl = dmExtDmarketOfficialUrl;

export enum DmExtTabStatus {
  Processing = 'processing',
  Unknown = 'unknown',
  Safe = 'safe',
  Alert = 'alert',
  Error = 'error',
  Disabled = 'disabled',
}

export const actionValidIcons = {
  16: 'assets/img/ext/icons/logo-16.png',
  32: 'assets/img/ext/icons/logo-32.png',
  48: 'assets/img/ext/icons/logo-48.png',
};
export const actionWarnIcons = {
  16: 'assets/img/ext/icons/warn-16.png',
  32: 'assets/img/ext/icons/warn-32.png',
  48: 'assets/img/ext/icons/warn-48.png',
};
export const actionErrorIcons = {
  16: 'assets/img/ext/icons/error-16.png',
  32: 'assets/img/ext/icons/error-32.png',
  48: 'assets/img/ext/icons/error-48.png',
};
export const actionDisabledIcons = {
  16: 'assets/img/ext/icons/disabled-16.png',
  32: 'assets/img/ext/icons/disabled-32.png',
  48: 'assets/img/ext/icons/disabled-48.png',
};

export const actionIcons = {
  [DmExtTabStatus.Safe]: actionValidIcons,
  [DmExtTabStatus.Processing]: actionWarnIcons,
  [DmExtTabStatus.Unknown]: actionWarnIcons,
  [DmExtTabStatus.Error]: actionWarnIcons,
  [DmExtTabStatus.Alert]: actionErrorIcons,
  [DmExtTabStatus.Disabled]: actionDisabledIcons,
};

export const statusIconConfig = {
  [DmExtTabStatus.Processing]: {
    imageUrl: 'status/processing-status.svg',
    classes: 'bg-slate-500/50',
  },
  [DmExtTabStatus.Unknown]: {
    imageUrl: 'status/unknown-status.svg',
    classes: 'bg-yellow-800/50',
  },
  [DmExtTabStatus.Error]: {
    imageUrl: 'status/error-status.svg',
    classes: 'bg-slate-500/50',
  },
  [DmExtTabStatus.Safe]: {
    imageUrl: 'status/safe-status.svg',
    classes: 'bg-emerald-400/50',
  },
  [DmExtTabStatus.Alert]: {
    imageUrl: 'status/alert-status.svg',
    classes: 'bg-red-500/80',
  },
  [DmExtTabStatus.Disabled]: {
    imageUrl: 'status/disabled-status.svg',
    classes: 'bg-slate-500/50',
  },
};

export const dmExtMessagingChannel = 'dm-ext-messaging';
export const allUrlsMatchPattern = '*://*/*';
export const maxValidationCacheSize = 200;
export const dmExtChromeServiceUrls = [
  dmExtId,
  'localhost',
  'extensions',
  'newtab',
  'settings',
  'downloads',
  'history',
  'bookmarks',
  'whats-new',
  'password-manager',
];

export const timeConstants = {
  ms: 1000,
  sec: 60,
  min: 60,
};

export enum MessageActionNames {
  RequestAllUrlsPermission = 'requestAllUrlsPermission',
  CheckTabDomain = 'checkTabDomain',
  SetTabStatus = 'setTabStatus',
  RedirectToDmarket = 'redirectToDmarket',
  SyncOptions = 'syncOptions',
  CloseTradeOfferWidget = 'closeTradeOfferWidget',
  ShowTradeOfferWidget = 'showTradeOfferWidget',
  ClosePopup = 'closePopup',
}

export enum GaEventNames {
  //Installation and Setup Events
  ExtensionInstalled = 'extension_installed',
  ExtensionActivated = 'extension_activated',
  PermissionsGranted = 'permissions_granted',
  PermissionsDenied = 'permissions_denied',
  SettingsOpened = 'settings_opened',
  // Domain and URL Verification Events
  DomainCustomReported = 'domain_custom_reported',
  DomainCustomReportFailed = 'domain_custom_report_failed',
  DomainVerifiedDmarket = 'domain_verified_dmarket',
  DomainPhishingDetected = 'domain_phishing_detected',
  DomainNeutralDetected = 'domain_neutral_detected',
  DomainVerificationError = 'domain_verification_error',
  // General User Metrics
  UserSessionStarted = 'user_session_started',
  UserSessionEnded = 'user_session_ended',
  // Global Error Event
  ExtensionError = 'extension_error',
}

export const dmExtEventToStatusMap: Record<DmExtTabStatus, GaEventNames | null> = {
  [DmExtTabStatus.Safe]: GaEventNames.DomainVerifiedDmarket,
  [DmExtTabStatus.Alert]: GaEventNames.DomainPhishingDetected,
  [DmExtTabStatus.Unknown]: GaEventNames.DomainNeutralDetected,
  [DmExtTabStatus.Error]: GaEventNames.DomainVerificationError,
  [DmExtTabStatus.Processing]: null,
  [DmExtTabStatus.Disabled]: null,
};

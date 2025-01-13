/* eslint-disable max-lines */
/* eslint no-console: ["error", { allow: ["info"] }] */
import {
  actionIcons,
  allUrlsMatchPattern,
  blackListedDomains,
  dmExtApiUrl,
  dmExtDefaultTitle,
  dmExtDmarketHosts,
  dmExtDmarketOfficialUrl,
  dmExtEventToStatusMap,
  DmExtTabStatus,
  dmExtUninstallUrl,
  GaEventNames,
  maxValidationCacheSize,
  MessageActionNames,
  timeConstants,
} from '@myth/dm-ext-shared-constants';
import {
  GaAnalytics,
  getHasAllUrlsPermission,
  getIsContentScriptsRegistered,
  isActionMessage,
  isAnalyticsMessage,
  isApiMessage,
  optionsStorage,
  registerContentScripts,
} from '@myth/dm-ext-shared-extension-utils';
import {
  ExtensionMessagingService,
  getHostName,
  parseError,
  Port,
} from '@myth/dm-ext-shared-utils';
import browser, { Tabs } from 'webextension-polyfill';
import { getI18nMessage } from './content/utils';
import MessageSender = chrome.runtime.MessageSender;

interface ValidationResult {
  currentTabStatus: DmExtTabStatus;
  host: string;
}

interface CachedValue {
  value: ValidationResult;
  timestamp: number;
}

class BackgroundService {
  private tabIdDetectionPending: number | null = null;
  private validationCache: Map<string, CachedValue> = new Map();
  private domainMap: Set<string> = new Set();
  analyticsService = new GaAnalytics();
  messagingService: ExtensionMessagingService | null = null;
  cachingInterval = timeConstants.ms * timeConstants.sec * timeConstants.min; // 1hour

  setMessagingService(port: Port) {
    this.messagingService = new ExtensionMessagingService({
      port: port,
      onMessage: async (msg: unknown, sender?: MessageSender) =>
        await this.handleBackgroundMessages(msg, sender),
      onDisconnect: async () =>
        await this.analyticsService.fireEvent(GaEventNames.UserSessionEnded),
    });
  }

  async requestAllUrlsPermission() {
    const allowed = await chrome.permissions.request({
      origins: [allUrlsMatchPattern],
    });
    if (allowed) {
      await this.analyticsService.fireEvent(GaEventNames.PermissionsGranted);
      const isContentScriptsRegistered = await getIsContentScriptsRegistered();
      if (!isContentScriptsRegistered) await registerContentScripts();
    } else {
      await this.analyticsService.fireEvent(GaEventNames.PermissionsDenied);
    }
  }

  async handleInstall(): Promise<void> {
    await browser.runtime.openOptionsPage();
    await browser.action.openPopup();
    await this.analyticsService.fireEvent(GaEventNames.ExtensionInstalled);
  }

  async handleUpdate(): Promise<void> {
    const hasAllPermissions = await getHasAllUrlsPermission();
    if (!hasAllPermissions) {
      await this.requestAllUrlsPermission();
    } else {
      const isContentScriptsRegistered = await getIsContentScriptsRegistered();
      if (!isContentScriptsRegistered) {
        await registerContentScripts();
      }
    }
    await this.updateTabStatus();
  }

  async getTab(): Promise<Tabs.Tab | undefined> {
    const [activeTab] = await browser.tabs.query({ active: true, lastFocusedWindow: true });
    if (activeTab) return activeTab;
    const tabs = await browser.tabs.query({
      active: false,
    });
    const [tab] = (tabs ?? []).sort((a, b) =>
      a?.lastAccessed && b?.lastAccessed ? b.lastAccessed - a.lastAccessed : -1,
    );
    return tab;
  }

  async updateTabStatus(tabId?: number): Promise<void> {
    const tab = tabId ? await browser.tabs.get(tabId) : await this.getTab();
    if (this.tabIdDetectionPending === tabId) return;
    const { domainAuthenticityVerification, userDomainsWhiteList } = await optionsStorage.getAll();
    if (tabId) {
      this.tabIdDetectionPending = tabId;
    }
    const parsedUrlHost = getHostName(tab?.url);
    this.messagingService?.postActionMessage({
      action: MessageActionNames.SetTabStatus,
      currentTabStatus: DmExtTabStatus.Processing,
      domain: parsedUrlHost,
    });
    const cachedValue = this.getCachedValue(parsedUrlHost, userDomainsWhiteList);
    const result =
      domainAuthenticityVerification && cachedValue
        ? cachedValue
        : await this.checkDmarketDomain(parsedUrlHost, !domainAuthenticityVerification);
    if (!cachedValue && parsedUrlHost && domainAuthenticityVerification) {
      this.setCachedValue(parsedUrlHost, result);
    }
    await optionsStorage.set({
      currentTabStatus: result.currentTabStatus,
      lastValidatedDomain: result.host,
    });
    await this.updateIconAndOpenPopup(domainAuthenticityVerification, result.currentTabStatus);
    if (tabId) {
      this.tabIdDetectionPending = null;
    }
    this.messagingService?.postActionMessage({
      action: MessageActionNames.SetTabStatus,
      currentTabStatus: result.currentTabStatus,
      domain: result.host,
    });
    if (result.currentTabStatus === DmExtTabStatus.Alert && tabId && tab?.url) {
      await browser.tabs.update(tabId, {
        url: browser.runtime.getURL(`/phishing-blocker.html?blockedUrl=${tab?.url}`),
        active: true,
      });
    }
  }

  async getDomainMap(): Promise<Set<string>> {
    const { domainMapUpdatedAt } = await optionsStorage.getAll();
    if (
      domainMapUpdatedAt &&
      Date.now() - domainMapUpdatedAt < this.cachingInterval &&
      this.domainMap.size > 0
    ) {
      return this.domainMap;
    }
    try {
      const response = await fetch(`${dmExtApiUrl}/blacklisted-domains`);
      const blackList: { domains: string[] } = response.ok
        ? await response.json()
        : blackListedDomains;
      if (!response.ok) {
        await this.analyticsService.fireEvent(GaEventNames.DomainVerificationError, {
          cause: parseError(response.statusText),
        });
      }
      this.domainMap = new Set(blackList.domains);
      await optionsStorage.set({ domainMapUpdatedAt: Date.now() });
    } catch (e) {
      await this.analyticsService.fireEvent(GaEventNames.DomainVerificationError, {
        cause: parseError(e),
      });
    }
    return this.domainMap;
  }

  private async updateIconAndOpenPopup(
    domainAuthenticityVerification: boolean,
    status: DmExtTabStatus,
  ): Promise<void> {
    const isAlert = status === DmExtTabStatus.Alert;
    const path = actionIcons[status];
    const title = `${dmExtDefaultTitle}${domainAuthenticityVerification ? '' : ` - ${getI18nMessage('dm_ext_icon_disabled')}`}`;
    const text = isAlert ? '!' : '';
    const color = isAlert ? '#ba5342' : '#cccccc';
    await browser.action.setIcon({ path });
    await browser.action.setTitle({ title });
    await browser.action.setBadgeBackgroundColor({ color });
    await browser.action.setBadgeText({ text });
    if (isAlert) {
      const tab = await this.getTab();
      if (tab?.windowId) {
        const { focused } = await browser.windows.get(tab?.windowId);
        if (focused) {
          try {
            await browser.action.openPopup({ windowId: tab.windowId });
          } catch (e) {
            console.info(e);
          }
        }
      }
    }
  }

  private getCachedValue(host?: string, userWhiteList  = ''): ValidationResult | undefined {
    if (!host) return undefined;
    const whiteList = userWhiteList.split(',').filter(Boolean);
    if (whiteList.includes(host)) {
      return { currentTabStatus: DmExtTabStatus.Unknown, host };
    }
    const result = this.validationCache.get(host);
    return result?.timestamp && Date.now() - result.timestamp < this.cachingInterval
      ? result.value
      : undefined;
  }

  private parseError(e: unknown): string {
    return parseError(e, getI18nMessage('dm_ext_unknown_error'));
  }

  private setCachedValue(host: string, value: ValidationResult): void {
    if (this.validationCache.size > maxValidationCacheSize) {
      this.validationCache.delete(this.validationCache.keys().next().value);
    }
    this.validationCache.delete(host);
    this.validationCache.set(host, { value, timestamp: Date.now() });
  }

  private async checkDmarketDomain(host?: string, isDisabled = false): Promise<ValidationResult> {
    if (isDisabled) return { currentTabStatus: DmExtTabStatus.Disabled, host: host ?? '' };
    if (!host) return { currentTabStatus: DmExtTabStatus.Unknown, host: '' };
    try {
      const allowedHosts = dmExtDmarketHosts;
      const blackList = await this.getDomainMap();
      const banned = blackList.has(host);
      const matching = allowedHosts.includes(host);
      const status = banned
        ? DmExtTabStatus.Alert
        : matching
          ? DmExtTabStatus.Safe
          : DmExtTabStatus.Unknown;
      const eventName = dmExtEventToStatusMap[status];
      if (eventName) await this.analyticsService.fireEvent(eventName);
      return { currentTabStatus: status, host };
    } catch (e) {
      const error = this.parseError(e);
      await this.analyticsService.fireEvent(GaEventNames.DomainVerificationError, { error });
      return { currentTabStatus: DmExtTabStatus.Error, host };
    }
  }

  private async handleBackgroundMessages(message: unknown, sender?: MessageSender): Promise<void> {
    if (isApiMessage(message)) {
      try {
        if (message.dmExtApi && !message.dmExtApi.startsWith('/')) {
          console.info('Invalid API path', message.dmExtApi);
        }
        const response = await fetch(`${dmExtApiUrl}${message.dmExtApi}`, message.options);
        if (!response.ok) {
          await this.analyticsService.fireErrorEvent(response.text());
          throw new Error(getI18nMessage('dm_ext_unknown_error'), { cause: response });
        }
        const body = await response.json();
        this.messagingService?.postApiMessage({ dmExtApi: message.dmExtApi, body }, sender);
      } catch (e) {
        this.messagingService?.postApiMessage(
          {
            dmExtApi: message.dmExtApi,
            error: this.parseError(e),
          },
          sender,
        );
      }
    }
    if (isAnalyticsMessage(message) && message.eventName) {
      await this.analyticsService.fireEvent(message.eventName, message.params);
    }

    if (
      isActionMessage(message) &&
      message.action === MessageActionNames.RequestAllUrlsPermission
    ) {
      await this.requestAllUrlsPermission();
    }

    if (isActionMessage(message) && message.action === MessageActionNames.SyncOptions) {
      if (message.options) {
        await optionsStorage.set(message.options);
        const action = message.options.tradeBotsVerification
          ? MessageActionNames.ShowTradeOfferWidget
          : MessageActionNames.CloseTradeOfferWidget;
        const windows = await chrome.windows.getAll();
        for (const window of windows) {
          const steamTabs = await browser.tabs.query({
            url: 'https://steamcommunity.com/*',
            windowId: window.id,
            muted: false,
          });
          for (const tab of steamTabs) {
            if (tab?.id)
              try {
                await browser.tabs.sendMessage(tab.id, {
                  action,
                });
              } catch (e) {
                console.info(e);
              }
          }
        }
      }
    }
    if (isActionMessage(message) && message.action === MessageActionNames.CheckTabDomain) {
      const hasAllUrlsPermission = await getHasAllUrlsPermission();
      if (hasAllUrlsPermission) {
        await this.updateTabStatus();
      }
    }
    if (isActionMessage(message) && message.action === MessageActionNames.RedirectToDmarket) {
      const tab = await this.getTab();
      if (!tab?.id) return;
      await browser.tabs.update(tab.id, { url: dmExtDmarketOfficialUrl, active: true });
    }
  }
}

const backgroundService = new BackgroundService();

addEventListener('unhandledrejection', async (event) => {
  await backgroundService.analyticsService.fireErrorEvent(event.reason);
  event.preventDefault();
});

browser.runtime.onInstalled.addListener(async ({ reason }) => {
  await browser.runtime.setUninstallURL(dmExtUninstallUrl);
  setInterval(() => backgroundService.getDomainMap(), backgroundService.cachingInterval);
  if (reason === 'install') {
    return await backgroundService.handleInstall();
  }
  if (reason === 'update') {
    return await backgroundService.handleUpdate();
  }
});

browser.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId >= 0) {
    backgroundService?.messagingService?.postActionMessage({
      action: MessageActionNames.ClosePopup,
    });
  }
  await backgroundService.updateTabStatus();
});

browser.tabs.onActivated.addListener(
  async (info) => await backgroundService.updateTabStatus(info.tabId),
);

browser.tabs.onUpdated.addListener(async (tabId, info) => {
  if (info.status !== 'complete') return;
  await backgroundService.updateTabStatus(tabId);
});

browser.runtime.onConnect.addListener((port) =>
  backgroundService.setMessagingService(port as Port),
);

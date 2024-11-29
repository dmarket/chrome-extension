import { inject, Injectable, signal } from '@angular/core';
import { DmExtTabStatus, MessageActionNames } from '@myth/dm-ext-shared-constants';
import {
  AnalyticsMessage,
  DmExtOptions,
  isActionMessage,
  isApiMessage,
  optionsStorage,
  optionsStorageDefaults,
  optionsStorageMock,
} from '@myth/dm-ext-shared-extension-utils';
import { ExtensionMessagingService } from '@myth/dm-ext-shared-utils';
import { isWebPage } from 'webext-detect';
import OptionsSync from 'webext-options-sync';
import { DmExtMessagingApiService } from './dm-ext-messaging-api.service';

@Injectable({ providedIn: 'root' })
export class DmExtMessagingFacadeService {
  private readonly api = inject(DmExtMessagingApiService);
  status = signal<DmExtTabStatus>(DmExtTabStatus.Processing);
  lastValidatedDomain = signal<string | undefined>(undefined);
  options = signal<DmExtOptions>(optionsStorageDefaults);
  apiError = signal<{ api: string; error: string } | null>(null);
  messagingService: ExtensionMessagingService = new ExtensionMessagingService({
    onMessage: async (msg: unknown) => this.handleBackgroundMessages(msg),
    onDisconnect: () => void 0,
  });

  private storage: OptionsSync<DmExtOptions>;

  constructor() {
    if (isWebPage()) {
      this.storage = optionsStorageMock;
      const domain = new URL(window.location.href).host;
      this.lastValidatedDomain.set(domain);
    } else {
      this.storage = optionsStorage;
      this.storage.getAll().then((options) => {
        this.options.set(options);
        this.status.set(options.currentTabStatus);
        this.lastValidatedDomain.set(options.lastValidatedDomain);
      });
    }
  }

  async getOptions(): Promise<DmExtOptions> {
    const options = await this.storage.getAll();
    this.options.set(options);
    this.status.set(options.currentTabStatus);
    return this.options();
  }

  async setOptions(opts: Partial<DmExtOptions>): Promise<DmExtOptions> {
    await this.storage.set(opts);
    const options = await this.getOptions();
    this.messagingService.postActionMessage({
      action: MessageActionNames.SyncOptions,
      options,
    });
    return options;
  }

  async checkTabDomain(skipOptions = false) {
    if (skipOptions) await this.getOptions();
    this.messagingService.postActionMessage({
      action: MessageActionNames.CheckTabDomain,
    });
  }

  async requestAllUrlsPermission() {
    this.messagingService.postActionMessage({
      action: MessageActionNames.RequestAllUrlsPermission,
    });
  }

  async redirectToDmarket() {
    this.messagingService.postActionMessage({
      action: MessageActionNames.RedirectToDmarket,
    });
  }

  async submitDomainReport(report: {
    domain: string;
    email: string;
    channel: string;
  }): Promise<{ success: boolean; result: void | unknown }> {
    return await this.api.submitDomainReport(report);
  }

  async submitContactSupportRequest(report: {
    topic: string;
    email: string;
    message: string;
  }): Promise<{ success: boolean; result: void | unknown }> {
    return await this.api.submitContactSupportRequest(report);
  }

  sendGaEvent(message: AnalyticsMessage) {
    this.messagingService.postAnalyticsMessage(message);
  }

  private handleBackgroundMessages(message: unknown): void {
    if (isActionMessage(message) && message.action === MessageActionNames.ClosePopup) {
      window.close();
    }
    if (
      isActionMessage(message) &&
      message.action === MessageActionNames.SetTabStatus &&
      message.currentTabStatus
    ) {
      this.status.set(message.currentTabStatus);
      this.lastValidatedDomain.set(message.domain);
    }
    if (isApiMessage(message) && message.error) {
      this.apiError.set({ error: message.error, api: message.dmExtApi });
    }
  }
}

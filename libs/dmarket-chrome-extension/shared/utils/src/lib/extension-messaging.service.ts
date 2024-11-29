import { dmExtId, dmExtMessagingChannel } from '@myth/dm-ext-shared-constants';
import { ActionMessage, AnalyticsMessage, ApiMessage } from '@myth/dm-ext-shared-extension-utils';
import { isContentScript, isWebPage } from 'webext-detect';

export type Port = chrome.runtime.Port & { error?: boolean };

export class ExtensionMessagingService {
  port: Port | null = null;

  constructor(options: {
    onMessage: (msg: unknown, sender?: chrome.runtime.MessageSender) => Promise<void>;
    onDisconnect: () => void;
    port?: Port;
  }) {
    const isWeb = isWebPage();
    const isContent = isContentScript();
    if (isWeb && !isContent) return;
    this.port = options.port
      ? options.port
      : isWeb
        ? chrome.runtime.connect(dmExtId, { name: dmExtMessagingChannel })
        : chrome.runtime.connect({ name: dmExtMessagingChannel });
    this.port.onDisconnect.addListener(() => {
      this.port = null;
      options.onDisconnect();
    });
    this.port.onMessage.addListener((msg: unknown, port: Port) =>
      options.onMessage(msg, port?.sender),
    );
    chrome.runtime.onMessage.addListener(options.onMessage.bind(this));
  }

  postAnalyticsMessage(message: AnalyticsMessage, sender?: chrome.runtime.MessageSender): void {
    this.postMessage<AnalyticsMessage>(message, sender);
  }

  postActionMessage(message: ActionMessage, sender?: chrome.runtime.MessageSender): void {
    this.postMessage<ActionMessage>(message, sender);
  }

  postApiMessage(message: ApiMessage, sender?: chrome.runtime.MessageSender): void {
    this.postMessage<ApiMessage>(message, sender);
  }

  private getPort(): Port | null {
    if (!this.port) return null;
    if (this.port?.error) {
      this.port = null;
      return null;
    }
    return this.port;
  }

  private postMessage<T>(message: T, sender?: chrome.runtime.MessageSender): void {
    const port = this.getPort();
    if (!port) return;
    port.postMessage(message as T);
    if (sender?.tab?.id) {
      chrome.tabs.sendMessage(sender.tab.id, message);
    }
  }
}

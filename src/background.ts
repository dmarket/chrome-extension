import { ACTION_ERROR_ICONS, ACTION_VALID_ICONS } from '@ext/shared/constants';

chrome.runtime.onInstalled.addListener(() => {
  const checkDmarketDomain = async (url?: string, id?: number) => {
    if (url && id) {
      try {
        const parsedUrl = new URL(url);
        const allowedHosts = ['dmarket.com', 'www.dmarket.com'];
        const matching = allowedHosts.includes(parsedUrl.host);
        await chrome.action.setIcon({
          path: matching ? ACTION_VALID_ICONS : ACTION_ERROR_ICONS,
          tabId: id,
        });
      } catch (e) {
        console.error('Invalid URL:', url);
      }
    }
  };
  chrome.webNavigation.onCompleted.addListener(async () => {
    const [{ url, id }] = await chrome.tabs.query({ active: true, currentWindow: true });
    await checkDmarketDomain(url, id);
  });
  chrome.tabs.onActivated.addListener(async info => {
    const { url, id } = await chrome.tabs.get(info.tabId);
    await checkDmarketDomain(url, id);
  });
});

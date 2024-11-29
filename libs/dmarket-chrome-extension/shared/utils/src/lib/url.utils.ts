import { dmExtUrlPattern } from '@myth/dm-ext-shared-constants';

export const getHostName = (url?: string): string | undefined => {
  if (!url) return undefined;
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.host.replace(/^www\./, '');
  } catch (e) {
    const regex = new RegExp(dmExtUrlPattern);
    if (regex.test(url)) {
      return url;
    }
    // Invalid URL (e.g chrome://extensions || chrome-extension:// etc);
    return undefined;
  }
};

export function isExternalUrl(url: string) {
  try {
    new URL(url);
    return true;
    // eslint-disable-next-line
  } catch (err: unknown) {
    return false;
  }
}

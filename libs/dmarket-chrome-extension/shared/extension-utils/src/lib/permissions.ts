import { allUrlsMatchPattern } from '@myth/dm-ext-shared-constants';
import browser from 'webextension-polyfill';

export async function getHasAllUrlsPermission() {
  const activePermissions = await browser.permissions.getAll();
  return activePermissions.origins?.indexOf(allUrlsMatchPattern) !== -1;
}

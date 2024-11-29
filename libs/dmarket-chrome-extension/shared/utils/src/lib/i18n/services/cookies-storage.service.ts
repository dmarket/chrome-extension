import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { CookiesHelpersService } from './cookies-helpers.service';
import { IStorage, IStorageOptions } from './storage.models';

@Injectable({ providedIn: 'root' })
export class CookiesStorageService implements IStorage {
  SUPPORTED: boolean;
  private readonly defaultOptions: IStorageOptions = {
    expires: 2147483647,
    path: '/',
  };

  constructor(
    @Inject(PLATFORM_ID) private currentPlatform: Record<string, unknown>,
    private cookiesHelpersService: CookiesHelpersService,
  ) {
    this.SUPPORTED = this.cookiesEnabled();
  }

  set(key: string, data: string, options?: IStorageOptions) {
    const opts = { ...this.defaultOptions, ...options };
    if (this.SUPPORTED) {
      try {
        this.cookiesHelpersService.setCookie(key, data, opts);
        // eslint-disable-next-line
      } catch (err: unknown) {
        throw new Error('Cookies setting failed. Consider using another storage to save data');
      }
    }
  }

  get(key: string): string | null {
    if (this.SUPPORTED) {
      const data: string | undefined = this.cookiesHelpersService.getCookie(key);
      return data || null;
    } else {
      return null;
    }
  }

  remove(key: string, options?: object): void {
    if (this.SUPPORTED) {
      this.cookiesHelpersService.deleteCookie(key, options);
    }
  }

  private cookiesEnabled(): boolean {
    if (isPlatformServer(this.currentPlatform)) {
      return true;
    }
    if (isPlatformBrowser(this.currentPlatform)) {
      let enabled = navigator.cookieEnabled;
      if (!enabled) {
        document.cookie = 'cookie-test';
        enabled = document.cookie.indexOf('cookie-test') !== -1;
      }
      return enabled;
    }
    return false;
  }
}

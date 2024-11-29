import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Inject, Injectable, Optional, PLATFORM_ID } from '@angular/core';
import { CookieExpires, CookieOptions, request as reqToken } from './storage.models';

export const noValueCookieFlags = ['Secure', 'secure', 'httpOnly'];

@Injectable({ providedIn: 'root' })
export class CookiesHelpersService {
  constructor(
    @Inject(PLATFORM_ID) private platform: object,
    @Optional() @Inject(reqToken) private request: { headers: { cookie: string } },
  ) {}

  getCookie(name: string) {
    const matches = this.getCookieString().match(
      // eslint-disable-next-line no-useless-escape
      new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'),
    );
    return matches ? decodeURIComponent(matches[1]) : void 0;
  }

  setCookie(name: string, value: string, options: CookieOptions) {
    if (!isPlatformBrowser(this.platform)) {
      return;
    }
    options = options || {};
    let expires = options.expires;
    const second = 1000;

    if (this.valueIsNumber(expires)) {
      const d = new Date();
      d.setTime(d.getTime() + expires * second);
      expires = options.expires = d;
    }

    if (this.valueIsDate(expires)) {
      options.expires = expires.toUTCString();
    }
    value = encodeURIComponent(value);
    let updatedCookie = name + '=' + value;
    Object.entries(options).forEach(([propName, propValue]) => {
      if (noValueCookieFlags.includes(propName)) {
        updatedCookie += propValue === true ? '; ' + propName : '';
      } else {
        updatedCookie += propValue === true ? '; ' + propName : '; ' + propName + '=' + propValue;
      }
    });
    document.cookie = updatedCookie;
  }

  deleteCookie(name: string, options: CookieOptions = { path: '/' }) {
    const opts = { ...options, expires: -1 };
    this.setCookie(name, '', opts);
  }

  private getCookieString() {
    if (isPlatformBrowser(this.platform)) {
      return document.cookie;
    }
    if (isPlatformServer(this.platform) && this.request) {
      return this.request.headers.cookie || '';
    }
    return '';
  }

  private valueIsDate(result: CookieExpires): result is Date {
    return typeof (result as Date).toUTCString === 'function';
  }

  private valueIsNumber(result: CookieExpires): result is number {
    return typeof (result as number) === 'number' && !isNaN(result as number);
  }
}

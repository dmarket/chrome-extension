import { Injectable } from '@angular/core';
import { Lang, translateCookie } from '@myth/dm-ext-shared-constants';
import { CookiesStorageService } from '../services/cookies-storage.service';

@Injectable({ providedIn: 'root' })
export class LanguageStorageService {
  constructor(private cookieStorageService: CookiesStorageService) {}

  set(lang: Lang) {
    this.cookieStorageService.set(translateCookie, lang);
  }

  get(): Lang | null {
    const lang = this.cookieStorageService.get(translateCookie);
    return lang ? (lang as Lang) : null;
  }
}

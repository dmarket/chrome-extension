import { Injectable } from '@angular/core';
import { getBrowserLang } from '@jsverse/transloco';
import { defaultLang, Lang } from '@myth/dm-ext-shared-constants';
import { LanguageStorageService } from './language-storage.service';
import { getLangFromUrl, getSupportedLanguages } from './translate-helpers';

@Injectable({
  providedIn: 'root',
})
export class PreferredLanguageService {
  constructor(private translateStorageService: LanguageStorageService) {}

  // getInitialLanguage was moved to separate PreferredLanguageService to use location instead or
  // Router is not supported inside APP_INITIALIZER deps (see translationInitLoader implementation)
  getInitialLanguage(url: string): Lang {
    const langFromUrl: Lang = getLangFromUrl(url);
    const storageLanguage: string | null = this.translateStorageService.get();
    const prevSessionLanguage: string | null = this.validateLanguageCode(storageLanguage)
      ? storageLanguage
      : null;
    const browserLanguage: string | null = this.getBrowserLanguage();
    return langFromUrl || prevSessionLanguage || browserLanguage || defaultLang;
  }

  private getBrowserLanguage(): Lang | null {
    const browserLang: string | undefined = getBrowserLang();
    return this.validateLanguageCode(browserLang ?? null) ? (browserLang as Lang) : null;
  }

  private validateLanguageCode(code: string | null): boolean {
    return code ? getSupportedLanguages().includes(code) : false;
  }
}

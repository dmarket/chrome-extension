import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Translation, TranslocoLoader } from '@jsverse/transloco';
import { defaultLang } from '@myth/dm-ext-shared-constants';

@Injectable({ providedIn: 'root' })
export class TranslocoLocalLoader implements TranslocoLoader {
  constructor(private http: HttpClient) {}

  getTranslation(lang: string) {
    const url = '/assets/i18n';
    return this.http.get<Translation>(`${url}/${lang ? lang : defaultLang}.json`);
  }
}

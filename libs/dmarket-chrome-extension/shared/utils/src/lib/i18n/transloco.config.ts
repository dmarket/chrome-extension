import { Location } from '@angular/common';
import { APP_INITIALIZER, ApplicationConfig, isDevMode } from '@angular/core';
import { TRANSLOCO_LOADER, TranslocoService, provideTransloco } from '@jsverse/transloco';
import { provideTranslocoLocale } from '@jsverse/transloco-locale';
import { defaultLang, languageLocales, languages } from '@myth/dm-ext-shared-constants';
import { LanguageStorageService } from './translate/language-storage.service';
import { PreferredLanguageService } from './translate/preferred-language.service';
import { translationInitLoader } from './transloco-init-loader';
import { TranslocoLocalLoader } from './transloco-local-loader.service';

export const translocoConfig: ApplicationConfig = {
  providers: [
    provideTransloco({
      config: {
        availableLangs: Object.keys(languages),
        defaultLang: defaultLang,
        fallbackLang: [defaultLang],
        missingHandler: {
          allowEmpty: true,
          useFallbackTranslation: true,
          logMissingKey: isDevMode(),
        },
        flatten: {
          aot: true,
        },
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslocoLocalLoader,
    }),
    { provide: TRANSLOCO_LOADER, useClass: TranslocoLocalLoader },
    {
      provide: APP_INITIALIZER,
      useFactory: translationInitLoader,
      deps: [TranslocoService, Location, PreferredLanguageService, LanguageStorageService],
      multi: true,
    },
    provideTranslocoLocale({ langToLocaleMapping: languageLocales }),
  ],
};

import { Location } from '@angular/common';
import { TranslocoService } from '@jsverse/transloco';
import { LanguageStorageService } from './translate/language-storage.service';
import { PreferredLanguageService } from './translate/preferred-language.service';

export function translationInitLoader(
  transloco: TranslocoService,
  location: Location,
  preferredLanguageService: PreferredLanguageService,
  translateStorageService: LanguageStorageService,
) {
  const language = preferredLanguageService.getInitialLanguage(location.path());
  transloco.setActiveLang(language);
  translateStorageService.set(language);
  return () => void 0;
}

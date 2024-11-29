import { Routes } from '@angular/router';
import { defaultLang, Lang, languages } from '@myth/dm-ext-shared-constants';

export function getLangFromUrl(url: string, defLang = defaultLang): string {
  const urlFirstPart = getUrlParts(url).filter((part) => part.length > 0)[0];
  const languageCode = getLanguageConfigByUrlCode(urlFirstPart);
  return languageCode ? languageCode : defLang;
}

export function getLanguageConfigByUrlCode(urlCode: string | null): string | undefined {
  return urlCode === defaultLang
    ? defaultLang
    : Object.keys(languages).find((language) => languages[language].urlCode === urlCode);
}

function getUrlParts(url: string): string[] {
  return removeUrlOrigin(url)
    .split('/')
    .filter((part) => part.length > 0);
}

export function getSupportedLanguages(): Lang[] {
  return Object.keys(languages);
}

export function getSupportedLanguageUrlCodes(includedLanguages: string[] = []): string[] {
  const availableLanguages: string[] = Object.keys(languages).map((l) => languages[l].urlCode);
  return availableLanguages.filter((item) =>
    includedLanguages.includes(item === '' ? defaultLang : item),
  );
}

function removeUrlOrigin(url: string): string {
  return url.replace(/^.*\/\/[^/]+/, '');
}

export function localizeRoutes(routes: Routes, includedLanguages: string[] = []): Routes {
  const localizedRoutes = getSupportedLanguageUrlCodes(includedLanguages).map((key) => ({
    path: key,
    children: routes,
  }));
  if (includedLanguages.includes(defaultLang)) {
    localizedRoutes.push({
      path: defaultLang,
      children: routes,
    });
  }
  return localizedRoutes;
}

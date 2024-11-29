/** Locale system enumeration */
export interface LanguageConfig {
  title: string;
  titleShort: string;
  flagIconName: string;
  urlCode: string;
}

// Double-check the code according to https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes when adding new languages
// the exact match is required for automatic language getting from browser
export const languages: { [l in string]: LanguageConfig } = {
  de: { title: 'Deutsch', titleShort: 'De', flagIconName: 'germany', urlCode: 'de' },
  en: { title: 'English', titleShort: 'En', flagIconName: 'usa', urlCode: '' },
  es: { title: 'Español', titleShort: 'Es', flagIconName: 'spain', urlCode: 'es' },
  fr: { title: 'Française', titleShort: 'Fr', flagIconName: 'france', urlCode: 'fr' },
  zh: { title: '中文', titleShort: 'Zh', flagIconName: 'china', urlCode: 'zh' },
  ko: { title: '한국어', titleShort: 'Ko', flagIconName: 'korea', urlCode: 'ko' },
  ja: { title: '日本語', titleShort: 'Ja', flagIconName: 'japan', urlCode: 'ja' },
  pl: { title: 'Polski', titleShort: 'Pl', flagIconName: 'poland', urlCode: 'pl' },
  pt: { title: 'Português', titleShort: 'Pt', flagIconName: 'portugal', urlCode: 'pt' },
  ru: { title: 'Русский', titleShort: 'Рус', flagIconName: 'rus', urlCode: 'ru' },
  tr: { title: 'Türkçe', titleShort: 'Tr', flagIconName: 'turkey', urlCode: 'tr' },
  uk: { title: 'Українська', titleShort: 'Ua', flagIconName: 'ukraine', urlCode: 'ua' },
};

export const languageLocales: { [locale in Lang]: string } = {
  de: 'de-DE',
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  zh: 'zh-CN',
  ko: 'ko-KR',
  ja: 'ja-JP',
  pl: 'pl-PL',
  pt: 'pt-PT',
  ru: 'ru-RU',
  tr: 'tr-TR',
  uk: 'uk-UA',
};

export const defaultLang: Lang = 'en';
export const translateCookie = 'dm-language';
export type Lang = keyof typeof languages;

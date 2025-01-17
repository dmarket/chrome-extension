import { $$ } from 'select-dom';

export function injectStyle(css: string) {
  if (!css || typeof document === 'undefined') return;

  const headElement = document.head || document.getElementsByTagName('head')[0];
  const styleElement = document.createElement('style');

  headElement.appendChild(styleElement);

  styleElement.appendChild(document.createTextNode(css));
}

export function injectStyleLink(href: string) {
  if (!href || typeof document === 'undefined') return;
  const headElement = document.head || document.getElementsByTagName('head')[0];
  const styleElement = document.createElement('link');
  styleElement.rel = 'stylesheet';
  styleElement.href = href;
  headElement.appendChild(styleElement);
}

export function findInScriptElements(regexp: string | RegExp) {
  for (const scriptElement of $$('script[type="text/javascript"]')) {
    const match = scriptElement.textContent?.match(regexp);
    if (match) {
      return match[1];
    }
  }
  return;
}

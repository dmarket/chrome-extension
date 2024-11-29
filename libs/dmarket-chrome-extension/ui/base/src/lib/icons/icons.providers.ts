import { APP_INITIALIZER } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { dmExtSvgIcons } from './icons.config';

export function customMatIconsLoader(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
  Object.entries(dmExtSvgIcons).forEach(([name, svg]) => {
    iconRegistry.addSvgIconLiteral(name, sanitizer.bypassSecurityTrustHtml(svg));
  });
  return () => void 0;
}

export const customMatIconsLoaderProviders = [
  {
    provide: APP_INITIALIZER,
    useFactory: customMatIconsLoader,
    deps: [MatIconRegistry, DomSanitizer],
    multi: true,
  },
];

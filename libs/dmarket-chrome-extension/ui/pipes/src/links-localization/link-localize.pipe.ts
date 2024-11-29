import { inject, Pipe, PipeTransform, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoService } from '@jsverse/transloco';
import { isExternalUrl } from '@myth/dm-ext-shared-utils';
import { MainLanguages } from './localize-links';

@Pipe({
  standalone: true,
  name: 'dmExtLinkLocalize',
})
export class DmExtLinkLocalizePipe implements PipeTransform {
  private transloco: TranslocoService = inject(TranslocoService);
  private lang: Signal<string | undefined> = toSignal(this.transloco.langChanges$, {
    initialValue: this.transloco.getActiveLang(),
  });

  transform(link: string | null | undefined): string {
    if (!link) return '';
    return this.localizeLink(link, this.lang() as MainLanguages);
  }

  private localizeLink(link: string, lang: MainLanguages): string {
    if (lang !== 'en' && link.startsWith('#')) {
      return `/${lang}${link}`;
    }
    return `${isExternalUrl(link) || lang === 'en' ? '' : '/' + lang}${link.startsWith('/') ? link : '/' + link}`;
  }
}

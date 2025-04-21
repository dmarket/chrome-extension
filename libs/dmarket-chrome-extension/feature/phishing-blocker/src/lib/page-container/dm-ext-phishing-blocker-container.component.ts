import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoDirective } from '@jsverse/transloco';
import { DmExtMessagingFacadeService } from '@myth/dm-ext-data-access-messaging';
import { getHostName } from '@myth/dm-ext-shared-utils';
import { DmExtButtonComponent, DmExtIconsEnum, ImageComponent } from '@myth/dm-ext-ui-base';
import { dmExtDomainReportForm } from '@myth/dm-ext-shared-constants';

const redirectTimeout = 300;
@Component({
  selector: 'dm-ext-phishing-blocker-container',
  templateUrl: './dm-ext-phishing-blocker-container.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [TranslocoDirective, FormsModule, DmExtButtonComponent, ImageComponent],
  host: {
    class: 'flex flex-col grow',
  },
})
export class DmExtPhishingBlockerContainerComponent implements OnInit {
  private readonly messagingFacadeService = inject(DmExtMessagingFacadeService);
  options = this.messagingFacadeService.options;
  blockedUrl: WritableSignal<string | null> = signal(null);
  readonly svgIcons = DmExtIconsEnum;
  readonly reportLink = dmExtDomainReportForm;

  async ngOnInit() {
    await this.messagingFacadeService.getOptions();
    const blockedUrl = new URLSearchParams(window.location.search).get('blockedUrl');
    if (blockedUrl) {
      this.blockedUrl.set(blockedUrl);
    }
  }

  async proceed() {
    const blockedUrl = this.blockedUrl();
    if (blockedUrl) {
      const existingWhiteList = (this.options().userDomainsWhiteList ?? '')
        .split(',')
        .filter(Boolean);
      const host = getHostName(blockedUrl);
      if (host) {
        const hasValue = existingWhiteList.includes(host);
        if (!hasValue) existingWhiteList.push(host);
      }
      await this.messagingFacadeService.setOptions({
        userDomainsWhiteList: existingWhiteList.join(','),
      });
      setTimeout(() => window.location.replace(blockedUrl), redirectTimeout);
    }
  }
}

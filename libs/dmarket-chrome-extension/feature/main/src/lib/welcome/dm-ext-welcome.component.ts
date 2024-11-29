import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { DmExtMessagingFacadeService } from '@myth/dm-ext-data-access-messaging';
import { DmExtTabStatus } from '@myth/dm-ext-shared-constants';
import { DmExtButtonComponent, DmExtIconsEnum } from '@myth/dm-ext-ui-base';
import { DmExtStatusIconComponent } from '@myth/dm-ext-ui-domains';
import { DmExtLinkLocalizePipe } from '@myth/dm-ext-ui-pipes';

@Component({
  selector: 'dm-ext-welcome',
  templateUrl: './dm-ext-welcome.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    TranslocoDirective,
    DmExtButtonComponent,
    MatIcon,
    DmExtStatusIconComponent,
    DmExtLinkLocalizePipe,
  ],
  providers: [DmExtLinkLocalizePipe],
  host: {
    class: 'flex flex-col grow',
  },
})
export class DmExtWelcomeComponent {
  private readonly messagingFacadeService = inject(DmExtMessagingFacadeService);
  private readonly router = inject(Router);
  private readonly linkLocalizePipe = inject(DmExtLinkLocalizePipe);
  readonly svgIcons = DmExtIconsEnum;
  readonly status = DmExtTabStatus.Safe;

  constructor() {
    effect(async () => {
      const status = this.messagingFacadeService.status();
      if (status === DmExtTabStatus.Alert) {
        await this.messagingFacadeService.setOptions({ tutorialShowed: true });
        await this.router.navigate([this.linkLocalizePipe.transform('/home')]);
      }
    });
  }
}

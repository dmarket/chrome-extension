import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { DmExtMessagingFacadeService } from '@myth/dm-ext-data-access-messaging';
import { DmExtButtonComponent, DmExtIconsEnum, ImageComponent } from '@myth/dm-ext-ui-base';
import { DmExtLinkLocalizePipe } from '@myth/dm-ext-ui-pipes';

@Component({
  selector: 'dm-ext-about-protection',
  templateUrl: './dm-ext-about-protection.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [TranslocoDirective, ImageComponent, DmExtButtonComponent, MatIcon],
  providers: [DmExtLinkLocalizePipe],
  host: {
    class: 'flex flex-col grow',
  },
})
export class DmExtAboutProtectionComponent {
  private readonly router = inject(Router);
  private readonly messagingFacadeService = inject(DmExtMessagingFacadeService);
  private readonly linkLocalizePipe = inject(DmExtLinkLocalizePipe);
  svgIcons = DmExtIconsEnum;

  async finishTutorial() {
    await this.messagingFacadeService.setOptions({ tutorialShowed: true });
    await this.router.navigate([this.linkLocalizePipe.transform('/home')]);
  }
}

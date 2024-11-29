import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { DmExtButtonComponent, DmExtIconsEnum } from '@myth/dm-ext-ui-base';
import { DmExtLinkLocalizePipe } from '@myth/dm-ext-ui-pipes';

@Component({
  selector: 'dm-ext-how-to-protect',
  templateUrl: './dm-ext-how-to-protect.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [TranslocoDirective, DmExtButtonComponent, MatIcon],
  providers: [DmExtLinkLocalizePipe],
  host: {
    class: 'flex flex-col grow',
  },
})
export class DmExtHowToProtectComponent {
  private readonly router = inject(Router);
  private readonly linkLocalizePipe = inject(DmExtLinkLocalizePipe);
  readonly svgIcons = DmExtIconsEnum;

  async goHome() {
    await this.router.navigate([this.linkLocalizePipe.transform('/home')]);
  }
}

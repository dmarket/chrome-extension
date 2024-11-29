import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { DmExtButtonComponent, DmExtIconsEnum } from '@myth/dm-ext-ui-base';
import { DmExtLinkLocalizePipe } from '@myth/dm-ext-ui-pipes';

@Component({
  standalone: true,
  selector: 'dm-ext-error-page',
  templateUrl: './dm-ext-error-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoDirective, RouterLink, DmExtButtonComponent, DmExtLinkLocalizePipe, MatIcon],
  host: {
    class: 'flex flex-col grow',
  },
})
export class DmExtErrorPageComponent {
  protected readonly svgIcons = DmExtIconsEnum;
}

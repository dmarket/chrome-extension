import { AsyncPipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ImageComponent } from '@myth/dm-ext-ui-base';
import { DmExtLinkLocalizePipe } from '@myth/dm-ext-ui-pipes';
import { DmExtMainMenuComponent } from './main-menu';

@Component({
  selector: 'dm-ext-main-header',
  templateUrl: './dm-ext-main-header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    ImageComponent,
    RouterLink,
    AsyncPipe,
    NgClass,
    DmExtMainMenuComponent,
    DmExtLinkLocalizePipe,
  ],
  host: {
    class: 'block w-full',
  },
})
export class DmExtMainHeaderComponent {
  isOptionsPage = input<boolean>(false);
}

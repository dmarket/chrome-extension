import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { DmExtIconsEnum } from '@myth/dm-ext-ui-base';
import { DmExtLinkLocalizePipe } from '@myth/dm-ext-ui-pipes';

@Component({
  standalone: true,
  selector: 'dm-ext-main-menu',
  imports: [
    CommonModule,
    DmExtLinkLocalizePipe,
    TranslocoDirective,
    RouterLink,
    RouterLinkActive,
    MatTooltip,
    MatIcon,
  ],
  templateUrl: './dm-ext-main-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-row flex-wrap items-center gap-6 h-full' },
})
export class DmExtMainMenuComponent {
  readonly links: {
    label: string;
    title: string;
    routerLink?: string;
    fragment?: string;
    href?: string;
    icon?: DmExtIconsEnum;
  }[] = [
    { routerLink: '/home', label: 'Home', title: 'Home', icon: DmExtIconsEnum.IconHome },
    { routerLink: '/report', label: 'Report', title: 'Report', icon: DmExtIconsEnum.IconReport },
    {
      routerLink: '/settings',
      label: 'Settings',
      title: 'Settings',
      icon: DmExtIconsEnum.IconSettings,
    },
  ];
}

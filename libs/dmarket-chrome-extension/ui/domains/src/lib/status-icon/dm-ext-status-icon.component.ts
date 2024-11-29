import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, Signal } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { DmExtTabStatus, statusIconConfig } from '@myth/dm-ext-shared-constants';
import { ImageComponent } from '@myth/dm-ext-ui-base';

interface Config {
  imageUrl: string;
  classes: string;
}

@Component({
  selector: 'dm-ext-status-icon',
  standalone: true,
  imports: [NgClass, ImageComponent, MatProgressSpinner],
  templateUrl: './dm-ext-status-icon.component.html',
  styleUrl: './dm-ext-status-icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'relative block w-[88px] aspect-square',
  },
})
export class DmExtStatusIconComponent {
  loading = input<boolean>(false);
  status = input.required<DmExtTabStatus>();
  config: Signal<Config> = computed(() => statusIconConfig[this.status()] ?? statusIconConfig.safe);
  statuses = DmExtTabStatus;
}

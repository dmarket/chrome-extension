import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ImageComponent } from '@ext/shared/components';

@Component({
  standalone: true,
  imports: [NgOptimizedImage, ImageComponent],
  selector: 'ext-header',
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {}

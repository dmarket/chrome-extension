import { NgClass, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { hostAttr } from '@myth/dm-ext-shared-utils';
import { ImageLoaderParams, type ImageTypes } from './image.models';

export const defaultImage =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

@Component({
  selector: 'dm-ext-shared-image',
  standalone: true,
  templateUrl: './image.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage, NgClass],
})
export class ImageComponent implements OnInit {
  @Input() src: string = defaultImage;
  @Input({ required: true }) alt!: string;
  @Input() type: ImageTypes = 'internalPathOptimized';
  @Input() srcset: string | null = null;
  @Input() sizes: string | undefined = undefined;
  @Input() priority = false;
  @Input() width: string | null = null;
  @Input() height: string | null = null;
  @Input() classes: string | string[] | null = null;
  errorImage = hostAttr<string | null>('errorImage', null);
  ariaLabel = hostAttr<string>('ariaLabel', 'Image');
  loaderParams!: ImageLoaderParams;

  ngOnInit(): void {
    switch (this.type) {
      case 'external':
        this.loaderParams = { isExternal: true, disablePathOptimizer: true };
        break;
      case 'internal':
        this.loaderParams = { disablePathOptimizer: true };
        break;
      case 'externalPathOptimized':
        this.loaderParams = { isExternal: true };
        break;

      default:
        this.loaderParams = {};
        break;
    }
  }

  onError(event: ErrorEvent): void {
    if (event.target instanceof HTMLImageElement) {
      event.target.srcset = this.defaultImage;
      event.target.classList.add('error');
    }
  }

  get fill(): boolean {
    return !this.width;
  }

  get defaultImage(): string {
    return this.errorImage || defaultImage;
  }
}

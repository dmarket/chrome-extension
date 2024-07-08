import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { DEFAULT_IMAGE } from '@ext/shared/constants';
import { hostAttr } from '@ext/shared/utils';
import { ImageLoaderParams, ImageTypes } from './image.models';

@Component({
  selector: 'myth-image',
  standalone: true,
  templateUrl: './image.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage],
})
export class ImageComponent implements OnInit {
  @Input() src: string = DEFAULT_IMAGE;
  @Input({ required: true }) alt!: string;
  @Input() type: ImageTypes = 'internalPathOptimized';
  @Input() srcset: string | null = null;
  @Input() sizes: string | undefined = undefined;
  @Input() priority: boolean = false;
  @Input() width: string | null = null;
  @Input() height: string | null = null;
  errorImage = hostAttr<string | null>('errorImage', null);
  ariaLabel = hostAttr<string>('ariaLabel', 'Image');
  classes = hostAttr<string | null>('classes', null);
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
    }
  }

  get fill(): boolean {
    return !this.width;
  }

  get defaultImage(): string {
    return this.errorImage || DEFAULT_IMAGE;
  }
}

import { IMAGE_LOADER, ImageLoaderConfig, PRECONNECT_CHECK_BLOCKLIST } from '@angular/common';
import { Provider } from '@angular/core';
import { ImageLoaderParams } from './image.models';

export const providers: Provider[] = [
  { provide: PRECONNECT_CHECK_BLOCKLIST, useValue: 'http://localhost:4200' },
  {
    provide: IMAGE_LOADER,
    useValue: (config: ImageLoaderConfig) => {
      const params: ImageLoaderParams | undefined = config.loaderParams;
      const assetPath = '/assets/img/';
      const path = params?.isExternal ? '' : assetPath;
      const optimizer = params?.disablePathOptimizer
        ? config.src
        : params?.isExternal
          ? `${config.src}/${config.width}x${config.width}`
          : `${config.src}${config.width ? '-' + config.width : ''}.avif`;

      return path + optimizer;
    },
  },
];

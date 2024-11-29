import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { translocoConfig } from '@myth/dm-ext-shared-utils';
import { customMatIconsLoaderProviders, imageProviders } from '@myth/dm-ext-ui-base';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch(), withInterceptors([])),
    ...translocoConfig.providers,
    ...imageProviders,
    ...customMatIconsLoaderProviders,
    provideRouter(
      appRoutes(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
    ),
    importProvidersFrom(BrowserAnimationsModule),
    provideZoneChangeDetection({
      runCoalescing: true,
      eventCoalescing: true,
    }),
  ],
};

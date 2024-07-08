import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { imageProviders } from '@ext/shared/components';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(appRoutes), ...imageProviders],
};

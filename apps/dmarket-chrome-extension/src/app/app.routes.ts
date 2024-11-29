import { Route } from '@angular/router';
import { localizeRoutes } from '@myth/dm-ext-shared-utils';

export const appRoutes = (): Route[] => {
  const config: Route[] = [
    {
      path: 'settings',
      loadChildren: () =>
        import('@myth/dm-ext-feature-settings').then((m) => m.dmExtSettingsPageRoutes),
    },
    {
      path: 'options.html',
      pathMatch: 'full',
      loadChildren: () =>
        import('@myth/dm-ext-feature-settings').then((m) => m.dmExtSettingsPageRoutes),
    },
    {
      path: 'report',
      loadChildren: () =>
        import('@myth/dm-ext-feature-report').then((m) => m.dmExtReportPageRoutes),
    },
    {
      path: 'home',
      loadChildren: () => import('@myth/dm-ext-feature-main').then((m) => m.dmExtMainPageRoutes),
    },
    {
      path: 'error',
      loadChildren: () => import('@myth/dm-ext-feature-error').then((m) => m.errorPageRoutes),
    },
    {
      path: '',
      pathMatch: 'full',
      redirectTo: 'home',
    },
  ];
  const includedLanguages = ['en'];
  const routes = localizeRoutes(config, includedLanguages);
  return [...routes, { path: '**', redirectTo: 'error' }];
};

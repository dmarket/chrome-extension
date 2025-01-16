import { Routes } from '@angular/router';
import { DmExtPhishingBlockerContainerComponent } from './page-container';

export const dmExtPhishingBlockerPageRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: DmExtPhishingBlockerContainerComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];

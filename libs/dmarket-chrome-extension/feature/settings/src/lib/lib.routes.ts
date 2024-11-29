import { Routes } from '@angular/router';
import { DmExtContactSupportComponent } from './contact-support';
import { DmExtSettingsContainerComponent } from './settings-container';

export const dmExtSettingsPageRoutes: Routes = [
  {
    path: 'contact-support',
    pathMatch: 'full',
    component: DmExtContactSupportComponent,
  },
  {
    path: '',
    pathMatch: 'full',
    component: DmExtSettingsContainerComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];

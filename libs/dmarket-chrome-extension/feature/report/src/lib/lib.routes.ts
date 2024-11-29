import { Routes } from '@angular/router';
import { DmExtReportContainerComponent } from './report-container';

export const dmExtReportPageRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: DmExtReportContainerComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];

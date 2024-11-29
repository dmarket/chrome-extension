import { Routes } from '@angular/router';
import { DmExtAboutProtectionComponent } from './about-protection';
import { DmExtHowToProtectComponent } from './how-to-protect';
import { DmExtMainContainerComponent } from './main-container';
import { DmExtWelcomeComponent } from './welcome';

export const dmExtMainPageRoutes: Routes = [
  {
    path: 'welcome',
    pathMatch: 'full',
    component: DmExtWelcomeComponent,
  },
  {
    path: 'about',
    pathMatch: 'full',
    component: DmExtAboutProtectionComponent,
  },
  {
    path: 'how-to-protect',
    pathMatch: 'full',
    component: DmExtHowToProtectComponent,
  },
  {
    path: '',
    pathMatch: 'full',
    component: DmExtMainContainerComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];

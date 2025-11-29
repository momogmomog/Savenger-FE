import { Routes } from '@angular/router';
import { AppRoutingPath } from './app-routing.path';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: AppRoutingPath.LOGIN.path,
    loadChildren: () =>
      import('./ui/login/login.component').then((m) => m.LOGIN_ROUTES),
  },
  {
    path: '**',
    title: 'Page Not Found',
    loadChildren: () =>
      import('./ui/not-found/not-found.component').then(
        (m) => m.NOT_FOUND_ROUTES,
      ),
  },
];

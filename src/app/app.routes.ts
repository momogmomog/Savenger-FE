import { Routes } from '@angular/router';
import { AppRoutingPath } from './app-routing.path';
import { TabsPage } from './ui/tabs/tabs/tabs.page';
import { BudgetPageComponent } from './ui/budget/budget-page/budget-page.component';

const tab1Routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./ui/tabs/tab1/tab1.page').then((m) => m.Tab1Page),
  },
];

const tab2Routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./ui/tabs/tab2/tab2.page').then((m) => m.Tab2Page),
  },
];

const tab3Routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./ui/tabs/tab3/tab3.page').then((m) => m.Tab3Page),
  },
];

const tab4Routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./ui/tabs/tab4/tab4.page').then((m) => m.Tab4Page),
    children: [
      {
        path: '',
        component: BudgetPageComponent,
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./ui/budget/list-budgets/list-budgets.component').then(
                (c) => c.ListBudgetsComponent,
              ),
          },
        ],
      },
    ],
  },
];

export const routes: Routes = [
  {
    path: AppRoutingPath.TABS.path,
    component: TabsPage,
    children: [
      {
        path: AppRoutingPath.TAB_1_REVISIONS.path,
        title: 'Revisions',
        children: tab1Routes,
      },
      {
        path: AppRoutingPath.TAB_2_ANALYTICS.path,
        title: 'Analytics',
        children: tab2Routes,
      },
      {
        path: AppRoutingPath.TAB_3_TRANSACTIONS.path,
        title: 'Transactions',
        children: tab3Routes,
      },
      {
        path: AppRoutingPath.TAB_4_BUDGETS.path,
        title: 'Budgets',
        children: tab4Routes,
      },
      {
        path: '',
        redirectTo: AppRoutingPath.TAB_1_REVISIONS.absolutePath,
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: AppRoutingPath.TAB_1_REVISIONS.absolutePath,
    pathMatch: 'full',
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

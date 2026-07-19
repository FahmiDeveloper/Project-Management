import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { DESC } from 'app/config/navigation.constants';
import DashboardResolve from './route/dashboard-routing-resolve.service';

const dashboardRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/dashboard.component').then(m => m.DashboardComponent),
    title: 'projectManagementApp.dashboard.home.title',
    data: {
      defaultSort: `id,${DESC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/dashboard-detail.component').then(m => m.DashboardDetailComponent),
    resolve: {
      dashboard: DashboardResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/dashboard-update.component').then(m => m.DashboardUpdateComponent),
    resolve: {
      dashboard: DashboardResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/dashboard-update.component').then(m => m.DashboardUpdateComponent),
    resolve: {
      dashboard: DashboardResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default dashboardRoute;

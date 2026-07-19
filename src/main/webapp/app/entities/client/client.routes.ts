import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { DESC } from 'app/config/navigation.constants';
import ClientResolve from './route/client-routing-resolve.service';

const clientRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/client.component').then(m => m.ClientComponent),
    title: 'projectManagementApp.client.home.title',
    data: {
      defaultSort: `id,${DESC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/client-detail.component').then(m => m.ClientDetailComponent),
    resolve: {
      client: ClientResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/client-update.component').then(m => m.ClientUpdateComponent),
    resolve: {
      client: ClientResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/client-update.component').then(m => m.ClientUpdateComponent),
    resolve: {
      client: ClientResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default clientRoute;

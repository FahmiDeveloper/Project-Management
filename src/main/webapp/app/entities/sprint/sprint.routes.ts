import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import SprintResolve from './route/sprint-routing-resolve.service';

const sprintRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/sprint.component').then(m => m.SprintComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/sprint-detail.component').then(m => m.SprintDetailComponent),
    resolve: {
      sprint: SprintResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/sprint-update.component').then(m => m.SprintUpdateComponent),
    resolve: {
      sprint: SprintResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/sprint-update.component').then(m => m.SprintUpdateComponent),
    resolve: {
      sprint: SprintResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default sprintRoute;

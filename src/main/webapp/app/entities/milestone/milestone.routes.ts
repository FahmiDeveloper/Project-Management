import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { DESC } from 'app/config/navigation.constants';
import MilestoneResolve from './route/milestone-routing-resolve.service';

const milestoneRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/milestone.component').then(m => m.MilestoneComponent),
    title: 'projectManagementApp.milestone.home.title',
    data: {
      defaultSort: `id,${DESC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/milestone-detail.component').then(m => m.MilestoneDetailComponent),
    resolve: {
      milestone: MilestoneResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/milestone-update.component').then(m => m.MilestoneUpdateComponent),
    resolve: {
      milestone: MilestoneResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/milestone-update.component').then(m => m.MilestoneUpdateComponent),
    resolve: {
      milestone: MilestoneResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default milestoneRoute;

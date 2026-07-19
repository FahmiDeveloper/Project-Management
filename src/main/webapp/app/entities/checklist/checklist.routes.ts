import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { DESC } from 'app/config/navigation.constants';
import ChecklistResolve from './route/checklist-routing-resolve.service';

const checklistRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/checklist.component').then(m => m.ChecklistComponent),
    title: 'projectManagementApp.checklist.home.title',
    data: {
      defaultSort: `id,${DESC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/checklist-detail.component').then(m => m.ChecklistDetailComponent),
    resolve: {
      checklist: ChecklistResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/checklist-update.component').then(m => m.ChecklistUpdateComponent),
    resolve: {
      checklist: ChecklistResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/checklist-update.component').then(m => m.ChecklistUpdateComponent),
    resolve: {
      checklist: ChecklistResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default checklistRoute;

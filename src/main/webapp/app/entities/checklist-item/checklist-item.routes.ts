import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { DESC } from 'app/config/navigation.constants';
import ChecklistItemResolve from './route/checklist-item-routing-resolve.service';

const checklistItemRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/checklist-item.component').then(m => m.ChecklistItemComponent),
    title: 'projectManagementApp.checklistItem.home.title',
    data: {
      defaultSort: `id,${DESC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/checklist-item-detail.component').then(m => m.ChecklistItemDetailComponent),
    resolve: {
      checklistItem: ChecklistItemResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/checklist-item-update.component').then(m => m.ChecklistItemUpdateComponent),
    resolve: {
      checklistItem: ChecklistItemResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/checklist-item-update.component').then(m => m.ChecklistItemUpdateComponent),
    resolve: {
      checklistItem: ChecklistItemResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default checklistItemRoute;

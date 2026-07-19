import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { DESC } from 'app/config/navigation.constants';
import TimeEntryResolve from './route/time-entry-routing-resolve.service';

const timeEntryRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/time-entry.component').then(m => m.TimeEntryComponent),
    title: 'projectManagementApp.timeEntry.home.title',
    data: {
      defaultSort: `id,${DESC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/time-entry-detail.component').then(m => m.TimeEntryDetailComponent),
    resolve: {
      timeEntry: TimeEntryResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/time-entry-update.component').then(m => m.TimeEntryUpdateComponent),
    resolve: {
      timeEntry: TimeEntryResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/time-entry-update.component').then(m => m.TimeEntryUpdateComponent),
    resolve: {
      timeEntry: TimeEntryResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default timeEntryRoute;

import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import ActivityLogResolve from './route/activity-log-routing-resolve.service';

const activityLogRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/activity-log.component').then(m => m.ActivityLogComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/activity-log-detail.component').then(m => m.ActivityLogDetailComponent),
    resolve: {
      activityLog: ActivityLogResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/activity-log-update.component').then(m => m.ActivityLogUpdateComponent),
    resolve: {
      activityLog: ActivityLogResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/activity-log-update.component').then(m => m.ActivityLogUpdateComponent),
    resolve: {
      activityLog: ActivityLogResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default activityLogRoute;

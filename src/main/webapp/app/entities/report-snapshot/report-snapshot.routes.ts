import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import ReportSnapshotResolve from './route/report-snapshot-routing-resolve.service';

const reportSnapshotRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/report-snapshot.component').then(m => m.ReportSnapshotComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/report-snapshot-detail.component').then(m => m.ReportSnapshotDetailComponent),
    resolve: {
      reportSnapshot: ReportSnapshotResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/report-snapshot-update.component').then(m => m.ReportSnapshotUpdateComponent),
    resolve: {
      reportSnapshot: ReportSnapshotResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/report-snapshot-update.component').then(m => m.ReportSnapshotUpdateComponent),
    resolve: {
      reportSnapshot: ReportSnapshotResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default reportSnapshotRoute;

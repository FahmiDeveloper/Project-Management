import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import ProjectMemberResolve from './route/project-member-routing-resolve.service';

const projectMemberRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/project-member.component').then(m => m.ProjectMemberComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/project-member-detail.component').then(m => m.ProjectMemberDetailComponent),
    resolve: {
      projectMember: ProjectMemberResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/project-member-update.component').then(m => m.ProjectMemberUpdateComponent),
    resolve: {
      projectMember: ProjectMemberResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/project-member-update.component').then(m => m.ProjectMemberUpdateComponent),
    resolve: {
      projectMember: ProjectMemberResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default projectMemberRoute;

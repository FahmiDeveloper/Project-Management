import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { DESC } from 'app/config/navigation.constants';
import TaskCommentResolve from './route/task-comment-routing-resolve.service';

const taskCommentRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/task-comment.component').then(m => m.TaskCommentComponent),
    title: 'projectManagementApp.taskComment.home.title',
    data: {
      defaultSort: `id,${DESC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/task-comment-detail.component').then(m => m.TaskCommentDetailComponent),
    resolve: {
      taskComment: TaskCommentResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/task-comment-update.component').then(m => m.TaskCommentUpdateComponent),
    resolve: {
      taskComment: TaskCommentResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/task-comment-update.component').then(m => m.TaskCommentUpdateComponent),
    resolve: {
      taskComment: TaskCommentResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default taskCommentRoute;

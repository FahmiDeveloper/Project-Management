import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'authority',
    data: { pageTitle: 'projectManagementApp.adminAuthority.home.title' },
    loadChildren: () => import('./admin/authority/authority.routes'),
  },
  {
    path: 'department',
    data: { pageTitle: 'projectManagementApp.department.home.title' },
    loadChildren: () => import('./department/department.routes'),
  },
  {
    path: 'employee',
    data: { pageTitle: 'projectManagementApp.employee.home.title' },
    loadChildren: () => import('./employee/employee.routes'),
  },
  {
    path: 'client',
    data: { pageTitle: 'projectManagementApp.client.home.title' },
    loadChildren: () => import('./client/client.routes'),
  },
  {
    path: 'project',
    data: { pageTitle: 'projectManagementApp.project.home.title' },
    loadChildren: () => import('./project/project.routes'),
  },
  {
    path: 'project-member',
    data: { pageTitle: 'projectManagementApp.projectMember.home.title' },
    loadChildren: () => import('./project-member/project-member.routes'),
  },
  {
    path: 'milestone',
    data: { pageTitle: 'projectManagementApp.milestone.home.title' },
    loadChildren: () => import('./milestone/milestone.routes'),
  },
  {
    path: 'sprint',
    data: { pageTitle: 'projectManagementApp.sprint.home.title' },
    loadChildren: () => import('./sprint/sprint.routes'),
  },
  {
    path: 'task',
    data: { pageTitle: 'projectManagementApp.task.home.title' },
    loadChildren: () => import('./task/task.routes'),
  },
  {
    path: 'task-comment',
    data: { pageTitle: 'projectManagementApp.taskComment.home.title' },
    loadChildren: () => import('./task-comment/task-comment.routes'),
  },
  {
    path: 'attachment',
    data: { pageTitle: 'projectManagementApp.attachment.home.title' },
    loadChildren: () => import('./attachment/attachment.routes'),
  },
  {
    path: 'checklist',
    data: { pageTitle: 'projectManagementApp.checklist.home.title' },
    loadChildren: () => import('./checklist/checklist.routes'),
  },
  {
    path: 'checklist-item',
    data: { pageTitle: 'projectManagementApp.checklistItem.home.title' },
    loadChildren: () => import('./checklist-item/checklist-item.routes'),
  },
  {
    path: 'time-entry',
    data: { pageTitle: 'projectManagementApp.timeEntry.home.title' },
    loadChildren: () => import('./time-entry/time-entry.routes'),
  },
  {
    path: 'notification',
    data: { pageTitle: 'projectManagementApp.notification.home.title' },
    loadChildren: () => import('./notification/notification.routes'),
  },
  {
    path: 'activity-log',
    data: { pageTitle: 'projectManagementApp.activityLog.home.title' },
    loadChildren: () => import('./activity-log/activity-log.routes'),
  },
  {
    path: 'report-snapshot',
    data: { pageTitle: 'projectManagementApp.reportSnapshot.home.title' },
    loadChildren: () => import('./report-snapshot/report-snapshot.routes'),
  },
  {
    path: 'dashboard',
    data: { pageTitle: 'projectManagementApp.dashboard.home.title' },
    loadChildren: () => import('./dashboard/dashboard.routes'),
  },
  /* jhipster-needle-add-entity-route - JHipster will add entity modules routes here */
];

export default routes;

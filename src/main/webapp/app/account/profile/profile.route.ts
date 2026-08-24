import { Route } from '@angular/router';

const profileRoute: Route = {
  path: 'profile',
  loadComponent: () => import('./profile.component'),
  title: 'profile.title',
};

export default profileRoute;

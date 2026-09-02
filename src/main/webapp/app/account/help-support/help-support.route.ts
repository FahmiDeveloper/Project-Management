import { Route } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { HelpSupportComponent } from './help-support.component';

const helpSupportRoute: Route = {
  path: 'help-support',
  component: HelpSupportComponent,
  title: 'global.menu.account.helpSupport',
  canActivate: [UserRouteAccessService],
};

export default helpSupportRoute;

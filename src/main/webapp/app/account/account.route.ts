import { Routes } from '@angular/router';

import activateRoute from './activate/activate.route';
import passwordRoute from './password/password.route';
import passwordResetFinishRoute from './password-reset/finish/password-reset-finish.route';
import passwordResetInitRoute from './password-reset/init/password-reset-init.route';
import profileRoute from './profile/profile.route';
import registerRoute from './register/register.route';
import settingsRoute from './settings/settings.route';
import verifyCodeRoute from './verify-code/verify-code.route';
import helpSupportRoute from './help-support/help-support.route';

const accountRoutes: Routes = [
  activateRoute,
  passwordRoute,
  passwordResetFinishRoute,
  passwordResetInitRoute,
  profileRoute,
  registerRoute,
  settingsRoute,
  helpSupportRoute,
  verifyCodeRoute,
];

export default accountRoutes;

import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import SharedModule from 'app/shared/shared.module';
import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/auth/account.model';
import { LANGUAGES } from 'app/config/language.constants';
import { ThemePreference, ThemeService } from 'app/core/theme/theme.service';
import { PasswordChangeService } from './password-change.service';
// NOTE: adjust this path if your password-reset-init service lives somewhere else.
// Standard JHipster layout puts it at app/account/password-reset/init/.
import { PasswordResetInitService } from '../password-reset/init/password-reset-init.service';

const initialAccount: Account = {} as Account;

@Component({
  selector: 'jhi-settings',
  standalone: true,
  imports: [
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSelectModule,
    MatSlideToggleModule,
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export default class SettingsComponent implements OnInit {
  success = signal(false);
  languages = LANGUAGES;

  // Preferences (language + account pass-through fields). firstName/lastName/email are
  // intentionally NOT rendered here - Profile is where those are edited - but they're
  // kept as hidden controls so save()'s getRawValue() still sends the backend a
  // complete account object instead of nulling those fields out.
  settingsForm = new FormGroup({
    langKey: new FormControl(initialAccount.langKey, { nonNullable: true }),

    firstName: new FormControl(initialAccount.firstName, { nonNullable: true }),
    lastName: new FormControl(initialAccount.lastName, { nonNullable: true }),
    email: new FormControl(initialAccount.email, { nonNullable: true }),
    activated: new FormControl(initialAccount.activated, { nonNullable: true }),
    authorities: new FormControl(initialAccount.authorities, { nonNullable: true }),
    imageUrl: new FormControl(initialAccount.imageUrl, { nonNullable: true }),
    login: new FormControl(initialAccount.login, { nonNullable: true }),
  });

  // Change password
  passwordForm = new FormGroup({
    currentPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    newPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(4), Validators.maxLength(50)],
    }),
    confirmPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });
  passwordSuccess = signal(false);
  passwordError = signal(false);
  passwordDoNotMatch = signal(false);

  // "Reset it by email" from the password card. Unlike the standalone forgot-password
  // page, the user is already logged in here, so we already have their email in
  // settingsForm - no need to send them off to retype it. We just POST that email to
  // the same /account/reset-password/init endpoint the standalone page uses.
  passwordResetSuccess = signal(false);
  passwordResetError = signal(false);

  // Notification preferences.
  // NOT PERSISTED SERVER-SIDE YET: nothing in AccountResource/UserService exposes fields
  // for these, so this only lives in the form/UI for now. Wiring real persistence needs
  // new columns on the User/Employee entity plus a save endpoint - happy to add that
  // once you confirm where you'd like it to live on the backend.
  notificationForm = new FormGroup({
    deadlineReminders: new FormControl(true, { nonNullable: true }),
    newTaskAssigned: new FormControl(true, { nonNullable: true }),
    teamChanges: new FormControl(false, { nonNullable: true }),
  });
  notificationSuccess = signal(false);

  readonly themeService = inject(ThemeService);

  private readonly accountService = inject(AccountService);
  private readonly translateService = inject(TranslateService);
  private readonly passwordChangeService = inject(PasswordChangeService);
  private readonly passwordResetInitService = inject(PasswordResetInitService);

  ngOnInit(): void {
    // force=true bypasses accountCache$ so we never patch the form (and later POST
    // back) a stale value - e.g. right after ProfileComponent updated the picture but
    // before anything else refreshed the cached account.
    // emitEvent: false is required here now that langKey auto-saves on change below -
    // without it, this initial patch would itself count as a "change" and fire an
    // unnecessary save the moment the page loads.
    this.accountService.identity(true).subscribe(account => {
      if (account) {
        this.settingsForm.patchValue(account, { emitEvent: false });
      }
    });

    // Language now saves as soon as a new value is selected - no Save button needed.
    this.settingsForm.get('langKey')!.valueChanges.subscribe(() => {
      this.save();
    });

    // Same for notification toggles - each one saves itself immediately on click.
    this.notificationForm.valueChanges.subscribe(() => {
      this.saveNotificationPreferences();
    });
  }

  save(): void {
    this.success.set(false);

    const account = this.settingsForm.getRawValue();
    this.accountService.save(account).subscribe(() => {
      this.success.set(true);

      this.accountService.authenticate(account);

      if (account.langKey !== this.translateService.currentLang) {
        this.translateService.use(account.langKey);
      }
    });
  }

  changePassword(): void {
    this.passwordSuccess.set(false);
    this.passwordError.set(false);
    this.passwordDoNotMatch.set(false);

    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.getRawValue();
    if (newPassword !== confirmPassword) {
      this.passwordDoNotMatch.set(true);
      return;
    }

    this.passwordChangeService.changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.passwordSuccess.set(true);
        this.passwordForm.reset({ currentPassword: '', newPassword: '', confirmPassword: '' });
      },
      error: () => this.passwordError.set(true),
    });
  }

  requestPasswordReset(): void {
    this.passwordResetSuccess.set(false);
    this.passwordResetError.set(false);

    const email = this.settingsForm.getRawValue().email;
    if (!email) {
      this.passwordResetError.set(true);
      return;
    }

    this.passwordResetInitService.save(email).subscribe({
      next: () => this.passwordResetSuccess.set(true),
      error: () => this.passwordResetError.set(true),
    });
  }

  saveNotificationPreferences(): void {
    this.notificationSuccess.set(false);
    // No backend call here yet - see the comment on notificationForm above.
    this.notificationSuccess.set(true);
  }

  setTheme(preference: ThemePreference): void {
    this.themeService.setPreference(preference);
  }
}

import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import SharedModule from 'app/shared/shared.module';
import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/auth/account.model';
import { LANGUAGES } from 'app/config/language.constants';
import { ThemePreference, ThemeService } from 'app/core/theme/theme.service';
import { PasswordChangeService } from './password-change.service';

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
    MatDividerModule,
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

  ngOnInit(): void {
    // force=true bypasses accountCache$ so we never patch the form (and later POST
    // back) a stale value - e.g. right after ProfileComponent updated the picture but
    // before anything else refreshed the cached account.
    this.accountService.identity(true).subscribe(account => {
      if (account) {
        this.settingsForm.patchValue(account);
      }
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

  saveNotificationPreferences(): void {
    this.notificationSuccess.set(false);
    // No backend call here yet - see the comment on notificationForm above.
    this.notificationSuccess.set(true);
  }

  setTheme(preference: ThemePreference): void {
    this.themeService.setPreference(preference);
  }
}

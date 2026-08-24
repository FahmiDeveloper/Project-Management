import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';

import SharedModule from 'app/shared/shared.module';
import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/auth/account.model';
import { LANGUAGES } from 'app/config/language.constants';

const initialAccount: Account = {} as Account;

@Component({
  selector: 'jhi-settings',
  standalone: true,
  imports: [
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatSelectModule,
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export default class SettingsComponent implements OnInit {
  success = signal(false);
  languages = LANGUAGES;

  settingsForm = new FormGroup({
    firstName: new FormControl(initialAccount.firstName, {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(1), Validators.maxLength(50)],
    }),
    lastName: new FormControl(initialAccount.lastName, {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(1), Validators.maxLength(50)],
    }),
    email: new FormControl(initialAccount.email, {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(5), Validators.maxLength(254), Validators.email],
    }),
    langKey: new FormControl(initialAccount.langKey, { nonNullable: true }),

    activated: new FormControl(initialAccount.activated, { nonNullable: true }),
    authorities: new FormControl(initialAccount.authorities, { nonNullable: true }),
    imageUrl: new FormControl(initialAccount.imageUrl, { nonNullable: true }),
    login: new FormControl(initialAccount.login, { nonNullable: true }),
  });

  private readonly accountService = inject(AccountService);
  private readonly translateService = inject(TranslateService);

  ngOnInit(): void {
    // force=true bypasses accountCache$ so we never patch the form (and later
    // POST back) a stale imageUrl - e.g. right after ProfileComponent updated
    // the picture but before anything else refreshed the cached account.
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
}

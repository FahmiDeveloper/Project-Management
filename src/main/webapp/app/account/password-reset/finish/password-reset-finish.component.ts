import { AfterViewInit, Component, ElementRef, OnInit, inject, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import PasswordStrengthBarComponent from 'app/account/password/password-strength-bar/password-strength-bar.component';
import SharedModule from 'app/shared/shared.module';

import { LoginService } from 'app/login/login.service';
import { PasswordResetFinishService } from './password-reset-finish.service';

@Component({
  selector: 'jhi-password-reset-finish',
  imports: [SharedModule, RouterModule, FormsModule, ReactiveFormsModule, PasswordStrengthBarComponent],
  templateUrl: './password-reset-finish.component.html',
  styleUrls: ['./password-reset-finish.component.scss'],
})
export default class PasswordResetFinishComponent implements OnInit, AfterViewInit {
  newPassword = viewChild.required<ElementRef>('newPassword');

  initialized = signal(false);
  doNotMatch = signal(false);
  error = signal(false);
  success = signal(false);
  key = signal('');

  passwordForm = new FormGroup({
    newPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(4), Validators.maxLength(50)],
    }),
    confirmPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(4), Validators.maxLength(50)],
    }),
  });

  private readonly passwordResetFinishService = inject(PasswordResetFinishService);
  private readonly route = inject(ActivatedRoute);
  // Needed so a successful reset also logs this browser out - see finishReset() below.
  private readonly loginService = inject(LoginService);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params.key) {
        this.key.set(params.key);
      }
      this.initialized.set(true);
    });
  }

  ngAfterViewInit(): void {
    this.newPassword().nativeElement.focus();
  }

  finishReset(): void {
    this.doNotMatch.set(false);
    this.error.set(false);

    const { newPassword, confirmPassword } = this.passwordForm.getRawValue();

    if (newPassword !== confirmPassword) {
      this.doNotMatch.set(true);
    } else {
      this.passwordResetFinishService.save(this.key(), newPassword).subscribe({
        next: () => {
          // The password just changed, so any JWT already sitting in this browser
          // (localStorage if "remember me" was checked, sessionStorage otherwise)
          // was issued for the OLD password/session. Log this browser out so the
          // "sign in" link below actually takes the user to a fresh login instead
          // of silently reusing the stale token and dropping them straight into /home.
          this.loginService.logout();
          this.success.set(true);
        },
        error: () => this.error.set(true),
      });
    }
  }
}

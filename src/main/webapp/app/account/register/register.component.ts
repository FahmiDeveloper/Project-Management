import { AfterViewInit, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

import { EMAIL_ALREADY_USED_TYPE, LOGIN_ALREADY_USED_TYPE } from 'app/config/error.constants';
import SharedModule from 'app/shared/shared.module';
import { RegisterService } from './register.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'jhi-register',
  imports: [SharedModule, RouterModule, FormsModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export default class RegisterComponent implements AfterViewInit {
  firstNameInput = viewChild.required<ElementRef>('firstNameInput');

  doNotMatch = signal(false);
  error = signal(false);
  errorEmailExists = signal(false);
  errorUserExists = signal(false);

  registerForm = new FormGroup({
    // Read-only in the template, but a normal enabled control - so its value still flows
    // through getRawValue()/validity like any other field. Kept in sync with firstName/lastName
    // by updateLogin() below rather than the user typing into it.
    login: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(1), Validators.maxLength(50)],
    }),
    firstName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(1), Validators.maxLength(50)],
    }),
    lastName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(1), Validators.maxLength(50)],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(5), Validators.maxLength(254), Validators.email],
    }),
    phone: new FormControl('', {
      nonNullable: true,
      // Optional (matches Employee.phone being nullable on the backend), but if a value is
      // entered it must be exactly 8 digits - Validators.pattern only runs against non-empty
      // values, so an empty phone still passes validation.
      validators: [Validators.pattern(/^[0-9]{8}$/)],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(4), Validators.maxLength(50)],
    }),
    confirmPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(4), Validators.maxLength(50)],
    }),
  });

  private readonly translateService = inject(TranslateService);
  private readonly registerService = inject(RegisterService);
  private readonly router = inject(Router);

  constructor() {
    this.registerForm.get('firstName')!.valueChanges.subscribe(() => this.updateLogin());
    this.registerForm.get('lastName')!.valueChanges.subscribe(() => this.updateLogin());
  }

  ngAfterViewInit(): void {
    this.firstNameInput().nativeElement.focus();
  }

  register(): void {
    this.doNotMatch.set(false);
    this.error.set(false);
    this.errorEmailExists.set(false);
    this.errorUserExists.set(false);

    const { password, confirmPassword } = this.registerForm.getRawValue();
    if (password !== confirmPassword) {
      this.doNotMatch.set(true);
    } else {
      const { login, firstName, lastName, email, phone } = this.registerForm.getRawValue();
      this.registerService
        .save({ login, firstName, lastName, email, phone, password, langKey: this.translateService.currentLang })
        .subscribe({
          next: () => this.router.navigate(['/account/verify-code'], { queryParams: { login: email } }),
          error: response => this.processError(response),
        });
    }
  }

  /**
   * Rebuilds the login field from the current firstName/lastName as "firstname.lastname",
   * lowercased and stripped down to [a-z0-9.] so it always satisfies the backend's LOGIN_REGEX.
   * Runs on every keystroke in either name field, so the login stays visibly in sync as the
   * user types rather than only appearing once on submit.
   */
  private updateLogin(): void {
    const { firstName, lastName } = this.registerForm.getRawValue();
    const sanitize = (value: string): string =>
      value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // strip accents (é -> e, etc.)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');

    const login = [sanitize(firstName), sanitize(lastName)].filter(Boolean).join('.');
    this.registerForm.get('login')!.setValue(login, { emitEvent: false });
  }

  /**
   * Blocks any keystroke in the phone field that isn't a digit, so letters/symbols can never
   * be typed in the first place - the pattern validator on the form control is still the real
   * source of truth (this is just UX, not validation), which is why sanitizePhonePaste below
   * also exists to catch pasted text bypassing keydown entirely.
   */
  blockNonDigit(event: KeyboardEvent): void {
    // Let control/navigation keys through untouched: their `key` is a multi-character name
    // (e.g. "Backspace", "Tab", "ArrowLeft"), unlike an actual typed character. Also let
    // Ctrl/Cmd combinations through (copy, paste, select-all, etc.).
    if (event.ctrlKey || event.metaKey || event.key.length > 1) {
      return;
    }
    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }
  }

  /**
   * Strips anything pasted into the phone field down to digits only, truncated to 8 characters,
   * so pasting "+216 12-345-678" (or any text containing letters) can't bypass blockNonDigit.
   */
  sanitizePhonePaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pasted = event.clipboardData?.getData('text') ?? '';
    const digitsOnly = pasted.replace(/\D/g, '').slice(0, 8);
    const control = this.registerForm.get('phone')!;
    control.setValue(digitsOnly);
    control.markAsDirty();
    control.markAsTouched();
  }

  private processError(response: HttpErrorResponse): void {
    if (response.status === 400 && response.error.type === LOGIN_ALREADY_USED_TYPE) {
      this.errorUserExists.set(true);
    } else if (response.status === 400 && response.error.type === EMAIL_ALREADY_USED_TYPE) {
      this.errorEmailExists.set(true);
    } else {
      this.error.set(true);
    }
  }
}

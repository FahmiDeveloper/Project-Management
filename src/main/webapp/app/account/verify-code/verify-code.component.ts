import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import SharedModule from 'app/shared/shared.module';
import { RegisterService } from '../register/register.service';

@Component({
  selector: 'jhi-verify-code',
  standalone: true,
  imports: [SharedModule, RouterModule, ReactiveFormsModule],
  templateUrl: './verify-code.component.html',
  styleUrls: ['./verify-code.component.scss'],
})
export default class VerifyCodeComponent implements OnInit {
  success = signal(false);
  error = signal(false);
  resent = signal(false);
  login = signal<string | null>(null);

  private readonly fb = inject(FormBuilder);
  private readonly registerService = inject(RegisterService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  codeForm = this.fb.group({
    code: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]],
  });

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => this.login.set(params.login ?? null));
  }

  verify(): void {
    this.error.set(false);
    const login = this.login();
    const code = this.codeForm.get('code')!.value;
    if (!login || !code) {
      return;
    }
    this.registerService.verifyCode({ login, code }).subscribe({
      next: () => {
        this.success.set(true);
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: () => this.error.set(true),
    });
  }

  resend(): void {
    const login = this.login();
    if (!login) {
      return;
    }
    this.resent.set(false);
    this.registerService.resendCode({ login }).subscribe({
      next: () => this.resent.set(true),
      error: () => this.error.set(true),
    });
  }
}

import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/auth/account.model';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'jhi-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  imports: [SharedModule, RouterModule],
})
export default class HomeComponent implements OnInit, OnDestroy {
  account = signal<Account | null>(null);

  private readonly destroy$ = new Subject<void>();

  private readonly accountService = inject(AccountService);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  notificationSent = false;

  ngOnInit(): void {
    this.accountService
      .getAuthenticationState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(account => this.account.set(account));
  }

  login(): void {
    this.router.navigate(['/login']);
  }

  testNotification(): void {
    this.http
      .post(SERVER_API_URL + 'api/push/send', {
        title: 'Hello 👋',
        body: 'This is a test notification from your app! Tap the expand button on the right to read the rest of this extra long message safely inside your status tray.',
        icon: '/content/icons/icon-192x192.png',
        image: 'https://outburst-rocket-provoke.ngrok-free.dev/content/icons/icon-192x192.png',
        url: '/',
      })
      .subscribe({
        next: () => {
          this.notificationSent = true;
          setTimeout(() => (this.notificationSent = false), 3000); // reset after 3s
        },
        error: err => console.error('Notification error:', err),
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

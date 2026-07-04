import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class PushNotificationService {
  constructor(private http: HttpClient) {}

  sendNotification(): void {
    this.http
      .post('/api/push/send', {
        title: 'Hello 👋',
        body: 'This is a push notification from button click',
        icon: '/content/icons/icon-192x192.png',
        url: '/',
      })
      .subscribe();
  }
}

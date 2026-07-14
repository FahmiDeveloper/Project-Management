import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { environment } from 'environments/environment';

@Injectable({ providedIn: 'root' })
export class PushNotificationService {
  constructor(private http: HttpClient) {}

  init(): void {
    if (!Capacitor.isNativePlatform()) {
      return;
    }
    this.registerMobilePush();
  }

  private registerMobilePush(): void {
    PushNotifications.requestPermissions().then(result => {
      if (result.receive === 'granted') {
        PushNotifications.register();
      }
    });

    PushNotifications.addListener('registration', (token: Token) => {
      console.log('tttttttttoooookkkkeeeennn', token.value);

      this.sendFcmTokenToServer(token.value);
    });

    PushNotifications.addListener('pushNotificationReceived', notification => {
      const bodyText = notification.body ?? '';

      (async () => {
        await LocalNotifications.schedule({
          notifications: [
            {
              id: Math.floor(Math.random() * 10000),
              title: notification.title ?? 'Notification',
              body: bodyText,
              largeBody: bodyText,
              smallIcon: 'small_icon',
              largeIcon: 'large_icon',
            },
          ],
        });
      })().catch(console.error);
    });

    PushNotifications.addListener('pushNotificationActionPerformed', () => {
      // handle notification tap if needed
    });
  }

  private sendFcmTokenToServer(token: string): void {
    this.http.post(environment.serverApiUrl + 'api/push/fcm-token', { token }).subscribe();
  }
}

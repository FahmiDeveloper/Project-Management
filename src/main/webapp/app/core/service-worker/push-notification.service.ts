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

  private async registerMobilePush(): Promise<void> {
    // 1. Create the mandatory Android Notification Channel FIRST
    try {
      await LocalNotifications.createChannel({
        id: 'fcm_default_channel',
        name: 'Default Alerts',
        description: 'General application notifications',
        importance: 4, // 4 = High/Urgent (forces pop-up banners and sounds)
        sound: 'default',
        visibility: 1,
      });
    } catch (err) {
      console.error('Failed to create notification channel:', err);
    }

    // 2. Set up your listeners BEFORE calling register() so no events are lost
    await PushNotifications.removeAllListeners();

    await PushNotifications.addListener('registration', (token: Token) => {
      console.log('FCM Token generated successfully:', token.value);
      this.sendFcmTokenToServer(token.value);
    });

    await PushNotifications.addListener('registrationError', (err: any) => {
      console.error('FCM Native Registration Error:', err);
    });

    await PushNotifications.addListener('pushNotificationReceived', notification => {
      console.log('Push received in foreground:', notification);
      const bodyText = notification.body ?? '';

      (async () => {
        await LocalNotifications.schedule({
          notifications: [
            {
              id: Math.floor(Math.random() * 10000),
              title: notification.title ?? 'Notification',
              body: bodyText,
              largeBody: bodyText,
              channelId: 'fcm_default_channel', // <-- FIX: Assign the required Channel ID
              smallIcon: 'small_icon',
              largeIcon: 'large_icon',
            },
          ],
        });
      })().catch(console.error);
    });

    await PushNotifications.addListener('pushNotificationActionPerformed', action => {
      console.log('Notification action performed:', action);
    });

    // 3. Request permissions, then safely trigger register()
    PushNotifications.requestPermissions().then(result => {
      if (result.receive === 'granted') {
        PushNotifications.register();
      } else {
        console.error('Push permission was denied by the user.');
      }
    });
  }

  private sendFcmTokenToServer(token: string): void {
    this.http.post(environment.serverApiUrl + 'api/push/fcm-token', { token }).subscribe({
      next: () => console.log('FCM token safely sent to backend server.'),
      error: err => console.error('Error sending FCM token to backend:', err),
    });
  }
}

package com.fehmidev.projectmanagement.service;

import com.fehmidev.projectmanagement.service.NotificationService;
import com.fehmidev.projectmanagement.service.dto.PushSubscriptionDTO;
import com.google.firebase.messaging.AndroidConfig;
import com.google.firebase.messaging.AndroidNotification;
import com.google.firebase.messaging.ApnsConfig;
import com.google.firebase.messaging.Aps;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import java.security.Security;
import nl.martijndwars.webpush.PushService;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class WebPushService {
    static {
        Security.addProvider(new BouncyCastleProvider());
    }

    private final PushSubscriptionService subscriptionService;
    private final PushService pushService;
    private final NotificationService notificationService;

    public WebPushService(
        @Value("${webpush.public-key}") String publicKey,
        @Value("${webpush.private-key}") String privateKey,
        @Value("${webpush.subject}") String subject,
        PushSubscriptionService subscriptionService,
        NotificationService notificationService
    ) throws Exception {
        this.subscriptionService = subscriptionService;
        this.notificationService = notificationService;
        this.pushService = new PushService(publicKey, privateKey, subject);
    }

    // NEW: Send to ALL devices (both desktop and mobile)
    public void sendToAllDevices(String title, String body, String url, String imageUrl) {
        // Send to desktop browsers (Web Push)
        sendToDesktop(title, body, url, imageUrl);

        // Send to mobile devices (FCM)
        sendToMobile(title, body, imageUrl, url);
    }

    // Send to desktop browsers only
    private void sendToDesktop(String title, String body, String url, String imageUrl) {
        subscriptionService
            .findAll()
            .forEach(sub -> {
                try {
                    nl.martijndwars.webpush.Notification notification = new nl.martijndwars.webpush.Notification(
                        sub.getEndpoint(),
                        sub.getKeys().get("p256dh"),
                        sub.getKeys().get("auth"),
                        String.format("{\"title\":\"%s\",\"body\":\"%s\",\"url\":\"%s\"}", title, body, url)
                    );
                    pushService.send(notification);
                    System.out.println("✅ Desktop notification sent to: " + sub.getEndpoint());
                } catch (Exception e) {
                    System.err.println("❌ Failed to send desktop notification: " + e.getMessage());
                    e.printStackTrace();
                }
            });
    }

    // Send to mobile devices only
    private void sendToMobile(String title, String body, String imageUrl, String url) {
        subscriptionService
            .findAllFcmTokens()
            .forEach(token -> {
                try {
                    AndroidNotification androidNotification = AndroidNotification.builder().setImage(imageUrl).build();

                    AndroidConfig androidConfig = AndroidConfig.builder()
                        .setNotification(androidNotification)
                        .setPriority(AndroidConfig.Priority.HIGH)
                        .build();

                    Aps aps = Aps.builder().build();
                    ApnsConfig apnsConfig = ApnsConfig.builder().setAps(aps).putHeader("apns-priority", "10").build();

                    com.google.firebase.messaging.Notification firebaseNotification = com.google.firebase.messaging.Notification.builder()
                        .setTitle(title)
                        .setBody(body)
                        .setImage(imageUrl)
                        .build();

                    Message message = Message.builder()
                        .setToken(token)
                        .setNotification(firebaseNotification)
                        .setAndroidConfig(androidConfig)
                        .setApnsConfig(apnsConfig)
                        .build();

                    FirebaseMessaging.getInstance().send(message);
                    System.out.println("✅ Mobile notification sent to: " + token);
                } catch (Exception e) {
                    System.err.println("❌ Failed to send mobile notification: " + e.getMessage());
                    e.printStackTrace();
                }
            });
    }
}

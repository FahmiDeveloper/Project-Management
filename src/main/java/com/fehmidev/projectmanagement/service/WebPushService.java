package com.fehmidev.projectmanagement.service;

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

    public WebPushService(
        @Value("${webpush.public-key}") String publicKey,
        @Value("${webpush.private-key}") String privateKey,
        @Value("${webpush.subject}") String subject,
        PushSubscriptionService subscriptionService
    ) throws Exception {
        this.subscriptionService = subscriptionService;
        this.pushService = new PushService(publicKey, privateKey, subject);
    }

    // ← Sends to desktop browsers (Web Push)
    public void send(String title, String body, String url, String imageUrl) {
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
                } catch (Exception e) {
                    e.printStackTrace();
                }
            });

        // ← Also send to all mobile devices via FCM
        sendToMobile(title, body, imageUrl);
    }

    // ← Sends to all registered mobile devices (FCM)
    public void sendToMobile(String title, String body, String imageUrl) {
        subscriptionService
            .findAllFcmTokens()
            .forEach(token -> {
                try {
                    // 1. Build the Android-specific notification settings (e.g., Image)
                    AndroidNotification androidNotification = AndroidNotification.builder().setImage(imageUrl).build();

                    // 2. Combine the notification settings AND the HIGH priority flag into one AndroidConfig
                    AndroidConfig androidConfig = AndroidConfig.builder()
                        .setNotification(androidNotification)
                        .setPriority(AndroidConfig.Priority.HIGH) // Forces delivery in Doze/Background mode
                        .build();

                    // 3. Build APNs config for iOS devices with required aps payload
                    Aps aps = Aps.builder().build(); // Creates the mandatory empty placeholder object

                    ApnsConfig apnsConfig = ApnsConfig.builder()
                        .setAps(aps) // Resolves "aps must be specified" exception
                        .putHeader("apns-priority", "10")
                        .build();

                    // 4. Construct the final unified message
                    Message message = Message.builder()
                        .setToken(token)
                        .setNotification(Notification.builder().setTitle(title).setBody(body).setImage(imageUrl).build())
                        .setAndroidConfig(androidConfig) // Pass the combined config here
                        .setApnsConfig(apnsConfig) // Ensures iOS background reliability
                        .build();

                    FirebaseMessaging.getInstance().send(message);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            });
    }
}

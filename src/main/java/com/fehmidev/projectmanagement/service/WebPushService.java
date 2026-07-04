package com.fehmidev.projectmanagement.service;

import com.fehmidev.projectmanagement.service.PushSubscriptionService;
import java.security.Security;
import nl.martijndwars.webpush.Notification;
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

    public void send(String title, String body, String url) {
        subscriptionService
            .findAll()
            .forEach(sub -> {
                try {
                    Notification notification = new Notification(
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
    }
}

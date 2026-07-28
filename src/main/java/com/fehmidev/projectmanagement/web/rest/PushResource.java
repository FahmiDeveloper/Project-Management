package com.fehmidev.projectmanagement.web.rest;

import com.fehmidev.projectmanagement.service.NotificationService;
import com.fehmidev.projectmanagement.service.PushSubscriptionService;
import com.fehmidev.projectmanagement.service.WebPushService;
import com.fehmidev.projectmanagement.service.dto.PushMessageDTO;
import com.fehmidev.projectmanagement.service.dto.PushSubscriptionDTO;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/push")
public class PushResource {

    private final PushSubscriptionService service;
    private final WebPushService webPushService;
    private final NotificationService notificationService;

    public PushResource(PushSubscriptionService service, WebPushService webPushService, NotificationService notificationService) {
        this.service = service;
        this.webPushService = webPushService;
        this.notificationService = notificationService;
    }

    @PostMapping("/subscribe")
    public void subscribe(@RequestBody PushSubscriptionDTO subscription) {
        service.add(subscription);
    }

    // NEW: Send from desktop - saves WEB_PUSH and sends to all
    @PostMapping("/send-from-desktop")
    public void sendFromDesktop(@RequestBody PushMessageDTO message) {
        // Save desktop notification
        notificationService.saveNotification(message.getTitle(), message.getBody(), "desktop", null);

        // Send to all devices (both desktop and mobile)
        webPushService.sendToAllDevices(message.getTitle(), message.getBody(), message.getUrl(), message.getImage());
    }

    // NEW: Send from mobile - saves FCM and sends to all
    @PostMapping("/send-from-mobile")
    public void sendFromMobile(@RequestBody PushMessageDTO message) {
        // Save mobile notification
        notificationService.saveNotification(message.getTitle(), message.getBody(), "mobile", null);

        // Send to all devices (both desktop and mobile)
        webPushService.sendToAllDevices(message.getTitle(), message.getBody(), message.getUrl(), message.getImage());
    }

    @PostMapping("/fcm-token")
    public void saveFcmToken(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        service.saveFcmToken(token);
    }
}

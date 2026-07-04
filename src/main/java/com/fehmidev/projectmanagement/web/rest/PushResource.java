package com.fehmidev.projectmanagement.web.rest;

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

    public PushResource(PushSubscriptionService service, WebPushService webPushService) {
        this.service = service;
        this.webPushService = webPushService;
    }

    @PostMapping("/subscribe")
    public void subscribe(@RequestBody PushSubscriptionDTO subscription) {
        service.add(subscription);
    }

    @PostMapping("/send")
    public void sendNotification(@RequestBody PushMessageDTO message) {
        webPushService.send(message.getTitle(), message.getBody(), message.getUrl(), message.getImage());
    }

    @PostMapping("/fcm-token")
    public void saveFcmToken(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        // Save token to DB per user, then use FCM to send notifications
        service.saveFcmToken(token);
    }
}

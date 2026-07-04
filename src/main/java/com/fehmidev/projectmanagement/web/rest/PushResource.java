package com.fehmidev.projectmanagement.web.rest;

import com.fehmidev.projectmanagement.service.PushSubscriptionService;
import com.fehmidev.projectmanagement.service.WebPushService;
import com.fehmidev.projectmanagement.service.dto.PushMessageDTO;
import com.fehmidev.projectmanagement.service.dto.PushSubscriptionDTO;
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
        webPushService.send(message.getTitle(), message.getBody(), message.getUrl());
    }
}

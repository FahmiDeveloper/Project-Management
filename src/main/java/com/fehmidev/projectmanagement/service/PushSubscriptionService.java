package com.fehmidev.projectmanagement.service;

import com.fehmidev.projectmanagement.service.dto.PushSubscriptionDTO;
import java.util.ArrayList;
import java.util.ArrayList;
import java.util.List;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class PushSubscriptionService {

    private final List<PushSubscriptionDTO> subscriptions = new ArrayList<>();
    private final List<String> fcmTokens = new ArrayList<>(); // ← ADD

    public void add(PushSubscriptionDTO sub) {
        subscriptions.add(sub);
    }

    public List<PushSubscriptionDTO> findAll() {
        return subscriptions;
    }

    // ← ADD this method
    public void saveFcmToken(String token) {
        if (token != null && !fcmTokens.contains(token)) {
            fcmTokens.add(token);
        }
    }

    // ← ADD this method (needed later to send FCM notifications)
    public List<String> findAllFcmTokens() {
        return fcmTokens;
    }
}

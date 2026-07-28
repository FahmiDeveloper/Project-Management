package com.fehmidev.projectmanagement.service;

import com.fehmidev.projectmanagement.service.dto.PushSubscriptionDTO;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class PushSubscriptionService {

    private final List<PushSubscriptionDTO> subscriptions = new ArrayList<>();
    private final List<String> fcmTokens = new ArrayList<>();

    public void add(PushSubscriptionDTO subscription) {
        subscriptions.add(subscription);
    }

    public List<PushSubscriptionDTO> findAll() {
        return new ArrayList<>(subscriptions);
    }

    public void saveFcmToken(String token) {
        if (!fcmTokens.contains(token)) {
            fcmTokens.add(token);
        }
    }

    public List<String> findAllFcmTokens() {
        return new ArrayList<>(fcmTokens);
    }
}

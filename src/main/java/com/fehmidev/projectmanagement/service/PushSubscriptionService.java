package com.fehmidev.projectmanagement.service;

import com.fehmidev.projectmanagement.service.dto.PushSubscriptionDTO;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class PushSubscriptionService {

    private final List<PushSubscriptionDTO> subscriptions = new ArrayList<>();

    public void add(PushSubscriptionDTO sub) {
        subscriptions.add(sub);
    }

    public List<PushSubscriptionDTO> findAll() {
        return subscriptions;
    }
}

package com.fehmidev.projectmanagement.service.dto;

import java.util.Map;

public class PushSubscriptionDTO {

    private String endpoint;
    private Map<String, String> keys;

    public String getEndpoint() {
        return endpoint;
    }

    public void setEndpoint(String endpoint) {
        this.endpoint = endpoint;
    }

    public Map<String, String> getKeys() {
        return keys;
    }

    public void setKeys(Map<String, String> keys) {
        this.keys = keys;
    }
}

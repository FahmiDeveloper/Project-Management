package com.fehmidev.projectmanagement.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class ClientTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static Client getClientSample1() {
        return new Client()
            .id(1L)
            .companyName("companyName1")
            .contactName("contactName1")
            .email("email1")
            .phone("phone1")
            .address("address1")
            .city("city1")
            .country("country1")
            .website("website1");
    }

    public static Client getClientSample2() {
        return new Client()
            .id(2L)
            .companyName("companyName2")
            .contactName("contactName2")
            .email("email2")
            .phone("phone2")
            .address("address2")
            .city("city2")
            .country("country2")
            .website("website2");
    }

    public static Client getClientRandomSampleGenerator() {
        return new Client()
            .id(longCount.incrementAndGet())
            .companyName(UUID.randomUUID().toString())
            .contactName(UUID.randomUUID().toString())
            .email(UUID.randomUUID().toString())
            .phone(UUID.randomUUID().toString())
            .address(UUID.randomUUID().toString())
            .city(UUID.randomUUID().toString())
            .country(UUID.randomUUID().toString())
            .website(UUID.randomUUID().toString());
    }
}

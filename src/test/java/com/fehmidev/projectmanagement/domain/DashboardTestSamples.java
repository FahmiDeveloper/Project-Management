package com.fehmidev.projectmanagement.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class DashboardTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static Dashboard getDashboardSample1() {
        return new Dashboard().id(1L).name("name1").description("description1").layout("layout1");
    }

    public static Dashboard getDashboardSample2() {
        return new Dashboard().id(2L).name("name2").description("description2").layout("layout2");
    }

    public static Dashboard getDashboardRandomSampleGenerator() {
        return new Dashboard()
            .id(longCount.incrementAndGet())
            .name(UUID.randomUUID().toString())
            .description(UUID.randomUUID().toString())
            .layout(UUID.randomUUID().toString());
    }
}

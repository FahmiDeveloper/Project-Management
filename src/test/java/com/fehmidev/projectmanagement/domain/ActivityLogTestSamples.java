package com.fehmidev.projectmanagement.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class ActivityLogTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static ActivityLog getActivityLogSample1() {
        return new ActivityLog().id(1L).action("action1").entityName("entityName1").entityId(1L).description("description1");
    }

    public static ActivityLog getActivityLogSample2() {
        return new ActivityLog().id(2L).action("action2").entityName("entityName2").entityId(2L).description("description2");
    }

    public static ActivityLog getActivityLogRandomSampleGenerator() {
        return new ActivityLog()
            .id(longCount.incrementAndGet())
            .action(UUID.randomUUID().toString())
            .entityName(UUID.randomUUID().toString())
            .entityId(longCount.incrementAndGet())
            .description(UUID.randomUUID().toString());
    }
}

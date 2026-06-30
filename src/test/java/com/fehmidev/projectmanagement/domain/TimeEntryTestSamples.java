package com.fehmidev.projectmanagement.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class TimeEntryTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static TimeEntry getTimeEntrySample1() {
        return new TimeEntry().id(1L).description("description1");
    }

    public static TimeEntry getTimeEntrySample2() {
        return new TimeEntry().id(2L).description("description2");
    }

    public static TimeEntry getTimeEntryRandomSampleGenerator() {
        return new TimeEntry().id(longCount.incrementAndGet()).description(UUID.randomUUID().toString());
    }
}

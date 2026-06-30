package com.fehmidev.projectmanagement.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class ChecklistTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static Checklist getChecklistSample1() {
        return new Checklist().id(1L).title("title1");
    }

    public static Checklist getChecklistSample2() {
        return new Checklist().id(2L).title("title2");
    }

    public static Checklist getChecklistRandomSampleGenerator() {
        return new Checklist().id(longCount.incrementAndGet()).title(UUID.randomUUID().toString());
    }
}

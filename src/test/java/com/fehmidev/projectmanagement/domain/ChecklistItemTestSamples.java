package com.fehmidev.projectmanagement.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class ChecklistItemTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + (2 * Short.MAX_VALUE));

    public static ChecklistItem getChecklistItemSample1() {
        return new ChecklistItem().id(1L).content("content1").position(1);
    }

    public static ChecklistItem getChecklistItemSample2() {
        return new ChecklistItem().id(2L).content("content2").position(2);
    }

    public static ChecklistItem getChecklistItemRandomSampleGenerator() {
        return new ChecklistItem()
            .id(longCount.incrementAndGet())
            .content(UUID.randomUUID().toString())
            .position(intCount.incrementAndGet());
    }
}

package com.fehmidev.projectmanagement.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class MilestoneTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static Milestone getMilestoneSample1() {
        return new Milestone().id(1L).title("title1");
    }

    public static Milestone getMilestoneSample2() {
        return new Milestone().id(2L).title("title2");
    }

    public static Milestone getMilestoneRandomSampleGenerator() {
        return new Milestone().id(longCount.incrementAndGet()).title(UUID.randomUUID().toString());
    }
}

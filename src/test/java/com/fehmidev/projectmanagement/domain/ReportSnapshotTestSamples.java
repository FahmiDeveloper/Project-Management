package com.fehmidev.projectmanagement.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class ReportSnapshotTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static ReportSnapshot getReportSnapshotSample1() {
        return new ReportSnapshot().id(1L).name("name1").type("type1");
    }

    public static ReportSnapshot getReportSnapshotSample2() {
        return new ReportSnapshot().id(2L).name("name2").type("type2");
    }

    public static ReportSnapshot getReportSnapshotRandomSampleGenerator() {
        return new ReportSnapshot().id(longCount.incrementAndGet()).name(UUID.randomUUID().toString()).type(UUID.randomUUID().toString());
    }
}

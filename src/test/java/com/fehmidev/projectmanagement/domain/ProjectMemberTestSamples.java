package com.fehmidev.projectmanagement.domain;

import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;

public class ProjectMemberTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static ProjectMember getProjectMemberSample1() {
        return new ProjectMember().id(1L);
    }

    public static ProjectMember getProjectMemberSample2() {
        return new ProjectMember().id(2L);
    }

    public static ProjectMember getProjectMemberRandomSampleGenerator() {
        return new ProjectMember().id(longCount.incrementAndGet());
    }
}

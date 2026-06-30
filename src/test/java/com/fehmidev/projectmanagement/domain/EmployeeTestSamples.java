package com.fehmidev.projectmanagement.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class EmployeeTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static Employee getEmployeeSample1() {
        return new Employee()
            .id(1L)
            .employeeNumber("employeeNumber1")
            .firstName("firstName1")
            .lastName("lastName1")
            .phone("phone1")
            .jobTitle("jobTitle1");
    }

    public static Employee getEmployeeSample2() {
        return new Employee()
            .id(2L)
            .employeeNumber("employeeNumber2")
            .firstName("firstName2")
            .lastName("lastName2")
            .phone("phone2")
            .jobTitle("jobTitle2");
    }

    public static Employee getEmployeeRandomSampleGenerator() {
        return new Employee()
            .id(longCount.incrementAndGet())
            .employeeNumber(UUID.randomUUID().toString())
            .firstName(UUID.randomUUID().toString())
            .lastName(UUID.randomUUID().toString())
            .phone(UUID.randomUUID().toString())
            .jobTitle(UUID.randomUUID().toString());
    }
}

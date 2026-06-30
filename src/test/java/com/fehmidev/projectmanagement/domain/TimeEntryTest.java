package com.fehmidev.projectmanagement.domain;

import static com.fehmidev.projectmanagement.domain.EmployeeTestSamples.*;
import static com.fehmidev.projectmanagement.domain.TaskTestSamples.*;
import static com.fehmidev.projectmanagement.domain.TimeEntryTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.fehmidev.projectmanagement.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class TimeEntryTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(TimeEntry.class);
        TimeEntry timeEntry1 = getTimeEntrySample1();
        TimeEntry timeEntry2 = new TimeEntry();
        assertThat(timeEntry1).isNotEqualTo(timeEntry2);

        timeEntry2.setId(timeEntry1.getId());
        assertThat(timeEntry1).isEqualTo(timeEntry2);

        timeEntry2 = getTimeEntrySample2();
        assertThat(timeEntry1).isNotEqualTo(timeEntry2);
    }

    @Test
    void taskTest() {
        TimeEntry timeEntry = getTimeEntryRandomSampleGenerator();
        Task taskBack = getTaskRandomSampleGenerator();

        timeEntry.setTask(taskBack);
        assertThat(timeEntry.getTask()).isEqualTo(taskBack);

        timeEntry.task(null);
        assertThat(timeEntry.getTask()).isNull();
    }

    @Test
    void employeeTest() {
        TimeEntry timeEntry = getTimeEntryRandomSampleGenerator();
        Employee employeeBack = getEmployeeRandomSampleGenerator();

        timeEntry.setEmployee(employeeBack);
        assertThat(timeEntry.getEmployee()).isEqualTo(employeeBack);

        timeEntry.employee(null);
        assertThat(timeEntry.getEmployee()).isNull();
    }
}

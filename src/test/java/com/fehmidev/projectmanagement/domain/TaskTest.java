package com.fehmidev.projectmanagement.domain;

import static com.fehmidev.projectmanagement.domain.EmployeeTestSamples.*;
import static com.fehmidev.projectmanagement.domain.MilestoneTestSamples.*;
import static com.fehmidev.projectmanagement.domain.SprintTestSamples.*;
import static com.fehmidev.projectmanagement.domain.TaskTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.fehmidev.projectmanagement.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class TaskTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Task.class);
        Task task1 = getTaskSample1();
        Task task2 = new Task();
        assertThat(task1).isNotEqualTo(task2);

        task2.setId(task1.getId());
        assertThat(task1).isEqualTo(task2);

        task2 = getTaskSample2();
        assertThat(task1).isNotEqualTo(task2);
    }

    @Test
    void sprintTest() {
        Task task = getTaskRandomSampleGenerator();
        Sprint sprintBack = getSprintRandomSampleGenerator();

        task.setSprint(sprintBack);
        assertThat(task.getSprint()).isEqualTo(sprintBack);

        task.sprint(null);
        assertThat(task.getSprint()).isNull();
    }

    @Test
    void milestoneTest() {
        Task task = getTaskRandomSampleGenerator();
        Milestone milestoneBack = getMilestoneRandomSampleGenerator();

        task.setMilestone(milestoneBack);
        assertThat(task.getMilestone()).isEqualTo(milestoneBack);

        task.milestone(null);
        assertThat(task.getMilestone()).isNull();
    }

    @Test
    void assignedToTest() {
        Task task = getTaskRandomSampleGenerator();
        Employee employeeBack = getEmployeeRandomSampleGenerator();

        task.setAssignedTo(employeeBack);
        assertThat(task.getAssignedTo()).isEqualTo(employeeBack);

        task.assignedTo(null);
        assertThat(task.getAssignedTo()).isNull();
    }

    @Test
    void createdByTest() {
        Task task = getTaskRandomSampleGenerator();
        Employee employeeBack = getEmployeeRandomSampleGenerator();

        task.setCreatedBy(employeeBack);
        assertThat(task.getCreatedBy()).isEqualTo(employeeBack);

        task.createdBy(null);
        assertThat(task.getCreatedBy()).isNull();
    }
}

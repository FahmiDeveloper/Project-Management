package com.fehmidev.projectmanagement.domain;

import static com.fehmidev.projectmanagement.domain.EmployeeTestSamples.*;
import static com.fehmidev.projectmanagement.domain.TaskCommentTestSamples.*;
import static com.fehmidev.projectmanagement.domain.TaskTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.fehmidev.projectmanagement.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class TaskCommentTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(TaskComment.class);
        TaskComment taskComment1 = getTaskCommentSample1();
        TaskComment taskComment2 = new TaskComment();
        assertThat(taskComment1).isNotEqualTo(taskComment2);

        taskComment2.setId(taskComment1.getId());
        assertThat(taskComment1).isEqualTo(taskComment2);

        taskComment2 = getTaskCommentSample2();
        assertThat(taskComment1).isNotEqualTo(taskComment2);
    }

    @Test
    void taskTest() {
        TaskComment taskComment = getTaskCommentRandomSampleGenerator();
        Task taskBack = getTaskRandomSampleGenerator();

        taskComment.setTask(taskBack);
        assertThat(taskComment.getTask()).isEqualTo(taskBack);

        taskComment.task(null);
        assertThat(taskComment.getTask()).isNull();
    }

    @Test
    void employeeTest() {
        TaskComment taskComment = getTaskCommentRandomSampleGenerator();
        Employee employeeBack = getEmployeeRandomSampleGenerator();

        taskComment.setEmployee(employeeBack);
        assertThat(taskComment.getEmployee()).isEqualTo(employeeBack);

        taskComment.employee(null);
        assertThat(taskComment.getEmployee()).isNull();
    }
}

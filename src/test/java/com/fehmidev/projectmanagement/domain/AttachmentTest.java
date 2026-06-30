package com.fehmidev.projectmanagement.domain;

import static com.fehmidev.projectmanagement.domain.AttachmentTestSamples.*;
import static com.fehmidev.projectmanagement.domain.EmployeeTestSamples.*;
import static com.fehmidev.projectmanagement.domain.TaskTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.fehmidev.projectmanagement.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class AttachmentTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Attachment.class);
        Attachment attachment1 = getAttachmentSample1();
        Attachment attachment2 = new Attachment();
        assertThat(attachment1).isNotEqualTo(attachment2);

        attachment2.setId(attachment1.getId());
        assertThat(attachment1).isEqualTo(attachment2);

        attachment2 = getAttachmentSample2();
        assertThat(attachment1).isNotEqualTo(attachment2);
    }

    @Test
    void taskTest() {
        Attachment attachment = getAttachmentRandomSampleGenerator();
        Task taskBack = getTaskRandomSampleGenerator();

        attachment.setTask(taskBack);
        assertThat(attachment.getTask()).isEqualTo(taskBack);

        attachment.task(null);
        assertThat(attachment.getTask()).isNull();
    }

    @Test
    void employeeTest() {
        Attachment attachment = getAttachmentRandomSampleGenerator();
        Employee employeeBack = getEmployeeRandomSampleGenerator();

        attachment.setEmployee(employeeBack);
        assertThat(attachment.getEmployee()).isEqualTo(employeeBack);

        attachment.employee(null);
        assertThat(attachment.getEmployee()).isNull();
    }
}

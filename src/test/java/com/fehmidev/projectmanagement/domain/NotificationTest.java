package com.fehmidev.projectmanagement.domain;

import static com.fehmidev.projectmanagement.domain.EmployeeTestSamples.*;
import static com.fehmidev.projectmanagement.domain.NotificationTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.fehmidev.projectmanagement.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class NotificationTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Notification.class);
        Notification notification1 = getNotificationSample1();
        Notification notification2 = new Notification();
        assertThat(notification1).isNotEqualTo(notification2);

        notification2.setId(notification1.getId());
        assertThat(notification1).isEqualTo(notification2);

        notification2 = getNotificationSample2();
        assertThat(notification1).isNotEqualTo(notification2);
    }

    @Test
    void employeeTest() {
        Notification notification = getNotificationRandomSampleGenerator();
        Employee employeeBack = getEmployeeRandomSampleGenerator();

        notification.setEmployee(employeeBack);
        assertThat(notification.getEmployee()).isEqualTo(employeeBack);

        notification.employee(null);
        assertThat(notification.getEmployee()).isNull();
    }
}

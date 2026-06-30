package com.fehmidev.projectmanagement.domain;

import static com.fehmidev.projectmanagement.domain.ActivityLogTestSamples.*;
import static com.fehmidev.projectmanagement.domain.EmployeeTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.fehmidev.projectmanagement.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class ActivityLogTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(ActivityLog.class);
        ActivityLog activityLog1 = getActivityLogSample1();
        ActivityLog activityLog2 = new ActivityLog();
        assertThat(activityLog1).isNotEqualTo(activityLog2);

        activityLog2.setId(activityLog1.getId());
        assertThat(activityLog1).isEqualTo(activityLog2);

        activityLog2 = getActivityLogSample2();
        assertThat(activityLog1).isNotEqualTo(activityLog2);
    }

    @Test
    void employeeTest() {
        ActivityLog activityLog = getActivityLogRandomSampleGenerator();
        Employee employeeBack = getEmployeeRandomSampleGenerator();

        activityLog.setEmployee(employeeBack);
        assertThat(activityLog.getEmployee()).isEqualTo(employeeBack);

        activityLog.employee(null);
        assertThat(activityLog.getEmployee()).isNull();
    }
}

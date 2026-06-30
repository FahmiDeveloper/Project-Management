package com.fehmidev.projectmanagement.domain;

import static com.fehmidev.projectmanagement.domain.DashboardTestSamples.*;
import static com.fehmidev.projectmanagement.domain.EmployeeTestSamples.*;
import static com.fehmidev.projectmanagement.domain.ProjectTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.fehmidev.projectmanagement.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class DashboardTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Dashboard.class);
        Dashboard dashboard1 = getDashboardSample1();
        Dashboard dashboard2 = new Dashboard();
        assertThat(dashboard1).isNotEqualTo(dashboard2);

        dashboard2.setId(dashboard1.getId());
        assertThat(dashboard1).isEqualTo(dashboard2);

        dashboard2 = getDashboardSample2();
        assertThat(dashboard1).isNotEqualTo(dashboard2);
    }

    @Test
    void employeeTest() {
        Dashboard dashboard = getDashboardRandomSampleGenerator();
        Employee employeeBack = getEmployeeRandomSampleGenerator();

        dashboard.setEmployee(employeeBack);
        assertThat(dashboard.getEmployee()).isEqualTo(employeeBack);

        dashboard.employee(null);
        assertThat(dashboard.getEmployee()).isNull();
    }

    @Test
    void projectTest() {
        Dashboard dashboard = getDashboardRandomSampleGenerator();
        Project projectBack = getProjectRandomSampleGenerator();

        dashboard.setProject(projectBack);
        assertThat(dashboard.getProject()).isEqualTo(projectBack);

        dashboard.project(null);
        assertThat(dashboard.getProject()).isNull();
    }
}

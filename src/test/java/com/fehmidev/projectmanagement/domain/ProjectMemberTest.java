package com.fehmidev.projectmanagement.domain;

import static com.fehmidev.projectmanagement.domain.EmployeeTestSamples.*;
import static com.fehmidev.projectmanagement.domain.ProjectMemberTestSamples.*;
import static com.fehmidev.projectmanagement.domain.ProjectTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.fehmidev.projectmanagement.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class ProjectMemberTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(ProjectMember.class);
        ProjectMember projectMember1 = getProjectMemberSample1();
        ProjectMember projectMember2 = new ProjectMember();
        assertThat(projectMember1).isNotEqualTo(projectMember2);

        projectMember2.setId(projectMember1.getId());
        assertThat(projectMember1).isEqualTo(projectMember2);

        projectMember2 = getProjectMemberSample2();
        assertThat(projectMember1).isNotEqualTo(projectMember2);
    }

    @Test
    void projectTest() {
        ProjectMember projectMember = getProjectMemberRandomSampleGenerator();
        Project projectBack = getProjectRandomSampleGenerator();

        projectMember.setProject(projectBack);
        assertThat(projectMember.getProject()).isEqualTo(projectBack);

        projectMember.project(null);
        assertThat(projectMember.getProject()).isNull();
    }

    @Test
    void employeeTest() {
        ProjectMember projectMember = getProjectMemberRandomSampleGenerator();
        Employee employeeBack = getEmployeeRandomSampleGenerator();

        projectMember.setEmployee(employeeBack);
        assertThat(projectMember.getEmployee()).isEqualTo(employeeBack);

        projectMember.employee(null);
        assertThat(projectMember.getEmployee()).isNull();
    }
}

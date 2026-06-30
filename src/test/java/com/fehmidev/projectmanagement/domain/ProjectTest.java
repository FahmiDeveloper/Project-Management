package com.fehmidev.projectmanagement.domain;

import static com.fehmidev.projectmanagement.domain.ClientTestSamples.*;
import static com.fehmidev.projectmanagement.domain.EmployeeTestSamples.*;
import static com.fehmidev.projectmanagement.domain.ProjectTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.fehmidev.projectmanagement.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class ProjectTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Project.class);
        Project project1 = getProjectSample1();
        Project project2 = new Project();
        assertThat(project1).isNotEqualTo(project2);

        project2.setId(project1.getId());
        assertThat(project1).isEqualTo(project2);

        project2 = getProjectSample2();
        assertThat(project1).isNotEqualTo(project2);
    }

    @Test
    void clientTest() {
        Project project = getProjectRandomSampleGenerator();
        Client clientBack = getClientRandomSampleGenerator();

        project.setClient(clientBack);
        assertThat(project.getClient()).isEqualTo(clientBack);

        project.client(null);
        assertThat(project.getClient()).isNull();
    }

    @Test
    void managerTest() {
        Project project = getProjectRandomSampleGenerator();
        Employee employeeBack = getEmployeeRandomSampleGenerator();

        project.setManager(employeeBack);
        assertThat(project.getManager()).isEqualTo(employeeBack);

        project.manager(null);
        assertThat(project.getManager()).isNull();
    }
}

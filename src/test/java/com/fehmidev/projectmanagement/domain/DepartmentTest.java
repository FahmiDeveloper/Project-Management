package com.fehmidev.projectmanagement.domain;

import static com.fehmidev.projectmanagement.domain.DepartmentTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.fehmidev.projectmanagement.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class DepartmentTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Department.class);
        Department department1 = getDepartmentSample1();
        Department department2 = new Department();
        assertThat(department1).isNotEqualTo(department2);

        department2.setId(department1.getId());
        assertThat(department1).isEqualTo(department2);

        department2 = getDepartmentSample2();
        assertThat(department1).isNotEqualTo(department2);
    }
}

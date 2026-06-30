package com.fehmidev.projectmanagement.domain;

import static com.fehmidev.projectmanagement.domain.ProjectTestSamples.*;
import static com.fehmidev.projectmanagement.domain.ReportSnapshotTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.fehmidev.projectmanagement.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class ReportSnapshotTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(ReportSnapshot.class);
        ReportSnapshot reportSnapshot1 = getReportSnapshotSample1();
        ReportSnapshot reportSnapshot2 = new ReportSnapshot();
        assertThat(reportSnapshot1).isNotEqualTo(reportSnapshot2);

        reportSnapshot2.setId(reportSnapshot1.getId());
        assertThat(reportSnapshot1).isEqualTo(reportSnapshot2);

        reportSnapshot2 = getReportSnapshotSample2();
        assertThat(reportSnapshot1).isNotEqualTo(reportSnapshot2);
    }

    @Test
    void projectTest() {
        ReportSnapshot reportSnapshot = getReportSnapshotRandomSampleGenerator();
        Project projectBack = getProjectRandomSampleGenerator();

        reportSnapshot.setProject(projectBack);
        assertThat(reportSnapshot.getProject()).isEqualTo(projectBack);

        reportSnapshot.project(null);
        assertThat(reportSnapshot.getProject()).isNull();
    }
}

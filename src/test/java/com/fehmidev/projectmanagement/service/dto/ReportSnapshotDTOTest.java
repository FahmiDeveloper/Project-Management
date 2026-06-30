package com.fehmidev.projectmanagement.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.fehmidev.projectmanagement.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class ReportSnapshotDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(ReportSnapshotDTO.class);
        ReportSnapshotDTO reportSnapshotDTO1 = new ReportSnapshotDTO();
        reportSnapshotDTO1.setId(1L);
        ReportSnapshotDTO reportSnapshotDTO2 = new ReportSnapshotDTO();
        assertThat(reportSnapshotDTO1).isNotEqualTo(reportSnapshotDTO2);
        reportSnapshotDTO2.setId(reportSnapshotDTO1.getId());
        assertThat(reportSnapshotDTO1).isEqualTo(reportSnapshotDTO2);
        reportSnapshotDTO2.setId(2L);
        assertThat(reportSnapshotDTO1).isNotEqualTo(reportSnapshotDTO2);
        reportSnapshotDTO1.setId(null);
        assertThat(reportSnapshotDTO1).isNotEqualTo(reportSnapshotDTO2);
    }
}

package com.fehmidev.projectmanagement.service.mapper;

import static com.fehmidev.projectmanagement.domain.ReportSnapshotAsserts.*;
import static com.fehmidev.projectmanagement.domain.ReportSnapshotTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class ReportSnapshotMapperTest {

    private ReportSnapshotMapper reportSnapshotMapper;

    @BeforeEach
    void setUp() {
        reportSnapshotMapper = new ReportSnapshotMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getReportSnapshotSample1();
        var actual = reportSnapshotMapper.toEntity(reportSnapshotMapper.toDto(expected));
        assertReportSnapshotAllPropertiesEquals(expected, actual);
    }
}

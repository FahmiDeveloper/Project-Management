package com.fehmidev.projectmanagement.service.mapper;

import static com.fehmidev.projectmanagement.domain.DashboardAsserts.*;
import static com.fehmidev.projectmanagement.domain.DashboardTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class DashboardMapperTest {

    private DashboardMapper dashboardMapper;

    @BeforeEach
    void setUp() {
        dashboardMapper = new DashboardMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getDashboardSample1();
        var actual = dashboardMapper.toEntity(dashboardMapper.toDto(expected));
        assertDashboardAllPropertiesEquals(expected, actual);
    }
}

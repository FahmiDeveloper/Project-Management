package com.fehmidev.projectmanagement.service.mapper;

import static com.fehmidev.projectmanagement.domain.TimeEntryAsserts.*;
import static com.fehmidev.projectmanagement.domain.TimeEntryTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class TimeEntryMapperTest {

    private TimeEntryMapper timeEntryMapper;

    @BeforeEach
    void setUp() {
        timeEntryMapper = new TimeEntryMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getTimeEntrySample1();
        var actual = timeEntryMapper.toEntity(timeEntryMapper.toDto(expected));
        assertTimeEntryAllPropertiesEquals(expected, actual);
    }
}

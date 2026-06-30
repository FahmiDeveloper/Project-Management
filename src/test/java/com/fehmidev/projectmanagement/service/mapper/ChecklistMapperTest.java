package com.fehmidev.projectmanagement.service.mapper;

import static com.fehmidev.projectmanagement.domain.ChecklistAsserts.*;
import static com.fehmidev.projectmanagement.domain.ChecklistTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class ChecklistMapperTest {

    private ChecklistMapper checklistMapper;

    @BeforeEach
    void setUp() {
        checklistMapper = new ChecklistMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getChecklistSample1();
        var actual = checklistMapper.toEntity(checklistMapper.toDto(expected));
        assertChecklistAllPropertiesEquals(expected, actual);
    }
}

package com.fehmidev.projectmanagement.service.mapper;

import static com.fehmidev.projectmanagement.domain.ChecklistItemAsserts.*;
import static com.fehmidev.projectmanagement.domain.ChecklistItemTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class ChecklistItemMapperTest {

    private ChecklistItemMapper checklistItemMapper;

    @BeforeEach
    void setUp() {
        checklistItemMapper = new ChecklistItemMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getChecklistItemSample1();
        var actual = checklistItemMapper.toEntity(checklistItemMapper.toDto(expected));
        assertChecklistItemAllPropertiesEquals(expected, actual);
    }
}

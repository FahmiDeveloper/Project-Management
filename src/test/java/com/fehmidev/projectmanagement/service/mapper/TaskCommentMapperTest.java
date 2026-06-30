package com.fehmidev.projectmanagement.service.mapper;

import static com.fehmidev.projectmanagement.domain.TaskCommentAsserts.*;
import static com.fehmidev.projectmanagement.domain.TaskCommentTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class TaskCommentMapperTest {

    private TaskCommentMapper taskCommentMapper;

    @BeforeEach
    void setUp() {
        taskCommentMapper = new TaskCommentMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getTaskCommentSample1();
        var actual = taskCommentMapper.toEntity(taskCommentMapper.toDto(expected));
        assertTaskCommentAllPropertiesEquals(expected, actual);
    }
}

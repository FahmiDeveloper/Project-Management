package com.fehmidev.projectmanagement.domain;

import static com.fehmidev.projectmanagement.domain.ChecklistTestSamples.*;
import static com.fehmidev.projectmanagement.domain.TaskTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.fehmidev.projectmanagement.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class ChecklistTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Checklist.class);
        Checklist checklist1 = getChecklistSample1();
        Checklist checklist2 = new Checklist();
        assertThat(checklist1).isNotEqualTo(checklist2);

        checklist2.setId(checklist1.getId());
        assertThat(checklist1).isEqualTo(checklist2);

        checklist2 = getChecklistSample2();
        assertThat(checklist1).isNotEqualTo(checklist2);
    }

    @Test
    void taskTest() {
        Checklist checklist = getChecklistRandomSampleGenerator();
        Task taskBack = getTaskRandomSampleGenerator();

        checklist.setTask(taskBack);
        assertThat(checklist.getTask()).isEqualTo(taskBack);

        checklist.task(null);
        assertThat(checklist.getTask()).isNull();
    }
}

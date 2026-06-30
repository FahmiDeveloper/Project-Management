package com.fehmidev.projectmanagement.domain;

import static com.fehmidev.projectmanagement.domain.ChecklistItemTestSamples.*;
import static com.fehmidev.projectmanagement.domain.ChecklistTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.fehmidev.projectmanagement.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class ChecklistItemTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(ChecklistItem.class);
        ChecklistItem checklistItem1 = getChecklistItemSample1();
        ChecklistItem checklistItem2 = new ChecklistItem();
        assertThat(checklistItem1).isNotEqualTo(checklistItem2);

        checklistItem2.setId(checklistItem1.getId());
        assertThat(checklistItem1).isEqualTo(checklistItem2);

        checklistItem2 = getChecklistItemSample2();
        assertThat(checklistItem1).isNotEqualTo(checklistItem2);
    }

    @Test
    void checklistTest() {
        ChecklistItem checklistItem = getChecklistItemRandomSampleGenerator();
        Checklist checklistBack = getChecklistRandomSampleGenerator();

        checklistItem.setChecklist(checklistBack);
        assertThat(checklistItem.getChecklist()).isEqualTo(checklistBack);

        checklistItem.checklist(null);
        assertThat(checklistItem.getChecklist()).isNull();
    }
}

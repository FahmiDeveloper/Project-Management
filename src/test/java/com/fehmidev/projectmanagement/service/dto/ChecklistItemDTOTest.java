package com.fehmidev.projectmanagement.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.fehmidev.projectmanagement.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class ChecklistItemDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(ChecklistItemDTO.class);
        ChecklistItemDTO checklistItemDTO1 = new ChecklistItemDTO();
        checklistItemDTO1.setId(1L);
        ChecklistItemDTO checklistItemDTO2 = new ChecklistItemDTO();
        assertThat(checklistItemDTO1).isNotEqualTo(checklistItemDTO2);
        checklistItemDTO2.setId(checklistItemDTO1.getId());
        assertThat(checklistItemDTO1).isEqualTo(checklistItemDTO2);
        checklistItemDTO2.setId(2L);
        assertThat(checklistItemDTO1).isNotEqualTo(checklistItemDTO2);
        checklistItemDTO1.setId(null);
        assertThat(checklistItemDTO1).isNotEqualTo(checklistItemDTO2);
    }
}

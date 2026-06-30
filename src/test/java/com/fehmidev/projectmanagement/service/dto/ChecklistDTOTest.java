package com.fehmidev.projectmanagement.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.fehmidev.projectmanagement.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class ChecklistDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(ChecklistDTO.class);
        ChecklistDTO checklistDTO1 = new ChecklistDTO();
        checklistDTO1.setId(1L);
        ChecklistDTO checklistDTO2 = new ChecklistDTO();
        assertThat(checklistDTO1).isNotEqualTo(checklistDTO2);
        checklistDTO2.setId(checklistDTO1.getId());
        assertThat(checklistDTO1).isEqualTo(checklistDTO2);
        checklistDTO2.setId(2L);
        assertThat(checklistDTO1).isNotEqualTo(checklistDTO2);
        checklistDTO1.setId(null);
        assertThat(checklistDTO1).isNotEqualTo(checklistDTO2);
    }
}

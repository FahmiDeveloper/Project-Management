package com.fehmidev.projectmanagement.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.fehmidev.projectmanagement.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class TimeEntryDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(TimeEntryDTO.class);
        TimeEntryDTO timeEntryDTO1 = new TimeEntryDTO();
        timeEntryDTO1.setId(1L);
        TimeEntryDTO timeEntryDTO2 = new TimeEntryDTO();
        assertThat(timeEntryDTO1).isNotEqualTo(timeEntryDTO2);
        timeEntryDTO2.setId(timeEntryDTO1.getId());
        assertThat(timeEntryDTO1).isEqualTo(timeEntryDTO2);
        timeEntryDTO2.setId(2L);
        assertThat(timeEntryDTO1).isNotEqualTo(timeEntryDTO2);
        timeEntryDTO1.setId(null);
        assertThat(timeEntryDTO1).isNotEqualTo(timeEntryDTO2);
    }
}

package com.fehmidev.projectmanagement.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.fehmidev.projectmanagement.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class ProjectMemberDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(ProjectMemberDTO.class);
        ProjectMemberDTO projectMemberDTO1 = new ProjectMemberDTO();
        projectMemberDTO1.setId(1L);
        ProjectMemberDTO projectMemberDTO2 = new ProjectMemberDTO();
        assertThat(projectMemberDTO1).isNotEqualTo(projectMemberDTO2);
        projectMemberDTO2.setId(projectMemberDTO1.getId());
        assertThat(projectMemberDTO1).isEqualTo(projectMemberDTO2);
        projectMemberDTO2.setId(2L);
        assertThat(projectMemberDTO1).isNotEqualTo(projectMemberDTO2);
        projectMemberDTO1.setId(null);
        assertThat(projectMemberDTO1).isNotEqualTo(projectMemberDTO2);
    }
}

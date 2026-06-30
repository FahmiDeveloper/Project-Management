package com.fehmidev.projectmanagement.web.rest;

import static com.fehmidev.projectmanagement.domain.ProjectMemberAsserts.*;
import static com.fehmidev.projectmanagement.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fehmidev.projectmanagement.IntegrationTest;
import com.fehmidev.projectmanagement.domain.ProjectMember;
import com.fehmidev.projectmanagement.domain.enumeration.MemberRole;
import com.fehmidev.projectmanagement.repository.ProjectMemberRepository;
import com.fehmidev.projectmanagement.service.dto.ProjectMemberDTO;
import com.fehmidev.projectmanagement.service.mapper.ProjectMemberMapper;
import jakarta.persistence.EntityManager;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link ProjectMemberResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class ProjectMemberResourceIT {

    private static final MemberRole DEFAULT_ROLE = MemberRole.PROJECT_MANAGER;
    private static final MemberRole UPDATED_ROLE = MemberRole.TEAM_LEAD;

    private static final LocalDate DEFAULT_JOINED_DATE = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_JOINED_DATE = LocalDate.now(ZoneId.systemDefault());

    private static final Boolean DEFAULT_ACTIVE = false;
    private static final Boolean UPDATED_ACTIVE = true;

    private static final String ENTITY_API_URL = "/api/project-members";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private ProjectMemberRepository projectMemberRepository;

    @Autowired
    private ProjectMemberMapper projectMemberMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restProjectMemberMockMvc;

    private ProjectMember projectMember;

    private ProjectMember insertedProjectMember;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static ProjectMember createEntity() {
        return new ProjectMember().role(DEFAULT_ROLE).joinedDate(DEFAULT_JOINED_DATE).active(DEFAULT_ACTIVE);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static ProjectMember createUpdatedEntity() {
        return new ProjectMember().role(UPDATED_ROLE).joinedDate(UPDATED_JOINED_DATE).active(UPDATED_ACTIVE);
    }

    @BeforeEach
    void initTest() {
        projectMember = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedProjectMember != null) {
            projectMemberRepository.delete(insertedProjectMember);
            insertedProjectMember = null;
        }
    }

    @Test
    @Transactional
    void createProjectMember() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the ProjectMember
        ProjectMemberDTO projectMemberDTO = projectMemberMapper.toDto(projectMember);
        var returnedProjectMemberDTO = om.readValue(
            restProjectMemberMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(projectMemberDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            ProjectMemberDTO.class
        );

        // Validate the ProjectMember in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedProjectMember = projectMemberMapper.toEntity(returnedProjectMemberDTO);
        assertProjectMemberUpdatableFieldsEquals(returnedProjectMember, getPersistedProjectMember(returnedProjectMember));

        insertedProjectMember = returnedProjectMember;
    }

    @Test
    @Transactional
    void createProjectMemberWithExistingId() throws Exception {
        // Create the ProjectMember with an existing ID
        projectMember.setId(1L);
        ProjectMemberDTO projectMemberDTO = projectMemberMapper.toDto(projectMember);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restProjectMemberMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(projectMemberDTO)))
            .andExpect(status().isBadRequest());

        // Validate the ProjectMember in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkRoleIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        projectMember.setRole(null);

        // Create the ProjectMember, which fails.
        ProjectMemberDTO projectMemberDTO = projectMemberMapper.toDto(projectMember);

        restProjectMemberMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(projectMemberDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkJoinedDateIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        projectMember.setJoinedDate(null);

        // Create the ProjectMember, which fails.
        ProjectMemberDTO projectMemberDTO = projectMemberMapper.toDto(projectMember);

        restProjectMemberMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(projectMemberDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkActiveIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        projectMember.setActive(null);

        // Create the ProjectMember, which fails.
        ProjectMemberDTO projectMemberDTO = projectMemberMapper.toDto(projectMember);

        restProjectMemberMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(projectMemberDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllProjectMembers() throws Exception {
        // Initialize the database
        insertedProjectMember = projectMemberRepository.saveAndFlush(projectMember);

        // Get all the projectMemberList
        restProjectMemberMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(projectMember.getId().intValue())))
            .andExpect(jsonPath("$.[*].role").value(hasItem(DEFAULT_ROLE.toString())))
            .andExpect(jsonPath("$.[*].joinedDate").value(hasItem(DEFAULT_JOINED_DATE.toString())))
            .andExpect(jsonPath("$.[*].active").value(hasItem(DEFAULT_ACTIVE)));
    }

    @Test
    @Transactional
    void getProjectMember() throws Exception {
        // Initialize the database
        insertedProjectMember = projectMemberRepository.saveAndFlush(projectMember);

        // Get the projectMember
        restProjectMemberMockMvc
            .perform(get(ENTITY_API_URL_ID, projectMember.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(projectMember.getId().intValue()))
            .andExpect(jsonPath("$.role").value(DEFAULT_ROLE.toString()))
            .andExpect(jsonPath("$.joinedDate").value(DEFAULT_JOINED_DATE.toString()))
            .andExpect(jsonPath("$.active").value(DEFAULT_ACTIVE));
    }

    @Test
    @Transactional
    void getNonExistingProjectMember() throws Exception {
        // Get the projectMember
        restProjectMemberMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingProjectMember() throws Exception {
        // Initialize the database
        insertedProjectMember = projectMemberRepository.saveAndFlush(projectMember);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the projectMember
        ProjectMember updatedProjectMember = projectMemberRepository.findById(projectMember.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedProjectMember are not directly saved in db
        em.detach(updatedProjectMember);
        updatedProjectMember.role(UPDATED_ROLE).joinedDate(UPDATED_JOINED_DATE).active(UPDATED_ACTIVE);
        ProjectMemberDTO projectMemberDTO = projectMemberMapper.toDto(updatedProjectMember);

        restProjectMemberMockMvc
            .perform(
                put(ENTITY_API_URL_ID, projectMemberDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(projectMemberDTO))
            )
            .andExpect(status().isOk());

        // Validate the ProjectMember in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedProjectMemberToMatchAllProperties(updatedProjectMember);
    }

    @Test
    @Transactional
    void putNonExistingProjectMember() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        projectMember.setId(longCount.incrementAndGet());

        // Create the ProjectMember
        ProjectMemberDTO projectMemberDTO = projectMemberMapper.toDto(projectMember);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restProjectMemberMockMvc
            .perform(
                put(ENTITY_API_URL_ID, projectMemberDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(projectMemberDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ProjectMember in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchProjectMember() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        projectMember.setId(longCount.incrementAndGet());

        // Create the ProjectMember
        ProjectMemberDTO projectMemberDTO = projectMemberMapper.toDto(projectMember);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restProjectMemberMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(projectMemberDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ProjectMember in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamProjectMember() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        projectMember.setId(longCount.incrementAndGet());

        // Create the ProjectMember
        ProjectMemberDTO projectMemberDTO = projectMemberMapper.toDto(projectMember);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restProjectMemberMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(projectMemberDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the ProjectMember in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateProjectMemberWithPatch() throws Exception {
        // Initialize the database
        insertedProjectMember = projectMemberRepository.saveAndFlush(projectMember);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the projectMember using partial update
        ProjectMember partialUpdatedProjectMember = new ProjectMember();
        partialUpdatedProjectMember.setId(projectMember.getId());

        partialUpdatedProjectMember.role(UPDATED_ROLE).active(UPDATED_ACTIVE);

        restProjectMemberMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedProjectMember.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedProjectMember))
            )
            .andExpect(status().isOk());

        // Validate the ProjectMember in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertProjectMemberUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedProjectMember, projectMember),
            getPersistedProjectMember(projectMember)
        );
    }

    @Test
    @Transactional
    void fullUpdateProjectMemberWithPatch() throws Exception {
        // Initialize the database
        insertedProjectMember = projectMemberRepository.saveAndFlush(projectMember);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the projectMember using partial update
        ProjectMember partialUpdatedProjectMember = new ProjectMember();
        partialUpdatedProjectMember.setId(projectMember.getId());

        partialUpdatedProjectMember.role(UPDATED_ROLE).joinedDate(UPDATED_JOINED_DATE).active(UPDATED_ACTIVE);

        restProjectMemberMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedProjectMember.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedProjectMember))
            )
            .andExpect(status().isOk());

        // Validate the ProjectMember in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertProjectMemberUpdatableFieldsEquals(partialUpdatedProjectMember, getPersistedProjectMember(partialUpdatedProjectMember));
    }

    @Test
    @Transactional
    void patchNonExistingProjectMember() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        projectMember.setId(longCount.incrementAndGet());

        // Create the ProjectMember
        ProjectMemberDTO projectMemberDTO = projectMemberMapper.toDto(projectMember);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restProjectMemberMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, projectMemberDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(projectMemberDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ProjectMember in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchProjectMember() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        projectMember.setId(longCount.incrementAndGet());

        // Create the ProjectMember
        ProjectMemberDTO projectMemberDTO = projectMemberMapper.toDto(projectMember);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restProjectMemberMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(projectMemberDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ProjectMember in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamProjectMember() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        projectMember.setId(longCount.incrementAndGet());

        // Create the ProjectMember
        ProjectMemberDTO projectMemberDTO = projectMemberMapper.toDto(projectMember);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restProjectMemberMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(projectMemberDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the ProjectMember in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteProjectMember() throws Exception {
        // Initialize the database
        insertedProjectMember = projectMemberRepository.saveAndFlush(projectMember);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the projectMember
        restProjectMemberMockMvc
            .perform(delete(ENTITY_API_URL_ID, projectMember.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return projectMemberRepository.count();
    }

    protected void assertIncrementedRepositoryCount(long countBefore) {
        assertThat(countBefore + 1).isEqualTo(getRepositoryCount());
    }

    protected void assertDecrementedRepositoryCount(long countBefore) {
        assertThat(countBefore - 1).isEqualTo(getRepositoryCount());
    }

    protected void assertSameRepositoryCount(long countBefore) {
        assertThat(countBefore).isEqualTo(getRepositoryCount());
    }

    protected ProjectMember getPersistedProjectMember(ProjectMember projectMember) {
        return projectMemberRepository.findById(projectMember.getId()).orElseThrow();
    }

    protected void assertPersistedProjectMemberToMatchAllProperties(ProjectMember expectedProjectMember) {
        assertProjectMemberAllPropertiesEquals(expectedProjectMember, getPersistedProjectMember(expectedProjectMember));
    }

    protected void assertPersistedProjectMemberToMatchUpdatableProperties(ProjectMember expectedProjectMember) {
        assertProjectMemberAllUpdatablePropertiesEquals(expectedProjectMember, getPersistedProjectMember(expectedProjectMember));
    }
}

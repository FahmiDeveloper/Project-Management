package com.fehmidev.projectmanagement.web.rest;

import static com.fehmidev.projectmanagement.domain.SprintAsserts.*;
import static com.fehmidev.projectmanagement.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fehmidev.projectmanagement.IntegrationTest;
import com.fehmidev.projectmanagement.domain.Sprint;
import com.fehmidev.projectmanagement.domain.enumeration.SprintStatus;
import com.fehmidev.projectmanagement.repository.SprintRepository;
import com.fehmidev.projectmanagement.service.SprintService;
import com.fehmidev.projectmanagement.service.dto.SprintDTO;
import com.fehmidev.projectmanagement.service.mapper.SprintMapper;
import jakarta.persistence.EntityManager;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link SprintResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class SprintResourceIT {

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_GOAL = "AAAAAAAAAA";
    private static final String UPDATED_GOAL = "BBBBBBBBBB";

    private static final LocalDate DEFAULT_START_DATE = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_START_DATE = LocalDate.now(ZoneId.systemDefault());

    private static final LocalDate DEFAULT_END_DATE = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_END_DATE = LocalDate.now(ZoneId.systemDefault());

    private static final SprintStatus DEFAULT_STATUS = SprintStatus.PLANNED;
    private static final SprintStatus UPDATED_STATUS = SprintStatus.ACTIVE;

    private static final Integer DEFAULT_CAPACITY = 1;
    private static final Integer UPDATED_CAPACITY = 2;

    private static final Integer DEFAULT_VELOCITY = 0;
    private static final Integer UPDATED_VELOCITY = 1;

    private static final String ENTITY_API_URL = "/api/sprints";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private SprintRepository sprintRepository;

    @Mock
    private SprintRepository sprintRepositoryMock;

    @Autowired
    private SprintMapper sprintMapper;

    @Mock
    private SprintService sprintServiceMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restSprintMockMvc;

    private Sprint sprint;

    private Sprint insertedSprint;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Sprint createEntity() {
        return new Sprint()
            .name(DEFAULT_NAME)
            .goal(DEFAULT_GOAL)
            .startDate(DEFAULT_START_DATE)
            .endDate(DEFAULT_END_DATE)
            .status(DEFAULT_STATUS)
            .capacity(DEFAULT_CAPACITY)
            .velocity(DEFAULT_VELOCITY);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Sprint createUpdatedEntity() {
        return new Sprint()
            .name(UPDATED_NAME)
            .goal(UPDATED_GOAL)
            .startDate(UPDATED_START_DATE)
            .endDate(UPDATED_END_DATE)
            .status(UPDATED_STATUS)
            .capacity(UPDATED_CAPACITY)
            .velocity(UPDATED_VELOCITY);
    }

    @BeforeEach
    void initTest() {
        sprint = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedSprint != null) {
            sprintRepository.delete(insertedSprint);
            insertedSprint = null;
        }
    }

    @Test
    @Transactional
    void createSprint() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the Sprint
        SprintDTO sprintDTO = sprintMapper.toDto(sprint);
        var returnedSprintDTO = om.readValue(
            restSprintMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(sprintDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            SprintDTO.class
        );

        // Validate the Sprint in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedSprint = sprintMapper.toEntity(returnedSprintDTO);
        assertSprintUpdatableFieldsEquals(returnedSprint, getPersistedSprint(returnedSprint));

        insertedSprint = returnedSprint;
    }

    @Test
    @Transactional
    void createSprintWithExistingId() throws Exception {
        // Create the Sprint with an existing ID
        sprint.setId(1L);
        SprintDTO sprintDTO = sprintMapper.toDto(sprint);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restSprintMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(sprintDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Sprint in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkNameIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        sprint.setName(null);

        // Create the Sprint, which fails.
        SprintDTO sprintDTO = sprintMapper.toDto(sprint);

        restSprintMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(sprintDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkStartDateIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        sprint.setStartDate(null);

        // Create the Sprint, which fails.
        SprintDTO sprintDTO = sprintMapper.toDto(sprint);

        restSprintMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(sprintDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkEndDateIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        sprint.setEndDate(null);

        // Create the Sprint, which fails.
        SprintDTO sprintDTO = sprintMapper.toDto(sprint);

        restSprintMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(sprintDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkStatusIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        sprint.setStatus(null);

        // Create the Sprint, which fails.
        SprintDTO sprintDTO = sprintMapper.toDto(sprint);

        restSprintMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(sprintDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllSprints() throws Exception {
        // Initialize the database
        insertedSprint = sprintRepository.saveAndFlush(sprint);

        // Get all the sprintList
        restSprintMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(sprint.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].goal").value(hasItem(DEFAULT_GOAL)))
            .andExpect(jsonPath("$.[*].startDate").value(hasItem(DEFAULT_START_DATE.toString())))
            .andExpect(jsonPath("$.[*].endDate").value(hasItem(DEFAULT_END_DATE.toString())))
            .andExpect(jsonPath("$.[*].status").value(hasItem(DEFAULT_STATUS.toString())))
            .andExpect(jsonPath("$.[*].capacity").value(hasItem(DEFAULT_CAPACITY)))
            .andExpect(jsonPath("$.[*].velocity").value(hasItem(DEFAULT_VELOCITY)));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllSprintsWithEagerRelationshipsIsEnabled() throws Exception {
        when(sprintServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restSprintMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(sprintServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllSprintsWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(sprintServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restSprintMockMvc.perform(get(ENTITY_API_URL + "?eagerload=false")).andExpect(status().isOk());
        verify(sprintRepositoryMock, times(1)).findAll(any(Pageable.class));
    }

    @Test
    @Transactional
    void getSprint() throws Exception {
        // Initialize the database
        insertedSprint = sprintRepository.saveAndFlush(sprint);

        // Get the sprint
        restSprintMockMvc
            .perform(get(ENTITY_API_URL_ID, sprint.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(sprint.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME))
            .andExpect(jsonPath("$.goal").value(DEFAULT_GOAL))
            .andExpect(jsonPath("$.startDate").value(DEFAULT_START_DATE.toString()))
            .andExpect(jsonPath("$.endDate").value(DEFAULT_END_DATE.toString()))
            .andExpect(jsonPath("$.status").value(DEFAULT_STATUS.toString()))
            .andExpect(jsonPath("$.capacity").value(DEFAULT_CAPACITY))
            .andExpect(jsonPath("$.velocity").value(DEFAULT_VELOCITY));
    }

    @Test
    @Transactional
    void getNonExistingSprint() throws Exception {
        // Get the sprint
        restSprintMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingSprint() throws Exception {
        // Initialize the database
        insertedSprint = sprintRepository.saveAndFlush(sprint);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the sprint
        Sprint updatedSprint = sprintRepository.findById(sprint.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedSprint are not directly saved in db
        em.detach(updatedSprint);
        updatedSprint
            .name(UPDATED_NAME)
            .goal(UPDATED_GOAL)
            .startDate(UPDATED_START_DATE)
            .endDate(UPDATED_END_DATE)
            .status(UPDATED_STATUS)
            .capacity(UPDATED_CAPACITY)
            .velocity(UPDATED_VELOCITY);
        SprintDTO sprintDTO = sprintMapper.toDto(updatedSprint);

        restSprintMockMvc
            .perform(
                put(ENTITY_API_URL_ID, sprintDTO.getId()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(sprintDTO))
            )
            .andExpect(status().isOk());

        // Validate the Sprint in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedSprintToMatchAllProperties(updatedSprint);
    }

    @Test
    @Transactional
    void putNonExistingSprint() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        sprint.setId(longCount.incrementAndGet());

        // Create the Sprint
        SprintDTO sprintDTO = sprintMapper.toDto(sprint);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restSprintMockMvc
            .perform(
                put(ENTITY_API_URL_ID, sprintDTO.getId()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(sprintDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Sprint in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchSprint() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        sprint.setId(longCount.incrementAndGet());

        // Create the Sprint
        SprintDTO sprintDTO = sprintMapper.toDto(sprint);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restSprintMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(sprintDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Sprint in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamSprint() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        sprint.setId(longCount.incrementAndGet());

        // Create the Sprint
        SprintDTO sprintDTO = sprintMapper.toDto(sprint);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restSprintMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(sprintDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Sprint in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateSprintWithPatch() throws Exception {
        // Initialize the database
        insertedSprint = sprintRepository.saveAndFlush(sprint);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the sprint using partial update
        Sprint partialUpdatedSprint = new Sprint();
        partialUpdatedSprint.setId(sprint.getId());

        partialUpdatedSprint.goal(UPDATED_GOAL).startDate(UPDATED_START_DATE).velocity(UPDATED_VELOCITY);

        restSprintMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedSprint.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedSprint))
            )
            .andExpect(status().isOk());

        // Validate the Sprint in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertSprintUpdatableFieldsEquals(createUpdateProxyForBean(partialUpdatedSprint, sprint), getPersistedSprint(sprint));
    }

    @Test
    @Transactional
    void fullUpdateSprintWithPatch() throws Exception {
        // Initialize the database
        insertedSprint = sprintRepository.saveAndFlush(sprint);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the sprint using partial update
        Sprint partialUpdatedSprint = new Sprint();
        partialUpdatedSprint.setId(sprint.getId());

        partialUpdatedSprint
            .name(UPDATED_NAME)
            .goal(UPDATED_GOAL)
            .startDate(UPDATED_START_DATE)
            .endDate(UPDATED_END_DATE)
            .status(UPDATED_STATUS)
            .capacity(UPDATED_CAPACITY)
            .velocity(UPDATED_VELOCITY);

        restSprintMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedSprint.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedSprint))
            )
            .andExpect(status().isOk());

        // Validate the Sprint in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertSprintUpdatableFieldsEquals(partialUpdatedSprint, getPersistedSprint(partialUpdatedSprint));
    }

    @Test
    @Transactional
    void patchNonExistingSprint() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        sprint.setId(longCount.incrementAndGet());

        // Create the Sprint
        SprintDTO sprintDTO = sprintMapper.toDto(sprint);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restSprintMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, sprintDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(sprintDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Sprint in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchSprint() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        sprint.setId(longCount.incrementAndGet());

        // Create the Sprint
        SprintDTO sprintDTO = sprintMapper.toDto(sprint);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restSprintMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(sprintDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Sprint in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamSprint() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        sprint.setId(longCount.incrementAndGet());

        // Create the Sprint
        SprintDTO sprintDTO = sprintMapper.toDto(sprint);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restSprintMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(sprintDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Sprint in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteSprint() throws Exception {
        // Initialize the database
        insertedSprint = sprintRepository.saveAndFlush(sprint);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the sprint
        restSprintMockMvc
            .perform(delete(ENTITY_API_URL_ID, sprint.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return sprintRepository.count();
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

    protected Sprint getPersistedSprint(Sprint sprint) {
        return sprintRepository.findById(sprint.getId()).orElseThrow();
    }

    protected void assertPersistedSprintToMatchAllProperties(Sprint expectedSprint) {
        assertSprintAllPropertiesEquals(expectedSprint, getPersistedSprint(expectedSprint));
    }

    protected void assertPersistedSprintToMatchUpdatableProperties(Sprint expectedSprint) {
        assertSprintAllUpdatablePropertiesEquals(expectedSprint, getPersistedSprint(expectedSprint));
    }
}

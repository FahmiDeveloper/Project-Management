package com.fehmidev.projectmanagement.web.rest;

import static com.fehmidev.projectmanagement.domain.ActivityLogAsserts.*;
import static com.fehmidev.projectmanagement.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fehmidev.projectmanagement.IntegrationTest;
import com.fehmidev.projectmanagement.domain.ActivityLog;
import com.fehmidev.projectmanagement.repository.ActivityLogRepository;
import com.fehmidev.projectmanagement.service.ActivityLogService;
import com.fehmidev.projectmanagement.service.dto.ActivityLogDTO;
import com.fehmidev.projectmanagement.service.mapper.ActivityLogMapper;
import jakarta.persistence.EntityManager;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
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
 * Integration tests for the {@link ActivityLogResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class ActivityLogResourceIT {

    private static final String DEFAULT_ACTION = "AAAAAAAAAA";
    private static final String UPDATED_ACTION = "BBBBBBBBBB";

    private static final String DEFAULT_ENTITY_NAME = "AAAAAAAAAA";
    private static final String UPDATED_ENTITY_NAME = "BBBBBBBBBB";

    private static final Long DEFAULT_ENTITY_ID = 1L;
    private static final Long UPDATED_ENTITY_ID = 2L;

    private static final String DEFAULT_DESCRIPTION = "AAAAAAAAAA";
    private static final String UPDATED_DESCRIPTION = "BBBBBBBBBB";

    private static final Instant DEFAULT_CREATED_DATE = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_CREATED_DATE = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String ENTITY_API_URL = "/api/activity-logs";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Mock
    private ActivityLogRepository activityLogRepositoryMock;

    @Autowired
    private ActivityLogMapper activityLogMapper;

    @Mock
    private ActivityLogService activityLogServiceMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restActivityLogMockMvc;

    private ActivityLog activityLog;

    private ActivityLog insertedActivityLog;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static ActivityLog createEntity() {
        return new ActivityLog()
            .action(DEFAULT_ACTION)
            .entityName(DEFAULT_ENTITY_NAME)
            .entityId(DEFAULT_ENTITY_ID)
            .description(DEFAULT_DESCRIPTION)
            .createdDate(DEFAULT_CREATED_DATE);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static ActivityLog createUpdatedEntity() {
        return new ActivityLog()
            .action(UPDATED_ACTION)
            .entityName(UPDATED_ENTITY_NAME)
            .entityId(UPDATED_ENTITY_ID)
            .description(UPDATED_DESCRIPTION)
            .createdDate(UPDATED_CREATED_DATE);
    }

    @BeforeEach
    void initTest() {
        activityLog = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedActivityLog != null) {
            activityLogRepository.delete(insertedActivityLog);
            insertedActivityLog = null;
        }
    }

    @Test
    @Transactional
    void createActivityLog() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the ActivityLog
        ActivityLogDTO activityLogDTO = activityLogMapper.toDto(activityLog);
        var returnedActivityLogDTO = om.readValue(
            restActivityLogMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(activityLogDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            ActivityLogDTO.class
        );

        // Validate the ActivityLog in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedActivityLog = activityLogMapper.toEntity(returnedActivityLogDTO);
        assertActivityLogUpdatableFieldsEquals(returnedActivityLog, getPersistedActivityLog(returnedActivityLog));

        insertedActivityLog = returnedActivityLog;
    }

    @Test
    @Transactional
    void createActivityLogWithExistingId() throws Exception {
        // Create the ActivityLog with an existing ID
        activityLog.setId(1L);
        ActivityLogDTO activityLogDTO = activityLogMapper.toDto(activityLog);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restActivityLogMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(activityLogDTO)))
            .andExpect(status().isBadRequest());

        // Validate the ActivityLog in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkActionIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        activityLog.setAction(null);

        // Create the ActivityLog, which fails.
        ActivityLogDTO activityLogDTO = activityLogMapper.toDto(activityLog);

        restActivityLogMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(activityLogDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkEntityNameIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        activityLog.setEntityName(null);

        // Create the ActivityLog, which fails.
        ActivityLogDTO activityLogDTO = activityLogMapper.toDto(activityLog);

        restActivityLogMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(activityLogDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkCreatedDateIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        activityLog.setCreatedDate(null);

        // Create the ActivityLog, which fails.
        ActivityLogDTO activityLogDTO = activityLogMapper.toDto(activityLog);

        restActivityLogMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(activityLogDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllActivityLogs() throws Exception {
        // Initialize the database
        insertedActivityLog = activityLogRepository.saveAndFlush(activityLog);

        // Get all the activityLogList
        restActivityLogMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(activityLog.getId().intValue())))
            .andExpect(jsonPath("$.[*].action").value(hasItem(DEFAULT_ACTION)))
            .andExpect(jsonPath("$.[*].entityName").value(hasItem(DEFAULT_ENTITY_NAME)))
            .andExpect(jsonPath("$.[*].entityId").value(hasItem(DEFAULT_ENTITY_ID.intValue())))
            .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION)))
            .andExpect(jsonPath("$.[*].createdDate").value(hasItem(DEFAULT_CREATED_DATE.toString())));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllActivityLogsWithEagerRelationshipsIsEnabled() throws Exception {
        when(activityLogServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restActivityLogMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(activityLogServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllActivityLogsWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(activityLogServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restActivityLogMockMvc.perform(get(ENTITY_API_URL + "?eagerload=false")).andExpect(status().isOk());
        verify(activityLogRepositoryMock, times(1)).findAll(any(Pageable.class));
    }

    @Test
    @Transactional
    void getActivityLog() throws Exception {
        // Initialize the database
        insertedActivityLog = activityLogRepository.saveAndFlush(activityLog);

        // Get the activityLog
        restActivityLogMockMvc
            .perform(get(ENTITY_API_URL_ID, activityLog.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(activityLog.getId().intValue()))
            .andExpect(jsonPath("$.action").value(DEFAULT_ACTION))
            .andExpect(jsonPath("$.entityName").value(DEFAULT_ENTITY_NAME))
            .andExpect(jsonPath("$.entityId").value(DEFAULT_ENTITY_ID.intValue()))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION))
            .andExpect(jsonPath("$.createdDate").value(DEFAULT_CREATED_DATE.toString()));
    }

    @Test
    @Transactional
    void getNonExistingActivityLog() throws Exception {
        // Get the activityLog
        restActivityLogMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingActivityLog() throws Exception {
        // Initialize the database
        insertedActivityLog = activityLogRepository.saveAndFlush(activityLog);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the activityLog
        ActivityLog updatedActivityLog = activityLogRepository.findById(activityLog.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedActivityLog are not directly saved in db
        em.detach(updatedActivityLog);
        updatedActivityLog
            .action(UPDATED_ACTION)
            .entityName(UPDATED_ENTITY_NAME)
            .entityId(UPDATED_ENTITY_ID)
            .description(UPDATED_DESCRIPTION)
            .createdDate(UPDATED_CREATED_DATE);
        ActivityLogDTO activityLogDTO = activityLogMapper.toDto(updatedActivityLog);

        restActivityLogMockMvc
            .perform(
                put(ENTITY_API_URL_ID, activityLogDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(activityLogDTO))
            )
            .andExpect(status().isOk());

        // Validate the ActivityLog in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedActivityLogToMatchAllProperties(updatedActivityLog);
    }

    @Test
    @Transactional
    void putNonExistingActivityLog() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        activityLog.setId(longCount.incrementAndGet());

        // Create the ActivityLog
        ActivityLogDTO activityLogDTO = activityLogMapper.toDto(activityLog);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restActivityLogMockMvc
            .perform(
                put(ENTITY_API_URL_ID, activityLogDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(activityLogDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ActivityLog in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchActivityLog() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        activityLog.setId(longCount.incrementAndGet());

        // Create the ActivityLog
        ActivityLogDTO activityLogDTO = activityLogMapper.toDto(activityLog);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restActivityLogMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(activityLogDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ActivityLog in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamActivityLog() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        activityLog.setId(longCount.incrementAndGet());

        // Create the ActivityLog
        ActivityLogDTO activityLogDTO = activityLogMapper.toDto(activityLog);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restActivityLogMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(activityLogDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the ActivityLog in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateActivityLogWithPatch() throws Exception {
        // Initialize the database
        insertedActivityLog = activityLogRepository.saveAndFlush(activityLog);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the activityLog using partial update
        ActivityLog partialUpdatedActivityLog = new ActivityLog();
        partialUpdatedActivityLog.setId(activityLog.getId());

        partialUpdatedActivityLog
            .action(UPDATED_ACTION)
            .entityName(UPDATED_ENTITY_NAME)
            .description(UPDATED_DESCRIPTION)
            .createdDate(UPDATED_CREATED_DATE);

        restActivityLogMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedActivityLog.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedActivityLog))
            )
            .andExpect(status().isOk());

        // Validate the ActivityLog in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertActivityLogUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedActivityLog, activityLog),
            getPersistedActivityLog(activityLog)
        );
    }

    @Test
    @Transactional
    void fullUpdateActivityLogWithPatch() throws Exception {
        // Initialize the database
        insertedActivityLog = activityLogRepository.saveAndFlush(activityLog);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the activityLog using partial update
        ActivityLog partialUpdatedActivityLog = new ActivityLog();
        partialUpdatedActivityLog.setId(activityLog.getId());

        partialUpdatedActivityLog
            .action(UPDATED_ACTION)
            .entityName(UPDATED_ENTITY_NAME)
            .entityId(UPDATED_ENTITY_ID)
            .description(UPDATED_DESCRIPTION)
            .createdDate(UPDATED_CREATED_DATE);

        restActivityLogMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedActivityLog.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedActivityLog))
            )
            .andExpect(status().isOk());

        // Validate the ActivityLog in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertActivityLogUpdatableFieldsEquals(partialUpdatedActivityLog, getPersistedActivityLog(partialUpdatedActivityLog));
    }

    @Test
    @Transactional
    void patchNonExistingActivityLog() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        activityLog.setId(longCount.incrementAndGet());

        // Create the ActivityLog
        ActivityLogDTO activityLogDTO = activityLogMapper.toDto(activityLog);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restActivityLogMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, activityLogDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(activityLogDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ActivityLog in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchActivityLog() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        activityLog.setId(longCount.incrementAndGet());

        // Create the ActivityLog
        ActivityLogDTO activityLogDTO = activityLogMapper.toDto(activityLog);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restActivityLogMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(activityLogDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ActivityLog in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamActivityLog() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        activityLog.setId(longCount.incrementAndGet());

        // Create the ActivityLog
        ActivityLogDTO activityLogDTO = activityLogMapper.toDto(activityLog);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restActivityLogMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(activityLogDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the ActivityLog in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteActivityLog() throws Exception {
        // Initialize the database
        insertedActivityLog = activityLogRepository.saveAndFlush(activityLog);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the activityLog
        restActivityLogMockMvc
            .perform(delete(ENTITY_API_URL_ID, activityLog.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return activityLogRepository.count();
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

    protected ActivityLog getPersistedActivityLog(ActivityLog activityLog) {
        return activityLogRepository.findById(activityLog.getId()).orElseThrow();
    }

    protected void assertPersistedActivityLogToMatchAllProperties(ActivityLog expectedActivityLog) {
        assertActivityLogAllPropertiesEquals(expectedActivityLog, getPersistedActivityLog(expectedActivityLog));
    }

    protected void assertPersistedActivityLogToMatchUpdatableProperties(ActivityLog expectedActivityLog) {
        assertActivityLogAllUpdatablePropertiesEquals(expectedActivityLog, getPersistedActivityLog(expectedActivityLog));
    }
}

package com.fehmidev.projectmanagement.web.rest;

import static com.fehmidev.projectmanagement.domain.ReportSnapshotAsserts.*;
import static com.fehmidev.projectmanagement.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fehmidev.projectmanagement.IntegrationTest;
import com.fehmidev.projectmanagement.domain.ReportSnapshot;
import com.fehmidev.projectmanagement.repository.ReportSnapshotRepository;
import com.fehmidev.projectmanagement.service.ReportSnapshotService;
import com.fehmidev.projectmanagement.service.dto.ReportSnapshotDTO;
import com.fehmidev.projectmanagement.service.mapper.ReportSnapshotMapper;
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
 * Integration tests for the {@link ReportSnapshotResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class ReportSnapshotResourceIT {

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_TYPE = "AAAAAAAAAA";
    private static final String UPDATED_TYPE = "BBBBBBBBBB";

    private static final Instant DEFAULT_GENERATED_DATE = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_GENERATED_DATE = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String DEFAULT_DATA = "AAAAAAAAAA";
    private static final String UPDATED_DATA = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/report-snapshots";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private ReportSnapshotRepository reportSnapshotRepository;

    @Mock
    private ReportSnapshotRepository reportSnapshotRepositoryMock;

    @Autowired
    private ReportSnapshotMapper reportSnapshotMapper;

    @Mock
    private ReportSnapshotService reportSnapshotServiceMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restReportSnapshotMockMvc;

    private ReportSnapshot reportSnapshot;

    private ReportSnapshot insertedReportSnapshot;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static ReportSnapshot createEntity() {
        return new ReportSnapshot().name(DEFAULT_NAME).type(DEFAULT_TYPE).generatedDate(DEFAULT_GENERATED_DATE).data(DEFAULT_DATA);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static ReportSnapshot createUpdatedEntity() {
        return new ReportSnapshot().name(UPDATED_NAME).type(UPDATED_TYPE).generatedDate(UPDATED_GENERATED_DATE).data(UPDATED_DATA);
    }

    @BeforeEach
    void initTest() {
        reportSnapshot = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedReportSnapshot != null) {
            reportSnapshotRepository.delete(insertedReportSnapshot);
            insertedReportSnapshot = null;
        }
    }

    @Test
    @Transactional
    void createReportSnapshot() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the ReportSnapshot
        ReportSnapshotDTO reportSnapshotDTO = reportSnapshotMapper.toDto(reportSnapshot);
        var returnedReportSnapshotDTO = om.readValue(
            restReportSnapshotMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(reportSnapshotDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            ReportSnapshotDTO.class
        );

        // Validate the ReportSnapshot in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedReportSnapshot = reportSnapshotMapper.toEntity(returnedReportSnapshotDTO);
        assertReportSnapshotUpdatableFieldsEquals(returnedReportSnapshot, getPersistedReportSnapshot(returnedReportSnapshot));

        insertedReportSnapshot = returnedReportSnapshot;
    }

    @Test
    @Transactional
    void createReportSnapshotWithExistingId() throws Exception {
        // Create the ReportSnapshot with an existing ID
        reportSnapshot.setId(1L);
        ReportSnapshotDTO reportSnapshotDTO = reportSnapshotMapper.toDto(reportSnapshot);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restReportSnapshotMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(reportSnapshotDTO)))
            .andExpect(status().isBadRequest());

        // Validate the ReportSnapshot in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkNameIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        reportSnapshot.setName(null);

        // Create the ReportSnapshot, which fails.
        ReportSnapshotDTO reportSnapshotDTO = reportSnapshotMapper.toDto(reportSnapshot);

        restReportSnapshotMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(reportSnapshotDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkTypeIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        reportSnapshot.setType(null);

        // Create the ReportSnapshot, which fails.
        ReportSnapshotDTO reportSnapshotDTO = reportSnapshotMapper.toDto(reportSnapshot);

        restReportSnapshotMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(reportSnapshotDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkGeneratedDateIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        reportSnapshot.setGeneratedDate(null);

        // Create the ReportSnapshot, which fails.
        ReportSnapshotDTO reportSnapshotDTO = reportSnapshotMapper.toDto(reportSnapshot);

        restReportSnapshotMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(reportSnapshotDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllReportSnapshots() throws Exception {
        // Initialize the database
        insertedReportSnapshot = reportSnapshotRepository.saveAndFlush(reportSnapshot);

        // Get all the reportSnapshotList
        restReportSnapshotMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(reportSnapshot.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].type").value(hasItem(DEFAULT_TYPE)))
            .andExpect(jsonPath("$.[*].generatedDate").value(hasItem(DEFAULT_GENERATED_DATE.toString())))
            .andExpect(jsonPath("$.[*].data").value(hasItem(DEFAULT_DATA)));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllReportSnapshotsWithEagerRelationshipsIsEnabled() throws Exception {
        when(reportSnapshotServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restReportSnapshotMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(reportSnapshotServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllReportSnapshotsWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(reportSnapshotServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restReportSnapshotMockMvc.perform(get(ENTITY_API_URL + "?eagerload=false")).andExpect(status().isOk());
        verify(reportSnapshotRepositoryMock, times(1)).findAll(any(Pageable.class));
    }

    @Test
    @Transactional
    void getReportSnapshot() throws Exception {
        // Initialize the database
        insertedReportSnapshot = reportSnapshotRepository.saveAndFlush(reportSnapshot);

        // Get the reportSnapshot
        restReportSnapshotMockMvc
            .perform(get(ENTITY_API_URL_ID, reportSnapshot.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(reportSnapshot.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME))
            .andExpect(jsonPath("$.type").value(DEFAULT_TYPE))
            .andExpect(jsonPath("$.generatedDate").value(DEFAULT_GENERATED_DATE.toString()))
            .andExpect(jsonPath("$.data").value(DEFAULT_DATA));
    }

    @Test
    @Transactional
    void getNonExistingReportSnapshot() throws Exception {
        // Get the reportSnapshot
        restReportSnapshotMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingReportSnapshot() throws Exception {
        // Initialize the database
        insertedReportSnapshot = reportSnapshotRepository.saveAndFlush(reportSnapshot);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the reportSnapshot
        ReportSnapshot updatedReportSnapshot = reportSnapshotRepository.findById(reportSnapshot.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedReportSnapshot are not directly saved in db
        em.detach(updatedReportSnapshot);
        updatedReportSnapshot.name(UPDATED_NAME).type(UPDATED_TYPE).generatedDate(UPDATED_GENERATED_DATE).data(UPDATED_DATA);
        ReportSnapshotDTO reportSnapshotDTO = reportSnapshotMapper.toDto(updatedReportSnapshot);

        restReportSnapshotMockMvc
            .perform(
                put(ENTITY_API_URL_ID, reportSnapshotDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(reportSnapshotDTO))
            )
            .andExpect(status().isOk());

        // Validate the ReportSnapshot in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedReportSnapshotToMatchAllProperties(updatedReportSnapshot);
    }

    @Test
    @Transactional
    void putNonExistingReportSnapshot() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        reportSnapshot.setId(longCount.incrementAndGet());

        // Create the ReportSnapshot
        ReportSnapshotDTO reportSnapshotDTO = reportSnapshotMapper.toDto(reportSnapshot);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restReportSnapshotMockMvc
            .perform(
                put(ENTITY_API_URL_ID, reportSnapshotDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(reportSnapshotDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ReportSnapshot in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchReportSnapshot() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        reportSnapshot.setId(longCount.incrementAndGet());

        // Create the ReportSnapshot
        ReportSnapshotDTO reportSnapshotDTO = reportSnapshotMapper.toDto(reportSnapshot);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restReportSnapshotMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(reportSnapshotDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ReportSnapshot in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamReportSnapshot() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        reportSnapshot.setId(longCount.incrementAndGet());

        // Create the ReportSnapshot
        ReportSnapshotDTO reportSnapshotDTO = reportSnapshotMapper.toDto(reportSnapshot);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restReportSnapshotMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(reportSnapshotDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the ReportSnapshot in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateReportSnapshotWithPatch() throws Exception {
        // Initialize the database
        insertedReportSnapshot = reportSnapshotRepository.saveAndFlush(reportSnapshot);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the reportSnapshot using partial update
        ReportSnapshot partialUpdatedReportSnapshot = new ReportSnapshot();
        partialUpdatedReportSnapshot.setId(reportSnapshot.getId());

        partialUpdatedReportSnapshot.type(UPDATED_TYPE).generatedDate(UPDATED_GENERATED_DATE).data(UPDATED_DATA);

        restReportSnapshotMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedReportSnapshot.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedReportSnapshot))
            )
            .andExpect(status().isOk());

        // Validate the ReportSnapshot in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertReportSnapshotUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedReportSnapshot, reportSnapshot),
            getPersistedReportSnapshot(reportSnapshot)
        );
    }

    @Test
    @Transactional
    void fullUpdateReportSnapshotWithPatch() throws Exception {
        // Initialize the database
        insertedReportSnapshot = reportSnapshotRepository.saveAndFlush(reportSnapshot);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the reportSnapshot using partial update
        ReportSnapshot partialUpdatedReportSnapshot = new ReportSnapshot();
        partialUpdatedReportSnapshot.setId(reportSnapshot.getId());

        partialUpdatedReportSnapshot.name(UPDATED_NAME).type(UPDATED_TYPE).generatedDate(UPDATED_GENERATED_DATE).data(UPDATED_DATA);

        restReportSnapshotMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedReportSnapshot.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedReportSnapshot))
            )
            .andExpect(status().isOk());

        // Validate the ReportSnapshot in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertReportSnapshotUpdatableFieldsEquals(partialUpdatedReportSnapshot, getPersistedReportSnapshot(partialUpdatedReportSnapshot));
    }

    @Test
    @Transactional
    void patchNonExistingReportSnapshot() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        reportSnapshot.setId(longCount.incrementAndGet());

        // Create the ReportSnapshot
        ReportSnapshotDTO reportSnapshotDTO = reportSnapshotMapper.toDto(reportSnapshot);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restReportSnapshotMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, reportSnapshotDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(reportSnapshotDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ReportSnapshot in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchReportSnapshot() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        reportSnapshot.setId(longCount.incrementAndGet());

        // Create the ReportSnapshot
        ReportSnapshotDTO reportSnapshotDTO = reportSnapshotMapper.toDto(reportSnapshot);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restReportSnapshotMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(reportSnapshotDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ReportSnapshot in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamReportSnapshot() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        reportSnapshot.setId(longCount.incrementAndGet());

        // Create the ReportSnapshot
        ReportSnapshotDTO reportSnapshotDTO = reportSnapshotMapper.toDto(reportSnapshot);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restReportSnapshotMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(reportSnapshotDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the ReportSnapshot in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteReportSnapshot() throws Exception {
        // Initialize the database
        insertedReportSnapshot = reportSnapshotRepository.saveAndFlush(reportSnapshot);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the reportSnapshot
        restReportSnapshotMockMvc
            .perform(delete(ENTITY_API_URL_ID, reportSnapshot.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return reportSnapshotRepository.count();
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

    protected ReportSnapshot getPersistedReportSnapshot(ReportSnapshot reportSnapshot) {
        return reportSnapshotRepository.findById(reportSnapshot.getId()).orElseThrow();
    }

    protected void assertPersistedReportSnapshotToMatchAllProperties(ReportSnapshot expectedReportSnapshot) {
        assertReportSnapshotAllPropertiesEquals(expectedReportSnapshot, getPersistedReportSnapshot(expectedReportSnapshot));
    }

    protected void assertPersistedReportSnapshotToMatchUpdatableProperties(ReportSnapshot expectedReportSnapshot) {
        assertReportSnapshotAllUpdatablePropertiesEquals(expectedReportSnapshot, getPersistedReportSnapshot(expectedReportSnapshot));
    }
}

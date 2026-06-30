package com.fehmidev.projectmanagement.web.rest;

import static com.fehmidev.projectmanagement.domain.ChecklistAsserts.*;
import static com.fehmidev.projectmanagement.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fehmidev.projectmanagement.IntegrationTest;
import com.fehmidev.projectmanagement.domain.Checklist;
import com.fehmidev.projectmanagement.repository.ChecklistRepository;
import com.fehmidev.projectmanagement.service.ChecklistService;
import com.fehmidev.projectmanagement.service.dto.ChecklistDTO;
import com.fehmidev.projectmanagement.service.mapper.ChecklistMapper;
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
 * Integration tests for the {@link ChecklistResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class ChecklistResourceIT {

    private static final String DEFAULT_TITLE = "AAAAAAAAAA";
    private static final String UPDATED_TITLE = "BBBBBBBBBB";

    private static final Instant DEFAULT_CREATED_DATE = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_CREATED_DATE = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String ENTITY_API_URL = "/api/checklists";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private ChecklistRepository checklistRepository;

    @Mock
    private ChecklistRepository checklistRepositoryMock;

    @Autowired
    private ChecklistMapper checklistMapper;

    @Mock
    private ChecklistService checklistServiceMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restChecklistMockMvc;

    private Checklist checklist;

    private Checklist insertedChecklist;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Checklist createEntity() {
        return new Checklist().title(DEFAULT_TITLE).createdDate(DEFAULT_CREATED_DATE);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Checklist createUpdatedEntity() {
        return new Checklist().title(UPDATED_TITLE).createdDate(UPDATED_CREATED_DATE);
    }

    @BeforeEach
    void initTest() {
        checklist = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedChecklist != null) {
            checklistRepository.delete(insertedChecklist);
            insertedChecklist = null;
        }
    }

    @Test
    @Transactional
    void createChecklist() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the Checklist
        ChecklistDTO checklistDTO = checklistMapper.toDto(checklist);
        var returnedChecklistDTO = om.readValue(
            restChecklistMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(checklistDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            ChecklistDTO.class
        );

        // Validate the Checklist in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedChecklist = checklistMapper.toEntity(returnedChecklistDTO);
        assertChecklistUpdatableFieldsEquals(returnedChecklist, getPersistedChecklist(returnedChecklist));

        insertedChecklist = returnedChecklist;
    }

    @Test
    @Transactional
    void createChecklistWithExistingId() throws Exception {
        // Create the Checklist with an existing ID
        checklist.setId(1L);
        ChecklistDTO checklistDTO = checklistMapper.toDto(checklist);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restChecklistMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(checklistDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Checklist in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkTitleIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        checklist.setTitle(null);

        // Create the Checklist, which fails.
        ChecklistDTO checklistDTO = checklistMapper.toDto(checklist);

        restChecklistMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(checklistDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkCreatedDateIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        checklist.setCreatedDate(null);

        // Create the Checklist, which fails.
        ChecklistDTO checklistDTO = checklistMapper.toDto(checklist);

        restChecklistMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(checklistDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllChecklists() throws Exception {
        // Initialize the database
        insertedChecklist = checklistRepository.saveAndFlush(checklist);

        // Get all the checklistList
        restChecklistMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(checklist.getId().intValue())))
            .andExpect(jsonPath("$.[*].title").value(hasItem(DEFAULT_TITLE)))
            .andExpect(jsonPath("$.[*].createdDate").value(hasItem(DEFAULT_CREATED_DATE.toString())));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllChecklistsWithEagerRelationshipsIsEnabled() throws Exception {
        when(checklistServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restChecklistMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(checklistServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllChecklistsWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(checklistServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restChecklistMockMvc.perform(get(ENTITY_API_URL + "?eagerload=false")).andExpect(status().isOk());
        verify(checklistRepositoryMock, times(1)).findAll(any(Pageable.class));
    }

    @Test
    @Transactional
    void getChecklist() throws Exception {
        // Initialize the database
        insertedChecklist = checklistRepository.saveAndFlush(checklist);

        // Get the checklist
        restChecklistMockMvc
            .perform(get(ENTITY_API_URL_ID, checklist.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(checklist.getId().intValue()))
            .andExpect(jsonPath("$.title").value(DEFAULT_TITLE))
            .andExpect(jsonPath("$.createdDate").value(DEFAULT_CREATED_DATE.toString()));
    }

    @Test
    @Transactional
    void getNonExistingChecklist() throws Exception {
        // Get the checklist
        restChecklistMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingChecklist() throws Exception {
        // Initialize the database
        insertedChecklist = checklistRepository.saveAndFlush(checklist);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the checklist
        Checklist updatedChecklist = checklistRepository.findById(checklist.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedChecklist are not directly saved in db
        em.detach(updatedChecklist);
        updatedChecklist.title(UPDATED_TITLE).createdDate(UPDATED_CREATED_DATE);
        ChecklistDTO checklistDTO = checklistMapper.toDto(updatedChecklist);

        restChecklistMockMvc
            .perform(
                put(ENTITY_API_URL_ID, checklistDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(checklistDTO))
            )
            .andExpect(status().isOk());

        // Validate the Checklist in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedChecklistToMatchAllProperties(updatedChecklist);
    }

    @Test
    @Transactional
    void putNonExistingChecklist() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        checklist.setId(longCount.incrementAndGet());

        // Create the Checklist
        ChecklistDTO checklistDTO = checklistMapper.toDto(checklist);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restChecklistMockMvc
            .perform(
                put(ENTITY_API_URL_ID, checklistDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(checklistDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Checklist in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchChecklist() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        checklist.setId(longCount.incrementAndGet());

        // Create the Checklist
        ChecklistDTO checklistDTO = checklistMapper.toDto(checklist);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restChecklistMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(checklistDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Checklist in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamChecklist() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        checklist.setId(longCount.incrementAndGet());

        // Create the Checklist
        ChecklistDTO checklistDTO = checklistMapper.toDto(checklist);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restChecklistMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(checklistDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Checklist in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateChecklistWithPatch() throws Exception {
        // Initialize the database
        insertedChecklist = checklistRepository.saveAndFlush(checklist);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the checklist using partial update
        Checklist partialUpdatedChecklist = new Checklist();
        partialUpdatedChecklist.setId(checklist.getId());

        partialUpdatedChecklist.createdDate(UPDATED_CREATED_DATE);

        restChecklistMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedChecklist.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedChecklist))
            )
            .andExpect(status().isOk());

        // Validate the Checklist in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertChecklistUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedChecklist, checklist),
            getPersistedChecklist(checklist)
        );
    }

    @Test
    @Transactional
    void fullUpdateChecklistWithPatch() throws Exception {
        // Initialize the database
        insertedChecklist = checklistRepository.saveAndFlush(checklist);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the checklist using partial update
        Checklist partialUpdatedChecklist = new Checklist();
        partialUpdatedChecklist.setId(checklist.getId());

        partialUpdatedChecklist.title(UPDATED_TITLE).createdDate(UPDATED_CREATED_DATE);

        restChecklistMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedChecklist.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedChecklist))
            )
            .andExpect(status().isOk());

        // Validate the Checklist in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertChecklistUpdatableFieldsEquals(partialUpdatedChecklist, getPersistedChecklist(partialUpdatedChecklist));
    }

    @Test
    @Transactional
    void patchNonExistingChecklist() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        checklist.setId(longCount.incrementAndGet());

        // Create the Checklist
        ChecklistDTO checklistDTO = checklistMapper.toDto(checklist);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restChecklistMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, checklistDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(checklistDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Checklist in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchChecklist() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        checklist.setId(longCount.incrementAndGet());

        // Create the Checklist
        ChecklistDTO checklistDTO = checklistMapper.toDto(checklist);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restChecklistMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(checklistDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Checklist in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamChecklist() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        checklist.setId(longCount.incrementAndGet());

        // Create the Checklist
        ChecklistDTO checklistDTO = checklistMapper.toDto(checklist);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restChecklistMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(checklistDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Checklist in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteChecklist() throws Exception {
        // Initialize the database
        insertedChecklist = checklistRepository.saveAndFlush(checklist);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the checklist
        restChecklistMockMvc
            .perform(delete(ENTITY_API_URL_ID, checklist.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return checklistRepository.count();
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

    protected Checklist getPersistedChecklist(Checklist checklist) {
        return checklistRepository.findById(checklist.getId()).orElseThrow();
    }

    protected void assertPersistedChecklistToMatchAllProperties(Checklist expectedChecklist) {
        assertChecklistAllPropertiesEquals(expectedChecklist, getPersistedChecklist(expectedChecklist));
    }

    protected void assertPersistedChecklistToMatchUpdatableProperties(Checklist expectedChecklist) {
        assertChecklistAllUpdatablePropertiesEquals(expectedChecklist, getPersistedChecklist(expectedChecklist));
    }
}

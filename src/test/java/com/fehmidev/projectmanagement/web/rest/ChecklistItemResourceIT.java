package com.fehmidev.projectmanagement.web.rest;

import static com.fehmidev.projectmanagement.domain.ChecklistItemAsserts.*;
import static com.fehmidev.projectmanagement.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fehmidev.projectmanagement.IntegrationTest;
import com.fehmidev.projectmanagement.domain.ChecklistItem;
import com.fehmidev.projectmanagement.repository.ChecklistItemRepository;
import com.fehmidev.projectmanagement.service.ChecklistItemService;
import com.fehmidev.projectmanagement.service.dto.ChecklistItemDTO;
import com.fehmidev.projectmanagement.service.mapper.ChecklistItemMapper;
import jakarta.persistence.EntityManager;
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
 * Integration tests for the {@link ChecklistItemResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class ChecklistItemResourceIT {

    private static final String DEFAULT_CONTENT = "AAAAAAAAAA";
    private static final String UPDATED_CONTENT = "BBBBBBBBBB";

    private static final Boolean DEFAULT_IS_DONE = false;
    private static final Boolean UPDATED_IS_DONE = true;

    private static final Integer DEFAULT_POSITION = 1;
    private static final Integer UPDATED_POSITION = 2;

    private static final String ENTITY_API_URL = "/api/checklist-items";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private ChecklistItemRepository checklistItemRepository;

    @Mock
    private ChecklistItemRepository checklistItemRepositoryMock;

    @Autowired
    private ChecklistItemMapper checklistItemMapper;

    @Mock
    private ChecklistItemService checklistItemServiceMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restChecklistItemMockMvc;

    private ChecklistItem checklistItem;

    private ChecklistItem insertedChecklistItem;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static ChecklistItem createEntity() {
        return new ChecklistItem().content(DEFAULT_CONTENT).isDone(DEFAULT_IS_DONE).position(DEFAULT_POSITION);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static ChecklistItem createUpdatedEntity() {
        return new ChecklistItem().content(UPDATED_CONTENT).isDone(UPDATED_IS_DONE).position(UPDATED_POSITION);
    }

    @BeforeEach
    void initTest() {
        checklistItem = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedChecklistItem != null) {
            checklistItemRepository.delete(insertedChecklistItem);
            insertedChecklistItem = null;
        }
    }

    @Test
    @Transactional
    void createChecklistItem() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the ChecklistItem
        ChecklistItemDTO checklistItemDTO = checklistItemMapper.toDto(checklistItem);
        var returnedChecklistItemDTO = om.readValue(
            restChecklistItemMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(checklistItemDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            ChecklistItemDTO.class
        );

        // Validate the ChecklistItem in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedChecklistItem = checklistItemMapper.toEntity(returnedChecklistItemDTO);
        assertChecklistItemUpdatableFieldsEquals(returnedChecklistItem, getPersistedChecklistItem(returnedChecklistItem));

        insertedChecklistItem = returnedChecklistItem;
    }

    @Test
    @Transactional
    void createChecklistItemWithExistingId() throws Exception {
        // Create the ChecklistItem with an existing ID
        checklistItem.setId(1L);
        ChecklistItemDTO checklistItemDTO = checklistItemMapper.toDto(checklistItem);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restChecklistItemMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(checklistItemDTO)))
            .andExpect(status().isBadRequest());

        // Validate the ChecklistItem in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkContentIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        checklistItem.setContent(null);

        // Create the ChecklistItem, which fails.
        ChecklistItemDTO checklistItemDTO = checklistItemMapper.toDto(checklistItem);

        restChecklistItemMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(checklistItemDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkIsDoneIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        checklistItem.setIsDone(null);

        // Create the ChecklistItem, which fails.
        ChecklistItemDTO checklistItemDTO = checklistItemMapper.toDto(checklistItem);

        restChecklistItemMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(checklistItemDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllChecklistItems() throws Exception {
        // Initialize the database
        insertedChecklistItem = checklistItemRepository.saveAndFlush(checklistItem);

        // Get all the checklistItemList
        restChecklistItemMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(checklistItem.getId().intValue())))
            .andExpect(jsonPath("$.[*].content").value(hasItem(DEFAULT_CONTENT)))
            .andExpect(jsonPath("$.[*].isDone").value(hasItem(DEFAULT_IS_DONE)))
            .andExpect(jsonPath("$.[*].position").value(hasItem(DEFAULT_POSITION)));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllChecklistItemsWithEagerRelationshipsIsEnabled() throws Exception {
        when(checklistItemServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restChecklistItemMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(checklistItemServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllChecklistItemsWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(checklistItemServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restChecklistItemMockMvc.perform(get(ENTITY_API_URL + "?eagerload=false")).andExpect(status().isOk());
        verify(checklistItemRepositoryMock, times(1)).findAll(any(Pageable.class));
    }

    @Test
    @Transactional
    void getChecklistItem() throws Exception {
        // Initialize the database
        insertedChecklistItem = checklistItemRepository.saveAndFlush(checklistItem);

        // Get the checklistItem
        restChecklistItemMockMvc
            .perform(get(ENTITY_API_URL_ID, checklistItem.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(checklistItem.getId().intValue()))
            .andExpect(jsonPath("$.content").value(DEFAULT_CONTENT))
            .andExpect(jsonPath("$.isDone").value(DEFAULT_IS_DONE))
            .andExpect(jsonPath("$.position").value(DEFAULT_POSITION));
    }

    @Test
    @Transactional
    void getNonExistingChecklistItem() throws Exception {
        // Get the checklistItem
        restChecklistItemMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingChecklistItem() throws Exception {
        // Initialize the database
        insertedChecklistItem = checklistItemRepository.saveAndFlush(checklistItem);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the checklistItem
        ChecklistItem updatedChecklistItem = checklistItemRepository.findById(checklistItem.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedChecklistItem are not directly saved in db
        em.detach(updatedChecklistItem);
        updatedChecklistItem.content(UPDATED_CONTENT).isDone(UPDATED_IS_DONE).position(UPDATED_POSITION);
        ChecklistItemDTO checklistItemDTO = checklistItemMapper.toDto(updatedChecklistItem);

        restChecklistItemMockMvc
            .perform(
                put(ENTITY_API_URL_ID, checklistItemDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(checklistItemDTO))
            )
            .andExpect(status().isOk());

        // Validate the ChecklistItem in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedChecklistItemToMatchAllProperties(updatedChecklistItem);
    }

    @Test
    @Transactional
    void putNonExistingChecklistItem() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        checklistItem.setId(longCount.incrementAndGet());

        // Create the ChecklistItem
        ChecklistItemDTO checklistItemDTO = checklistItemMapper.toDto(checklistItem);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restChecklistItemMockMvc
            .perform(
                put(ENTITY_API_URL_ID, checklistItemDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(checklistItemDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ChecklistItem in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchChecklistItem() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        checklistItem.setId(longCount.incrementAndGet());

        // Create the ChecklistItem
        ChecklistItemDTO checklistItemDTO = checklistItemMapper.toDto(checklistItem);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restChecklistItemMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(checklistItemDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ChecklistItem in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamChecklistItem() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        checklistItem.setId(longCount.incrementAndGet());

        // Create the ChecklistItem
        ChecklistItemDTO checklistItemDTO = checklistItemMapper.toDto(checklistItem);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restChecklistItemMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(checklistItemDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the ChecklistItem in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateChecklistItemWithPatch() throws Exception {
        // Initialize the database
        insertedChecklistItem = checklistItemRepository.saveAndFlush(checklistItem);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the checklistItem using partial update
        ChecklistItem partialUpdatedChecklistItem = new ChecklistItem();
        partialUpdatedChecklistItem.setId(checklistItem.getId());

        partialUpdatedChecklistItem.content(UPDATED_CONTENT).isDone(UPDATED_IS_DONE);

        restChecklistItemMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedChecklistItem.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedChecklistItem))
            )
            .andExpect(status().isOk());

        // Validate the ChecklistItem in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertChecklistItemUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedChecklistItem, checklistItem),
            getPersistedChecklistItem(checklistItem)
        );
    }

    @Test
    @Transactional
    void fullUpdateChecklistItemWithPatch() throws Exception {
        // Initialize the database
        insertedChecklistItem = checklistItemRepository.saveAndFlush(checklistItem);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the checklistItem using partial update
        ChecklistItem partialUpdatedChecklistItem = new ChecklistItem();
        partialUpdatedChecklistItem.setId(checklistItem.getId());

        partialUpdatedChecklistItem.content(UPDATED_CONTENT).isDone(UPDATED_IS_DONE).position(UPDATED_POSITION);

        restChecklistItemMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedChecklistItem.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedChecklistItem))
            )
            .andExpect(status().isOk());

        // Validate the ChecklistItem in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertChecklistItemUpdatableFieldsEquals(partialUpdatedChecklistItem, getPersistedChecklistItem(partialUpdatedChecklistItem));
    }

    @Test
    @Transactional
    void patchNonExistingChecklistItem() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        checklistItem.setId(longCount.incrementAndGet());

        // Create the ChecklistItem
        ChecklistItemDTO checklistItemDTO = checklistItemMapper.toDto(checklistItem);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restChecklistItemMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, checklistItemDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(checklistItemDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ChecklistItem in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchChecklistItem() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        checklistItem.setId(longCount.incrementAndGet());

        // Create the ChecklistItem
        ChecklistItemDTO checklistItemDTO = checklistItemMapper.toDto(checklistItem);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restChecklistItemMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(checklistItemDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ChecklistItem in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamChecklistItem() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        checklistItem.setId(longCount.incrementAndGet());

        // Create the ChecklistItem
        ChecklistItemDTO checklistItemDTO = checklistItemMapper.toDto(checklistItem);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restChecklistItemMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(checklistItemDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the ChecklistItem in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteChecklistItem() throws Exception {
        // Initialize the database
        insertedChecklistItem = checklistItemRepository.saveAndFlush(checklistItem);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the checklistItem
        restChecklistItemMockMvc
            .perform(delete(ENTITY_API_URL_ID, checklistItem.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return checklistItemRepository.count();
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

    protected ChecklistItem getPersistedChecklistItem(ChecklistItem checklistItem) {
        return checklistItemRepository.findById(checklistItem.getId()).orElseThrow();
    }

    protected void assertPersistedChecklistItemToMatchAllProperties(ChecklistItem expectedChecklistItem) {
        assertChecklistItemAllPropertiesEquals(expectedChecklistItem, getPersistedChecklistItem(expectedChecklistItem));
    }

    protected void assertPersistedChecklistItemToMatchUpdatableProperties(ChecklistItem expectedChecklistItem) {
        assertChecklistItemAllUpdatablePropertiesEquals(expectedChecklistItem, getPersistedChecklistItem(expectedChecklistItem));
    }
}

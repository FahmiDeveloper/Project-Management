package com.fehmidev.projectmanagement.web.rest;

import static com.fehmidev.projectmanagement.domain.TimeEntryAsserts.*;
import static com.fehmidev.projectmanagement.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fehmidev.projectmanagement.IntegrationTest;
import com.fehmidev.projectmanagement.domain.TimeEntry;
import com.fehmidev.projectmanagement.repository.TimeEntryRepository;
import com.fehmidev.projectmanagement.service.TimeEntryService;
import com.fehmidev.projectmanagement.service.dto.TimeEntryDTO;
import com.fehmidev.projectmanagement.service.mapper.TimeEntryMapper;
import jakarta.persistence.EntityManager;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
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
 * Integration tests for the {@link TimeEntryResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class TimeEntryResourceIT {

    private static final String DEFAULT_DESCRIPTION = "AAAAAAAAAA";
    private static final String UPDATED_DESCRIPTION = "BBBBBBBBBB";

    private static final Instant DEFAULT_START_TIME = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_START_TIME = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final Instant DEFAULT_END_TIME = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_END_TIME = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final Double DEFAULT_HOURS = 1D;
    private static final Double UPDATED_HOURS = 2D;

    private static final LocalDate DEFAULT_ENTRY_DATE = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_ENTRY_DATE = LocalDate.now(ZoneId.systemDefault());

    private static final String ENTITY_API_URL = "/api/time-entries";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private TimeEntryRepository timeEntryRepository;

    @Mock
    private TimeEntryRepository timeEntryRepositoryMock;

    @Autowired
    private TimeEntryMapper timeEntryMapper;

    @Mock
    private TimeEntryService timeEntryServiceMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restTimeEntryMockMvc;

    private TimeEntry timeEntry;

    private TimeEntry insertedTimeEntry;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static TimeEntry createEntity() {
        return new TimeEntry()
            .description(DEFAULT_DESCRIPTION)
            .startTime(DEFAULT_START_TIME)
            .endTime(DEFAULT_END_TIME)
            .hours(DEFAULT_HOURS)
            .entryDate(DEFAULT_ENTRY_DATE);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static TimeEntry createUpdatedEntity() {
        return new TimeEntry()
            .description(UPDATED_DESCRIPTION)
            .startTime(UPDATED_START_TIME)
            .endTime(UPDATED_END_TIME)
            .hours(UPDATED_HOURS)
            .entryDate(UPDATED_ENTRY_DATE);
    }

    @BeforeEach
    void initTest() {
        timeEntry = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedTimeEntry != null) {
            timeEntryRepository.delete(insertedTimeEntry);
            insertedTimeEntry = null;
        }
    }

    @Test
    @Transactional
    void createTimeEntry() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the TimeEntry
        TimeEntryDTO timeEntryDTO = timeEntryMapper.toDto(timeEntry);
        var returnedTimeEntryDTO = om.readValue(
            restTimeEntryMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(timeEntryDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            TimeEntryDTO.class
        );

        // Validate the TimeEntry in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedTimeEntry = timeEntryMapper.toEntity(returnedTimeEntryDTO);
        assertTimeEntryUpdatableFieldsEquals(returnedTimeEntry, getPersistedTimeEntry(returnedTimeEntry));

        insertedTimeEntry = returnedTimeEntry;
    }

    @Test
    @Transactional
    void createTimeEntryWithExistingId() throws Exception {
        // Create the TimeEntry with an existing ID
        timeEntry.setId(1L);
        TimeEntryDTO timeEntryDTO = timeEntryMapper.toDto(timeEntry);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restTimeEntryMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(timeEntryDTO)))
            .andExpect(status().isBadRequest());

        // Validate the TimeEntry in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkStartTimeIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        timeEntry.setStartTime(null);

        // Create the TimeEntry, which fails.
        TimeEntryDTO timeEntryDTO = timeEntryMapper.toDto(timeEntry);

        restTimeEntryMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(timeEntryDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkEndTimeIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        timeEntry.setEndTime(null);

        // Create the TimeEntry, which fails.
        TimeEntryDTO timeEntryDTO = timeEntryMapper.toDto(timeEntry);

        restTimeEntryMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(timeEntryDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkHoursIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        timeEntry.setHours(null);

        // Create the TimeEntry, which fails.
        TimeEntryDTO timeEntryDTO = timeEntryMapper.toDto(timeEntry);

        restTimeEntryMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(timeEntryDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkEntryDateIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        timeEntry.setEntryDate(null);

        // Create the TimeEntry, which fails.
        TimeEntryDTO timeEntryDTO = timeEntryMapper.toDto(timeEntry);

        restTimeEntryMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(timeEntryDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllTimeEntries() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        // Get all the timeEntryList
        restTimeEntryMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(timeEntry.getId().intValue())))
            .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION)))
            .andExpect(jsonPath("$.[*].startTime").value(hasItem(DEFAULT_START_TIME.toString())))
            .andExpect(jsonPath("$.[*].endTime").value(hasItem(DEFAULT_END_TIME.toString())))
            .andExpect(jsonPath("$.[*].hours").value(hasItem(DEFAULT_HOURS)))
            .andExpect(jsonPath("$.[*].entryDate").value(hasItem(DEFAULT_ENTRY_DATE.toString())));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllTimeEntriesWithEagerRelationshipsIsEnabled() throws Exception {
        when(timeEntryServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restTimeEntryMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(timeEntryServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllTimeEntriesWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(timeEntryServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restTimeEntryMockMvc.perform(get(ENTITY_API_URL + "?eagerload=false")).andExpect(status().isOk());
        verify(timeEntryRepositoryMock, times(1)).findAll(any(Pageable.class));
    }

    @Test
    @Transactional
    void getTimeEntry() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        // Get the timeEntry
        restTimeEntryMockMvc
            .perform(get(ENTITY_API_URL_ID, timeEntry.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(timeEntry.getId().intValue()))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION))
            .andExpect(jsonPath("$.startTime").value(DEFAULT_START_TIME.toString()))
            .andExpect(jsonPath("$.endTime").value(DEFAULT_END_TIME.toString()))
            .andExpect(jsonPath("$.hours").value(DEFAULT_HOURS))
            .andExpect(jsonPath("$.entryDate").value(DEFAULT_ENTRY_DATE.toString()));
    }

    @Test
    @Transactional
    void getNonExistingTimeEntry() throws Exception {
        // Get the timeEntry
        restTimeEntryMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingTimeEntry() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the timeEntry
        TimeEntry updatedTimeEntry = timeEntryRepository.findById(timeEntry.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedTimeEntry are not directly saved in db
        em.detach(updatedTimeEntry);
        updatedTimeEntry
            .description(UPDATED_DESCRIPTION)
            .startTime(UPDATED_START_TIME)
            .endTime(UPDATED_END_TIME)
            .hours(UPDATED_HOURS)
            .entryDate(UPDATED_ENTRY_DATE);
        TimeEntryDTO timeEntryDTO = timeEntryMapper.toDto(updatedTimeEntry);

        restTimeEntryMockMvc
            .perform(
                put(ENTITY_API_URL_ID, timeEntryDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(timeEntryDTO))
            )
            .andExpect(status().isOk());

        // Validate the TimeEntry in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedTimeEntryToMatchAllProperties(updatedTimeEntry);
    }

    @Test
    @Transactional
    void putNonExistingTimeEntry() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        timeEntry.setId(longCount.incrementAndGet());

        // Create the TimeEntry
        TimeEntryDTO timeEntryDTO = timeEntryMapper.toDto(timeEntry);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restTimeEntryMockMvc
            .perform(
                put(ENTITY_API_URL_ID, timeEntryDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(timeEntryDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the TimeEntry in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchTimeEntry() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        timeEntry.setId(longCount.incrementAndGet());

        // Create the TimeEntry
        TimeEntryDTO timeEntryDTO = timeEntryMapper.toDto(timeEntry);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTimeEntryMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(timeEntryDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the TimeEntry in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamTimeEntry() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        timeEntry.setId(longCount.incrementAndGet());

        // Create the TimeEntry
        TimeEntryDTO timeEntryDTO = timeEntryMapper.toDto(timeEntry);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTimeEntryMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(timeEntryDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the TimeEntry in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateTimeEntryWithPatch() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the timeEntry using partial update
        TimeEntry partialUpdatedTimeEntry = new TimeEntry();
        partialUpdatedTimeEntry.setId(timeEntry.getId());

        partialUpdatedTimeEntry.description(UPDATED_DESCRIPTION);

        restTimeEntryMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedTimeEntry.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedTimeEntry))
            )
            .andExpect(status().isOk());

        // Validate the TimeEntry in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertTimeEntryUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedTimeEntry, timeEntry),
            getPersistedTimeEntry(timeEntry)
        );
    }

    @Test
    @Transactional
    void fullUpdateTimeEntryWithPatch() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the timeEntry using partial update
        TimeEntry partialUpdatedTimeEntry = new TimeEntry();
        partialUpdatedTimeEntry.setId(timeEntry.getId());

        partialUpdatedTimeEntry
            .description(UPDATED_DESCRIPTION)
            .startTime(UPDATED_START_TIME)
            .endTime(UPDATED_END_TIME)
            .hours(UPDATED_HOURS)
            .entryDate(UPDATED_ENTRY_DATE);

        restTimeEntryMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedTimeEntry.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedTimeEntry))
            )
            .andExpect(status().isOk());

        // Validate the TimeEntry in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertTimeEntryUpdatableFieldsEquals(partialUpdatedTimeEntry, getPersistedTimeEntry(partialUpdatedTimeEntry));
    }

    @Test
    @Transactional
    void patchNonExistingTimeEntry() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        timeEntry.setId(longCount.incrementAndGet());

        // Create the TimeEntry
        TimeEntryDTO timeEntryDTO = timeEntryMapper.toDto(timeEntry);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restTimeEntryMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, timeEntryDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(timeEntryDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the TimeEntry in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchTimeEntry() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        timeEntry.setId(longCount.incrementAndGet());

        // Create the TimeEntry
        TimeEntryDTO timeEntryDTO = timeEntryMapper.toDto(timeEntry);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTimeEntryMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(timeEntryDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the TimeEntry in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamTimeEntry() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        timeEntry.setId(longCount.incrementAndGet());

        // Create the TimeEntry
        TimeEntryDTO timeEntryDTO = timeEntryMapper.toDto(timeEntry);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTimeEntryMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(timeEntryDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the TimeEntry in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteTimeEntry() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the timeEntry
        restTimeEntryMockMvc
            .perform(delete(ENTITY_API_URL_ID, timeEntry.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return timeEntryRepository.count();
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

    protected TimeEntry getPersistedTimeEntry(TimeEntry timeEntry) {
        return timeEntryRepository.findById(timeEntry.getId()).orElseThrow();
    }

    protected void assertPersistedTimeEntryToMatchAllProperties(TimeEntry expectedTimeEntry) {
        assertTimeEntryAllPropertiesEquals(expectedTimeEntry, getPersistedTimeEntry(expectedTimeEntry));
    }

    protected void assertPersistedTimeEntryToMatchUpdatableProperties(TimeEntry expectedTimeEntry) {
        assertTimeEntryAllUpdatablePropertiesEquals(expectedTimeEntry, getPersistedTimeEntry(expectedTimeEntry));
    }
}

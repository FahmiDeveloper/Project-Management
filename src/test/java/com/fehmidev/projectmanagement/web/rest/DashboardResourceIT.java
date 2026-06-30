package com.fehmidev.projectmanagement.web.rest;

import static com.fehmidev.projectmanagement.domain.DashboardAsserts.*;
import static com.fehmidev.projectmanagement.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fehmidev.projectmanagement.IntegrationTest;
import com.fehmidev.projectmanagement.domain.Dashboard;
import com.fehmidev.projectmanagement.repository.DashboardRepository;
import com.fehmidev.projectmanagement.service.DashboardService;
import com.fehmidev.projectmanagement.service.dto.DashboardDTO;
import com.fehmidev.projectmanagement.service.mapper.DashboardMapper;
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
 * Integration tests for the {@link DashboardResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class DashboardResourceIT {

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_DESCRIPTION = "AAAAAAAAAA";
    private static final String UPDATED_DESCRIPTION = "BBBBBBBBBB";

    private static final String DEFAULT_LAYOUT = "AAAAAAAAAA";
    private static final String UPDATED_LAYOUT = "BBBBBBBBBB";

    private static final String DEFAULT_CONFIG = "AAAAAAAAAA";
    private static final String UPDATED_CONFIG = "BBBBBBBBBB";

    private static final Boolean DEFAULT_IS_DEFAULT = false;
    private static final Boolean UPDATED_IS_DEFAULT = true;

    private static final Instant DEFAULT_CREATED_DATE = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_CREATED_DATE = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final Instant DEFAULT_UPDATED_DATE = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_UPDATED_DATE = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String ENTITY_API_URL = "/api/dashboards";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private DashboardRepository dashboardRepository;

    @Mock
    private DashboardRepository dashboardRepositoryMock;

    @Autowired
    private DashboardMapper dashboardMapper;

    @Mock
    private DashboardService dashboardServiceMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restDashboardMockMvc;

    private Dashboard dashboard;

    private Dashboard insertedDashboard;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Dashboard createEntity() {
        return new Dashboard()
            .name(DEFAULT_NAME)
            .description(DEFAULT_DESCRIPTION)
            .layout(DEFAULT_LAYOUT)
            .config(DEFAULT_CONFIG)
            .isDefault(DEFAULT_IS_DEFAULT)
            .createdDate(DEFAULT_CREATED_DATE)
            .updatedDate(DEFAULT_UPDATED_DATE);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Dashboard createUpdatedEntity() {
        return new Dashboard()
            .name(UPDATED_NAME)
            .description(UPDATED_DESCRIPTION)
            .layout(UPDATED_LAYOUT)
            .config(UPDATED_CONFIG)
            .isDefault(UPDATED_IS_DEFAULT)
            .createdDate(UPDATED_CREATED_DATE)
            .updatedDate(UPDATED_UPDATED_DATE);
    }

    @BeforeEach
    void initTest() {
        dashboard = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedDashboard != null) {
            dashboardRepository.delete(insertedDashboard);
            insertedDashboard = null;
        }
    }

    @Test
    @Transactional
    void createDashboard() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the Dashboard
        DashboardDTO dashboardDTO = dashboardMapper.toDto(dashboard);
        var returnedDashboardDTO = om.readValue(
            restDashboardMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(dashboardDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            DashboardDTO.class
        );

        // Validate the Dashboard in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedDashboard = dashboardMapper.toEntity(returnedDashboardDTO);
        assertDashboardUpdatableFieldsEquals(returnedDashboard, getPersistedDashboard(returnedDashboard));

        insertedDashboard = returnedDashboard;
    }

    @Test
    @Transactional
    void createDashboardWithExistingId() throws Exception {
        // Create the Dashboard with an existing ID
        dashboard.setId(1L);
        DashboardDTO dashboardDTO = dashboardMapper.toDto(dashboard);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restDashboardMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(dashboardDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Dashboard in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkNameIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        dashboard.setName(null);

        // Create the Dashboard, which fails.
        DashboardDTO dashboardDTO = dashboardMapper.toDto(dashboard);

        restDashboardMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(dashboardDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkLayoutIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        dashboard.setLayout(null);

        // Create the Dashboard, which fails.
        DashboardDTO dashboardDTO = dashboardMapper.toDto(dashboard);

        restDashboardMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(dashboardDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkIsDefaultIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        dashboard.setIsDefault(null);

        // Create the Dashboard, which fails.
        DashboardDTO dashboardDTO = dashboardMapper.toDto(dashboard);

        restDashboardMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(dashboardDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkCreatedDateIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        dashboard.setCreatedDate(null);

        // Create the Dashboard, which fails.
        DashboardDTO dashboardDTO = dashboardMapper.toDto(dashboard);

        restDashboardMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(dashboardDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllDashboards() throws Exception {
        // Initialize the database
        insertedDashboard = dashboardRepository.saveAndFlush(dashboard);

        // Get all the dashboardList
        restDashboardMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(dashboard.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION)))
            .andExpect(jsonPath("$.[*].layout").value(hasItem(DEFAULT_LAYOUT)))
            .andExpect(jsonPath("$.[*].config").value(hasItem(DEFAULT_CONFIG)))
            .andExpect(jsonPath("$.[*].isDefault").value(hasItem(DEFAULT_IS_DEFAULT)))
            .andExpect(jsonPath("$.[*].createdDate").value(hasItem(DEFAULT_CREATED_DATE.toString())))
            .andExpect(jsonPath("$.[*].updatedDate").value(hasItem(DEFAULT_UPDATED_DATE.toString())));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllDashboardsWithEagerRelationshipsIsEnabled() throws Exception {
        when(dashboardServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restDashboardMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(dashboardServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllDashboardsWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(dashboardServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restDashboardMockMvc.perform(get(ENTITY_API_URL + "?eagerload=false")).andExpect(status().isOk());
        verify(dashboardRepositoryMock, times(1)).findAll(any(Pageable.class));
    }

    @Test
    @Transactional
    void getDashboard() throws Exception {
        // Initialize the database
        insertedDashboard = dashboardRepository.saveAndFlush(dashboard);

        // Get the dashboard
        restDashboardMockMvc
            .perform(get(ENTITY_API_URL_ID, dashboard.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(dashboard.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION))
            .andExpect(jsonPath("$.layout").value(DEFAULT_LAYOUT))
            .andExpect(jsonPath("$.config").value(DEFAULT_CONFIG))
            .andExpect(jsonPath("$.isDefault").value(DEFAULT_IS_DEFAULT))
            .andExpect(jsonPath("$.createdDate").value(DEFAULT_CREATED_DATE.toString()))
            .andExpect(jsonPath("$.updatedDate").value(DEFAULT_UPDATED_DATE.toString()));
    }

    @Test
    @Transactional
    void getNonExistingDashboard() throws Exception {
        // Get the dashboard
        restDashboardMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingDashboard() throws Exception {
        // Initialize the database
        insertedDashboard = dashboardRepository.saveAndFlush(dashboard);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the dashboard
        Dashboard updatedDashboard = dashboardRepository.findById(dashboard.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedDashboard are not directly saved in db
        em.detach(updatedDashboard);
        updatedDashboard
            .name(UPDATED_NAME)
            .description(UPDATED_DESCRIPTION)
            .layout(UPDATED_LAYOUT)
            .config(UPDATED_CONFIG)
            .isDefault(UPDATED_IS_DEFAULT)
            .createdDate(UPDATED_CREATED_DATE)
            .updatedDate(UPDATED_UPDATED_DATE);
        DashboardDTO dashboardDTO = dashboardMapper.toDto(updatedDashboard);

        restDashboardMockMvc
            .perform(
                put(ENTITY_API_URL_ID, dashboardDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(dashboardDTO))
            )
            .andExpect(status().isOk());

        // Validate the Dashboard in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedDashboardToMatchAllProperties(updatedDashboard);
    }

    @Test
    @Transactional
    void putNonExistingDashboard() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        dashboard.setId(longCount.incrementAndGet());

        // Create the Dashboard
        DashboardDTO dashboardDTO = dashboardMapper.toDto(dashboard);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restDashboardMockMvc
            .perform(
                put(ENTITY_API_URL_ID, dashboardDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(dashboardDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Dashboard in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchDashboard() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        dashboard.setId(longCount.incrementAndGet());

        // Create the Dashboard
        DashboardDTO dashboardDTO = dashboardMapper.toDto(dashboard);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDashboardMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(dashboardDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Dashboard in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamDashboard() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        dashboard.setId(longCount.incrementAndGet());

        // Create the Dashboard
        DashboardDTO dashboardDTO = dashboardMapper.toDto(dashboard);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDashboardMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(dashboardDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Dashboard in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateDashboardWithPatch() throws Exception {
        // Initialize the database
        insertedDashboard = dashboardRepository.saveAndFlush(dashboard);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the dashboard using partial update
        Dashboard partialUpdatedDashboard = new Dashboard();
        partialUpdatedDashboard.setId(dashboard.getId());

        partialUpdatedDashboard
            .name(UPDATED_NAME)
            .description(UPDATED_DESCRIPTION)
            .layout(UPDATED_LAYOUT)
            .config(UPDATED_CONFIG)
            .isDefault(UPDATED_IS_DEFAULT)
            .createdDate(UPDATED_CREATED_DATE)
            .updatedDate(UPDATED_UPDATED_DATE);

        restDashboardMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedDashboard.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedDashboard))
            )
            .andExpect(status().isOk());

        // Validate the Dashboard in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertDashboardUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedDashboard, dashboard),
            getPersistedDashboard(dashboard)
        );
    }

    @Test
    @Transactional
    void fullUpdateDashboardWithPatch() throws Exception {
        // Initialize the database
        insertedDashboard = dashboardRepository.saveAndFlush(dashboard);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the dashboard using partial update
        Dashboard partialUpdatedDashboard = new Dashboard();
        partialUpdatedDashboard.setId(dashboard.getId());

        partialUpdatedDashboard
            .name(UPDATED_NAME)
            .description(UPDATED_DESCRIPTION)
            .layout(UPDATED_LAYOUT)
            .config(UPDATED_CONFIG)
            .isDefault(UPDATED_IS_DEFAULT)
            .createdDate(UPDATED_CREATED_DATE)
            .updatedDate(UPDATED_UPDATED_DATE);

        restDashboardMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedDashboard.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedDashboard))
            )
            .andExpect(status().isOk());

        // Validate the Dashboard in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertDashboardUpdatableFieldsEquals(partialUpdatedDashboard, getPersistedDashboard(partialUpdatedDashboard));
    }

    @Test
    @Transactional
    void patchNonExistingDashboard() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        dashboard.setId(longCount.incrementAndGet());

        // Create the Dashboard
        DashboardDTO dashboardDTO = dashboardMapper.toDto(dashboard);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restDashboardMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, dashboardDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(dashboardDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Dashboard in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchDashboard() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        dashboard.setId(longCount.incrementAndGet());

        // Create the Dashboard
        DashboardDTO dashboardDTO = dashboardMapper.toDto(dashboard);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDashboardMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(dashboardDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Dashboard in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamDashboard() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        dashboard.setId(longCount.incrementAndGet());

        // Create the Dashboard
        DashboardDTO dashboardDTO = dashboardMapper.toDto(dashboard);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDashboardMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(dashboardDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Dashboard in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteDashboard() throws Exception {
        // Initialize the database
        insertedDashboard = dashboardRepository.saveAndFlush(dashboard);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the dashboard
        restDashboardMockMvc
            .perform(delete(ENTITY_API_URL_ID, dashboard.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return dashboardRepository.count();
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

    protected Dashboard getPersistedDashboard(Dashboard dashboard) {
        return dashboardRepository.findById(dashboard.getId()).orElseThrow();
    }

    protected void assertPersistedDashboardToMatchAllProperties(Dashboard expectedDashboard) {
        assertDashboardAllPropertiesEquals(expectedDashboard, getPersistedDashboard(expectedDashboard));
    }

    protected void assertPersistedDashboardToMatchUpdatableProperties(Dashboard expectedDashboard) {
        assertDashboardAllUpdatablePropertiesEquals(expectedDashboard, getPersistedDashboard(expectedDashboard));
    }
}

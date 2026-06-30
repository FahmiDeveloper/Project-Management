package com.fehmidev.projectmanagement.service;

import com.fehmidev.projectmanagement.domain.Dashboard;
import com.fehmidev.projectmanagement.repository.DashboardRepository;
import com.fehmidev.projectmanagement.service.dto.DashboardDTO;
import com.fehmidev.projectmanagement.service.mapper.DashboardMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.fehmidev.projectmanagement.domain.Dashboard}.
 */
@Service
@Transactional
public class DashboardService {

    private static final Logger LOG = LoggerFactory.getLogger(DashboardService.class);

    private final DashboardRepository dashboardRepository;

    private final DashboardMapper dashboardMapper;

    public DashboardService(DashboardRepository dashboardRepository, DashboardMapper dashboardMapper) {
        this.dashboardRepository = dashboardRepository;
        this.dashboardMapper = dashboardMapper;
    }

    /**
     * Save a dashboard.
     *
     * @param dashboardDTO the entity to save.
     * @return the persisted entity.
     */
    public DashboardDTO save(DashboardDTO dashboardDTO) {
        LOG.debug("Request to save Dashboard : {}", dashboardDTO);
        Dashboard dashboard = dashboardMapper.toEntity(dashboardDTO);
        dashboard = dashboardRepository.save(dashboard);
        return dashboardMapper.toDto(dashboard);
    }

    /**
     * Update a dashboard.
     *
     * @param dashboardDTO the entity to save.
     * @return the persisted entity.
     */
    public DashboardDTO update(DashboardDTO dashboardDTO) {
        LOG.debug("Request to update Dashboard : {}", dashboardDTO);
        Dashboard dashboard = dashboardMapper.toEntity(dashboardDTO);
        dashboard = dashboardRepository.save(dashboard);
        return dashboardMapper.toDto(dashboard);
    }

    /**
     * Partially update a dashboard.
     *
     * @param dashboardDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<DashboardDTO> partialUpdate(DashboardDTO dashboardDTO) {
        LOG.debug("Request to partially update Dashboard : {}", dashboardDTO);

        return dashboardRepository
            .findById(dashboardDTO.getId())
            .map(existingDashboard -> {
                dashboardMapper.partialUpdate(existingDashboard, dashboardDTO);

                return existingDashboard;
            })
            .map(dashboardRepository::save)
            .map(dashboardMapper::toDto);
    }

    /**
     * Get all the dashboards.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<DashboardDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all Dashboards");
        return dashboardRepository.findAll(pageable).map(dashboardMapper::toDto);
    }

    /**
     * Get all the dashboards with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<DashboardDTO> findAllWithEagerRelationships(Pageable pageable) {
        return dashboardRepository.findAllWithEagerRelationships(pageable).map(dashboardMapper::toDto);
    }

    /**
     * Get one dashboard by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<DashboardDTO> findOne(Long id) {
        LOG.debug("Request to get Dashboard : {}", id);
        return dashboardRepository.findOneWithEagerRelationships(id).map(dashboardMapper::toDto);
    }

    /**
     * Delete the dashboard by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete Dashboard : {}", id);
        dashboardRepository.deleteById(id);
    }
}

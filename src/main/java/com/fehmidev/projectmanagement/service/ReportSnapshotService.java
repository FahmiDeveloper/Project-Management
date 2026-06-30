package com.fehmidev.projectmanagement.service;

import com.fehmidev.projectmanagement.domain.ReportSnapshot;
import com.fehmidev.projectmanagement.repository.ReportSnapshotRepository;
import com.fehmidev.projectmanagement.service.dto.ReportSnapshotDTO;
import com.fehmidev.projectmanagement.service.mapper.ReportSnapshotMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.fehmidev.projectmanagement.domain.ReportSnapshot}.
 */
@Service
@Transactional
public class ReportSnapshotService {

    private static final Logger LOG = LoggerFactory.getLogger(ReportSnapshotService.class);

    private final ReportSnapshotRepository reportSnapshotRepository;

    private final ReportSnapshotMapper reportSnapshotMapper;

    public ReportSnapshotService(ReportSnapshotRepository reportSnapshotRepository, ReportSnapshotMapper reportSnapshotMapper) {
        this.reportSnapshotRepository = reportSnapshotRepository;
        this.reportSnapshotMapper = reportSnapshotMapper;
    }

    /**
     * Save a reportSnapshot.
     *
     * @param reportSnapshotDTO the entity to save.
     * @return the persisted entity.
     */
    public ReportSnapshotDTO save(ReportSnapshotDTO reportSnapshotDTO) {
        LOG.debug("Request to save ReportSnapshot : {}", reportSnapshotDTO);
        ReportSnapshot reportSnapshot = reportSnapshotMapper.toEntity(reportSnapshotDTO);
        reportSnapshot = reportSnapshotRepository.save(reportSnapshot);
        return reportSnapshotMapper.toDto(reportSnapshot);
    }

    /**
     * Update a reportSnapshot.
     *
     * @param reportSnapshotDTO the entity to save.
     * @return the persisted entity.
     */
    public ReportSnapshotDTO update(ReportSnapshotDTO reportSnapshotDTO) {
        LOG.debug("Request to update ReportSnapshot : {}", reportSnapshotDTO);
        ReportSnapshot reportSnapshot = reportSnapshotMapper.toEntity(reportSnapshotDTO);
        reportSnapshot = reportSnapshotRepository.save(reportSnapshot);
        return reportSnapshotMapper.toDto(reportSnapshot);
    }

    /**
     * Partially update a reportSnapshot.
     *
     * @param reportSnapshotDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<ReportSnapshotDTO> partialUpdate(ReportSnapshotDTO reportSnapshotDTO) {
        LOG.debug("Request to partially update ReportSnapshot : {}", reportSnapshotDTO);

        return reportSnapshotRepository
            .findById(reportSnapshotDTO.getId())
            .map(existingReportSnapshot -> {
                reportSnapshotMapper.partialUpdate(existingReportSnapshot, reportSnapshotDTO);

                return existingReportSnapshot;
            })
            .map(reportSnapshotRepository::save)
            .map(reportSnapshotMapper::toDto);
    }

    /**
     * Get all the reportSnapshots.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<ReportSnapshotDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all ReportSnapshots");
        return reportSnapshotRepository.findAll(pageable).map(reportSnapshotMapper::toDto);
    }

    /**
     * Get all the reportSnapshots with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<ReportSnapshotDTO> findAllWithEagerRelationships(Pageable pageable) {
        return reportSnapshotRepository.findAllWithEagerRelationships(pageable).map(reportSnapshotMapper::toDto);
    }

    /**
     * Get one reportSnapshot by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<ReportSnapshotDTO> findOne(Long id) {
        LOG.debug("Request to get ReportSnapshot : {}", id);
        return reportSnapshotRepository.findOneWithEagerRelationships(id).map(reportSnapshotMapper::toDto);
    }

    /**
     * Delete the reportSnapshot by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete ReportSnapshot : {}", id);
        reportSnapshotRepository.deleteById(id);
    }
}

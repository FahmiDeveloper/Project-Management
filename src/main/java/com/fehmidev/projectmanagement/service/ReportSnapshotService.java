package com.fehmidev.projectmanagement.service;

import com.fehmidev.projectmanagement.domain.ReportSnapshot;
import com.fehmidev.projectmanagement.repository.ReportSnapshotRepository;
import com.fehmidev.projectmanagement.repository.ReportSnapshotSpecification;
import com.fehmidev.projectmanagement.service.dto.ReportSnapshotDTO;
import com.fehmidev.projectmanagement.service.mapper.ReportSnapshotMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
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

    public ReportSnapshotDTO save(ReportSnapshotDTO reportSnapshotDTO) {
        LOG.debug("Request to save ReportSnapshot : {}", reportSnapshotDTO);
        ReportSnapshot reportSnapshot = reportSnapshotMapper.toEntity(reportSnapshotDTO);
        reportSnapshot = reportSnapshotRepository.save(reportSnapshot);
        return reportSnapshotMapper.toDto(reportSnapshot);
    }

    public ReportSnapshotDTO update(ReportSnapshotDTO reportSnapshotDTO) {
        LOG.debug("Request to update ReportSnapshot : {}", reportSnapshotDTO);
        ReportSnapshot reportSnapshot = reportSnapshotMapper.toEntity(reportSnapshotDTO);
        reportSnapshot = reportSnapshotRepository.save(reportSnapshot);
        return reportSnapshotMapper.toDto(reportSnapshot);
    }

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

    @Transactional(readOnly = true)
    public Page<ReportSnapshotDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all ReportSnapshots");
        return reportSnapshotRepository.findAll(pageable).map(reportSnapshotMapper::toDto);
    }

    // NEW: filtered
    @Transactional(readOnly = true)
    public Page<ReportSnapshotDTO> findAll(String name, Long projectId, Pageable pageable) {
        LOG.debug("Request to get all ReportSnapshots filtered by name: {}, projectId: {}", name, projectId);
        Specification<ReportSnapshot> spec = ReportSnapshotSpecification.withFilters(name, projectId);
        return reportSnapshotRepository.findAll(spec, pageable).map(reportSnapshotMapper::toDto);
    }

    public Page<ReportSnapshotDTO> findAllWithEagerRelationships(Pageable pageable) {
        return findAll(null, null, pageable);
    }

    // NEW: eager, filtered
    public Page<ReportSnapshotDTO> findAllWithEagerRelationships(String name, Long projectId, Pageable pageable) {
        LOG.debug("Request to get all ReportSnapshots (eager) filtered by name: {}, projectId: {}", name, projectId);
        return findAll(name, projectId, pageable);
    }

    @Transactional(readOnly = true)
    public Optional<ReportSnapshotDTO> findOne(Long id) {
        LOG.debug("Request to get ReportSnapshot : {}", id);
        return reportSnapshotRepository.findOneWithEagerRelationships(id).map(reportSnapshotMapper::toDto);
    }

    public void delete(Long id) {
        LOG.debug("Request to delete ReportSnapshot : {}", id);
        reportSnapshotRepository.deleteById(id);
    }
}

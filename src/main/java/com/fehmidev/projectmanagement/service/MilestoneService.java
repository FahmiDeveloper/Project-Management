package com.fehmidev.projectmanagement.service;

import com.fehmidev.projectmanagement.domain.Milestone;
import com.fehmidev.projectmanagement.domain.enumeration.MilestoneStatus;
import com.fehmidev.projectmanagement.repository.MilestoneRepository;
import com.fehmidev.projectmanagement.repository.MilestoneSpecification;
import com.fehmidev.projectmanagement.service.dto.MilestoneDTO;
import com.fehmidev.projectmanagement.service.mapper.MilestoneMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.fehmidev.projectmanagement.domain.Milestone}.
 */
@Service
@Transactional
public class MilestoneService {

    private static final Logger LOG = LoggerFactory.getLogger(MilestoneService.class);

    private final MilestoneRepository milestoneRepository;

    private final MilestoneMapper milestoneMapper;

    public MilestoneService(MilestoneRepository milestoneRepository, MilestoneMapper milestoneMapper) {
        this.milestoneRepository = milestoneRepository;
        this.milestoneMapper = milestoneMapper;
    }

    public MilestoneDTO save(MilestoneDTO milestoneDTO) {
        LOG.debug("Request to save Milestone : {}", milestoneDTO);
        Milestone milestone = milestoneMapper.toEntity(milestoneDTO);
        milestone = milestoneRepository.save(milestone);
        return milestoneMapper.toDto(milestone);
    }

    public MilestoneDTO update(MilestoneDTO milestoneDTO) {
        LOG.debug("Request to update Milestone : {}", milestoneDTO);
        Milestone milestone = milestoneMapper.toEntity(milestoneDTO);
        milestone = milestoneRepository.save(milestone);
        return milestoneMapper.toDto(milestone);
    }

    public Optional<MilestoneDTO> partialUpdate(MilestoneDTO milestoneDTO) {
        LOG.debug("Request to partially update Milestone : {}", milestoneDTO);

        return milestoneRepository
            .findById(milestoneDTO.getId())
            .map(existingMilestone -> {
                milestoneMapper.partialUpdate(existingMilestone, milestoneDTO);

                return existingMilestone;
            })
            .map(milestoneRepository::save)
            .map(milestoneMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Page<MilestoneDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all Milestones");
        return milestoneRepository.findAll(pageable).map(milestoneMapper::toDto);
    }

    // NEW: filtered
    @Transactional(readOnly = true)
    public Page<MilestoneDTO> findAll(String title, MilestoneStatus status, Long projectId, Pageable pageable) {
        LOG.debug("Request to get all Milestones filtered by title: {}, status: {}, projectId: {}", title, status, projectId);
        Specification<Milestone> spec = MilestoneSpecification.withFilters(title, status, projectId);
        return milestoneRepository.findAll(spec, pageable).map(milestoneMapper::toDto);
    }

    public Page<MilestoneDTO> findAllWithEagerRelationships(Pageable pageable) {
        return findAll(null, null, null, pageable);
    }

    // NEW: eager, filtered
    public Page<MilestoneDTO> findAllWithEagerRelationships(String title, MilestoneStatus status, Long projectId, Pageable pageable) {
        LOG.debug("Request to get all Milestones (eager) filtered by title: {}, status: {}, projectId: {}", title, status, projectId);
        return findAll(title, status, projectId, pageable);
    }

    @Transactional(readOnly = true)
    public Optional<MilestoneDTO> findOne(Long id) {
        LOG.debug("Request to get Milestone : {}", id);
        return milestoneRepository.findOneWithEagerRelationships(id).map(milestoneMapper::toDto);
    }

    public void delete(Long id) {
        LOG.debug("Request to delete Milestone : {}", id);
        milestoneRepository.deleteById(id);
    }
}

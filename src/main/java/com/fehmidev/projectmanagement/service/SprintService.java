package com.fehmidev.projectmanagement.service;

import com.fehmidev.projectmanagement.domain.Sprint;
import com.fehmidev.projectmanagement.domain.enumeration.SprintStatus;
import com.fehmidev.projectmanagement.repository.SprintRepository;
import com.fehmidev.projectmanagement.repository.SprintSpecification;
import com.fehmidev.projectmanagement.service.dto.SprintDTO;
import com.fehmidev.projectmanagement.service.mapper.SprintMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.fehmidev.projectmanagement.domain.Sprint}.
 */
@Service
@Transactional
public class SprintService {

    private static final Logger LOG = LoggerFactory.getLogger(SprintService.class);

    private final SprintRepository sprintRepository;

    private final SprintMapper sprintMapper;

    public SprintService(SprintRepository sprintRepository, SprintMapper sprintMapper) {
        this.sprintRepository = sprintRepository;
        this.sprintMapper = sprintMapper;
    }

    public SprintDTO save(SprintDTO sprintDTO) {
        LOG.debug("Request to save Sprint : {}", sprintDTO);
        Sprint sprint = sprintMapper.toEntity(sprintDTO);
        sprint = sprintRepository.save(sprint);
        return sprintMapper.toDto(sprint);
    }

    public SprintDTO update(SprintDTO sprintDTO) {
        LOG.debug("Request to update Sprint : {}", sprintDTO);
        Sprint sprint = sprintMapper.toEntity(sprintDTO);
        sprint = sprintRepository.save(sprint);
        return sprintMapper.toDto(sprint);
    }

    public Optional<SprintDTO> partialUpdate(SprintDTO sprintDTO) {
        LOG.debug("Request to partially update Sprint : {}", sprintDTO);

        return sprintRepository
            .findById(sprintDTO.getId())
            .map(existingSprint -> {
                sprintMapper.partialUpdate(existingSprint, sprintDTO);

                return existingSprint;
            })
            .map(sprintRepository::save)
            .map(sprintMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Page<SprintDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all Sprints");
        return sprintRepository.findAll(pageable).map(sprintMapper::toDto);
    }

    // NEW: filtered
    @Transactional(readOnly = true)
    public Page<SprintDTO> findAll(String name, SprintStatus status, Long projectId, Pageable pageable) {
        LOG.debug("Request to get all Sprints filtered by name: {}, status: {}, projectId: {}", name, status, projectId);
        Specification<Sprint> spec = SprintSpecification.withFilters(name, status, projectId);
        return sprintRepository.findAll(spec, pageable).map(sprintMapper::toDto);
    }

    public Page<SprintDTO> findAllWithEagerRelationships(Pageable pageable) {
        return findAll(null, null, null, pageable);
    }

    // NEW: eager, filtered
    public Page<SprintDTO> findAllWithEagerRelationships(String name, SprintStatus status, Long projectId, Pageable pageable) {
        LOG.debug("Request to get all Sprints (eager) filtered by name: {}, status: {}, projectId: {}", name, status, projectId);
        return findAll(name, status, projectId, pageable);
    }

    @Transactional(readOnly = true)
    public Optional<SprintDTO> findOne(Long id) {
        LOG.debug("Request to get Sprint : {}", id);
        return sprintRepository.findOneWithEagerRelationships(id).map(sprintMapper::toDto);
    }

    public void delete(Long id) {
        LOG.debug("Request to delete Sprint : {}", id);
        sprintRepository.deleteById(id);
    }
}

package com.fehmidev.projectmanagement.service;

import com.fehmidev.projectmanagement.domain.Checklist;
import com.fehmidev.projectmanagement.repository.ChecklistRepository;
import com.fehmidev.projectmanagement.repository.ChecklistSpecification;
import com.fehmidev.projectmanagement.service.dto.ChecklistDTO;
import com.fehmidev.projectmanagement.service.mapper.ChecklistMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.fehmidev.projectmanagement.domain.Checklist}.
 */
@Service
@Transactional
public class ChecklistService {

    private static final Logger LOG = LoggerFactory.getLogger(ChecklistService.class);

    private final ChecklistRepository checklistRepository;

    private final ChecklistMapper checklistMapper;

    public ChecklistService(ChecklistRepository checklistRepository, ChecklistMapper checklistMapper) {
        this.checklistRepository = checklistRepository;
        this.checklistMapper = checklistMapper;
    }

    public ChecklistDTO save(ChecklistDTO checklistDTO) {
        LOG.debug("Request to save Checklist : {}", checklistDTO);
        Checklist checklist = checklistMapper.toEntity(checklistDTO);
        checklist = checklistRepository.save(checklist);
        return checklistMapper.toDto(checklist);
    }

    public ChecklistDTO update(ChecklistDTO checklistDTO) {
        LOG.debug("Request to update Checklist : {}", checklistDTO);
        Checklist checklist = checklistMapper.toEntity(checklistDTO);
        checklist = checklistRepository.save(checklist);
        return checklistMapper.toDto(checklist);
    }

    public Optional<ChecklistDTO> partialUpdate(ChecklistDTO checklistDTO) {
        LOG.debug("Request to partially update Checklist : {}", checklistDTO);

        return checklistRepository
            .findById(checklistDTO.getId())
            .map(existingChecklist -> {
                checklistMapper.partialUpdate(existingChecklist, checklistDTO);

                return existingChecklist;
            })
            .map(checklistRepository::save)
            .map(checklistMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Page<ChecklistDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all Checklists");
        return checklistRepository.findAll(pageable).map(checklistMapper::toDto);
    }

    // NEW: filtered
    @Transactional(readOnly = true)
    public Page<ChecklistDTO> findAll(String title, Long taskId, Pageable pageable) {
        LOG.debug("Request to get all Checklists filtered by title: {}, taskId: {}", title, taskId);
        Specification<Checklist> spec = ChecklistSpecification.withFilters(title, taskId);
        return checklistRepository.findAll(spec, pageable).map(checklistMapper::toDto);
    }

    public Page<ChecklistDTO> findAllWithEagerRelationships(Pageable pageable) {
        return findAll(null, null, pageable);
    }

    // NEW: eager, filtered
    public Page<ChecklistDTO> findAllWithEagerRelationships(String title, Long taskId, Pageable pageable) {
        LOG.debug("Request to get all Checklists (eager) filtered by title: {}, taskId: {}", title, taskId);
        return findAll(title, taskId, pageable);
    }

    @Transactional(readOnly = true)
    public Optional<ChecklistDTO> findOne(Long id) {
        LOG.debug("Request to get Checklist : {}", id);
        return checklistRepository.findOneWithEagerRelationships(id).map(checklistMapper::toDto);
    }

    public void delete(Long id) {
        LOG.debug("Request to delete Checklist : {}", id);
        checklistRepository.deleteById(id);
    }
}

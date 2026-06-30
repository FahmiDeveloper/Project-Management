package com.fehmidev.projectmanagement.service;

import com.fehmidev.projectmanagement.domain.Checklist;
import com.fehmidev.projectmanagement.repository.ChecklistRepository;
import com.fehmidev.projectmanagement.service.dto.ChecklistDTO;
import com.fehmidev.projectmanagement.service.mapper.ChecklistMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    /**
     * Save a checklist.
     *
     * @param checklistDTO the entity to save.
     * @return the persisted entity.
     */
    public ChecklistDTO save(ChecklistDTO checklistDTO) {
        LOG.debug("Request to save Checklist : {}", checklistDTO);
        Checklist checklist = checklistMapper.toEntity(checklistDTO);
        checklist = checklistRepository.save(checklist);
        return checklistMapper.toDto(checklist);
    }

    /**
     * Update a checklist.
     *
     * @param checklistDTO the entity to save.
     * @return the persisted entity.
     */
    public ChecklistDTO update(ChecklistDTO checklistDTO) {
        LOG.debug("Request to update Checklist : {}", checklistDTO);
        Checklist checklist = checklistMapper.toEntity(checklistDTO);
        checklist = checklistRepository.save(checklist);
        return checklistMapper.toDto(checklist);
    }

    /**
     * Partially update a checklist.
     *
     * @param checklistDTO the entity to update partially.
     * @return the persisted entity.
     */
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

    /**
     * Get all the checklists.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<ChecklistDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all Checklists");
        return checklistRepository.findAll(pageable).map(checklistMapper::toDto);
    }

    /**
     * Get all the checklists with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<ChecklistDTO> findAllWithEagerRelationships(Pageable pageable) {
        return checklistRepository.findAllWithEagerRelationships(pageable).map(checklistMapper::toDto);
    }

    /**
     * Get one checklist by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<ChecklistDTO> findOne(Long id) {
        LOG.debug("Request to get Checklist : {}", id);
        return checklistRepository.findOneWithEagerRelationships(id).map(checklistMapper::toDto);
    }

    /**
     * Delete the checklist by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete Checklist : {}", id);
        checklistRepository.deleteById(id);
    }
}

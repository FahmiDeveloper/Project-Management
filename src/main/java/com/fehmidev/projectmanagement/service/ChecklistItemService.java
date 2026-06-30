package com.fehmidev.projectmanagement.service;

import com.fehmidev.projectmanagement.domain.ChecklistItem;
import com.fehmidev.projectmanagement.repository.ChecklistItemRepository;
import com.fehmidev.projectmanagement.service.dto.ChecklistItemDTO;
import com.fehmidev.projectmanagement.service.mapper.ChecklistItemMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.fehmidev.projectmanagement.domain.ChecklistItem}.
 */
@Service
@Transactional
public class ChecklistItemService {

    private static final Logger LOG = LoggerFactory.getLogger(ChecklistItemService.class);

    private final ChecklistItemRepository checklistItemRepository;

    private final ChecklistItemMapper checklistItemMapper;

    public ChecklistItemService(ChecklistItemRepository checklistItemRepository, ChecklistItemMapper checklistItemMapper) {
        this.checklistItemRepository = checklistItemRepository;
        this.checklistItemMapper = checklistItemMapper;
    }

    /**
     * Save a checklistItem.
     *
     * @param checklistItemDTO the entity to save.
     * @return the persisted entity.
     */
    public ChecklistItemDTO save(ChecklistItemDTO checklistItemDTO) {
        LOG.debug("Request to save ChecklistItem : {}", checklistItemDTO);
        ChecklistItem checklistItem = checklistItemMapper.toEntity(checklistItemDTO);
        checklistItem = checklistItemRepository.save(checklistItem);
        return checklistItemMapper.toDto(checklistItem);
    }

    /**
     * Update a checklistItem.
     *
     * @param checklistItemDTO the entity to save.
     * @return the persisted entity.
     */
    public ChecklistItemDTO update(ChecklistItemDTO checklistItemDTO) {
        LOG.debug("Request to update ChecklistItem : {}", checklistItemDTO);
        ChecklistItem checklistItem = checklistItemMapper.toEntity(checklistItemDTO);
        checklistItem = checklistItemRepository.save(checklistItem);
        return checklistItemMapper.toDto(checklistItem);
    }

    /**
     * Partially update a checklistItem.
     *
     * @param checklistItemDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<ChecklistItemDTO> partialUpdate(ChecklistItemDTO checklistItemDTO) {
        LOG.debug("Request to partially update ChecklistItem : {}", checklistItemDTO);

        return checklistItemRepository
            .findById(checklistItemDTO.getId())
            .map(existingChecklistItem -> {
                checklistItemMapper.partialUpdate(existingChecklistItem, checklistItemDTO);

                return existingChecklistItem;
            })
            .map(checklistItemRepository::save)
            .map(checklistItemMapper::toDto);
    }

    /**
     * Get all the checklistItems.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<ChecklistItemDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all ChecklistItems");
        return checklistItemRepository.findAll(pageable).map(checklistItemMapper::toDto);
    }

    /**
     * Get all the checklistItems with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<ChecklistItemDTO> findAllWithEagerRelationships(Pageable pageable) {
        return checklistItemRepository.findAllWithEagerRelationships(pageable).map(checklistItemMapper::toDto);
    }

    /**
     * Get one checklistItem by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<ChecklistItemDTO> findOne(Long id) {
        LOG.debug("Request to get ChecklistItem : {}", id);
        return checklistItemRepository.findOneWithEagerRelationships(id).map(checklistItemMapper::toDto);
    }

    /**
     * Delete the checklistItem by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete ChecklistItem : {}", id);
        checklistItemRepository.deleteById(id);
    }
}

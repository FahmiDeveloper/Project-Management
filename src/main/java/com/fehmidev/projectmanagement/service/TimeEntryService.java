package com.fehmidev.projectmanagement.service;

import com.fehmidev.projectmanagement.domain.TimeEntry;
import com.fehmidev.projectmanagement.repository.TimeEntryRepository;
import com.fehmidev.projectmanagement.service.dto.TimeEntryDTO;
import com.fehmidev.projectmanagement.service.mapper.TimeEntryMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.fehmidev.projectmanagement.domain.TimeEntry}.
 */
@Service
@Transactional
public class TimeEntryService {

    private static final Logger LOG = LoggerFactory.getLogger(TimeEntryService.class);

    private final TimeEntryRepository timeEntryRepository;

    private final TimeEntryMapper timeEntryMapper;

    public TimeEntryService(TimeEntryRepository timeEntryRepository, TimeEntryMapper timeEntryMapper) {
        this.timeEntryRepository = timeEntryRepository;
        this.timeEntryMapper = timeEntryMapper;
    }

    /**
     * Save a timeEntry.
     *
     * @param timeEntryDTO the entity to save.
     * @return the persisted entity.
     */
    public TimeEntryDTO save(TimeEntryDTO timeEntryDTO) {
        LOG.debug("Request to save TimeEntry : {}", timeEntryDTO);
        TimeEntry timeEntry = timeEntryMapper.toEntity(timeEntryDTO);
        timeEntry = timeEntryRepository.save(timeEntry);
        return timeEntryMapper.toDto(timeEntry);
    }

    /**
     * Update a timeEntry.
     *
     * @param timeEntryDTO the entity to save.
     * @return the persisted entity.
     */
    public TimeEntryDTO update(TimeEntryDTO timeEntryDTO) {
        LOG.debug("Request to update TimeEntry : {}", timeEntryDTO);
        TimeEntry timeEntry = timeEntryMapper.toEntity(timeEntryDTO);
        timeEntry = timeEntryRepository.save(timeEntry);
        return timeEntryMapper.toDto(timeEntry);
    }

    /**
     * Partially update a timeEntry.
     *
     * @param timeEntryDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<TimeEntryDTO> partialUpdate(TimeEntryDTO timeEntryDTO) {
        LOG.debug("Request to partially update TimeEntry : {}", timeEntryDTO);

        return timeEntryRepository
            .findById(timeEntryDTO.getId())
            .map(existingTimeEntry -> {
                timeEntryMapper.partialUpdate(existingTimeEntry, timeEntryDTO);

                return existingTimeEntry;
            })
            .map(timeEntryRepository::save)
            .map(timeEntryMapper::toDto);
    }

    /**
     * Get all the timeEntries.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<TimeEntryDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all TimeEntries");
        return timeEntryRepository.findAll(pageable).map(timeEntryMapper::toDto);
    }

    /**
     * Get all the timeEntries with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<TimeEntryDTO> findAllWithEagerRelationships(Pageable pageable) {
        return timeEntryRepository.findAllWithEagerRelationships(pageable).map(timeEntryMapper::toDto);
    }

    /**
     * Get one timeEntry by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<TimeEntryDTO> findOne(Long id) {
        LOG.debug("Request to get TimeEntry : {}", id);
        return timeEntryRepository.findOneWithEagerRelationships(id).map(timeEntryMapper::toDto);
    }

    /**
     * Delete the timeEntry by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete TimeEntry : {}", id);
        timeEntryRepository.deleteById(id);
    }
}

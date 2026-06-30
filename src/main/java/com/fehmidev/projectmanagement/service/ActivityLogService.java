package com.fehmidev.projectmanagement.service;

import com.fehmidev.projectmanagement.domain.ActivityLog;
import com.fehmidev.projectmanagement.repository.ActivityLogRepository;
import com.fehmidev.projectmanagement.service.dto.ActivityLogDTO;
import com.fehmidev.projectmanagement.service.mapper.ActivityLogMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.fehmidev.projectmanagement.domain.ActivityLog}.
 */
@Service
@Transactional
public class ActivityLogService {

    private static final Logger LOG = LoggerFactory.getLogger(ActivityLogService.class);

    private final ActivityLogRepository activityLogRepository;

    private final ActivityLogMapper activityLogMapper;

    public ActivityLogService(ActivityLogRepository activityLogRepository, ActivityLogMapper activityLogMapper) {
        this.activityLogRepository = activityLogRepository;
        this.activityLogMapper = activityLogMapper;
    }

    /**
     * Save a activityLog.
     *
     * @param activityLogDTO the entity to save.
     * @return the persisted entity.
     */
    public ActivityLogDTO save(ActivityLogDTO activityLogDTO) {
        LOG.debug("Request to save ActivityLog : {}", activityLogDTO);
        ActivityLog activityLog = activityLogMapper.toEntity(activityLogDTO);
        activityLog = activityLogRepository.save(activityLog);
        return activityLogMapper.toDto(activityLog);
    }

    /**
     * Update a activityLog.
     *
     * @param activityLogDTO the entity to save.
     * @return the persisted entity.
     */
    public ActivityLogDTO update(ActivityLogDTO activityLogDTO) {
        LOG.debug("Request to update ActivityLog : {}", activityLogDTO);
        ActivityLog activityLog = activityLogMapper.toEntity(activityLogDTO);
        activityLog = activityLogRepository.save(activityLog);
        return activityLogMapper.toDto(activityLog);
    }

    /**
     * Partially update a activityLog.
     *
     * @param activityLogDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<ActivityLogDTO> partialUpdate(ActivityLogDTO activityLogDTO) {
        LOG.debug("Request to partially update ActivityLog : {}", activityLogDTO);

        return activityLogRepository
            .findById(activityLogDTO.getId())
            .map(existingActivityLog -> {
                activityLogMapper.partialUpdate(existingActivityLog, activityLogDTO);

                return existingActivityLog;
            })
            .map(activityLogRepository::save)
            .map(activityLogMapper::toDto);
    }

    /**
     * Get all the activityLogs.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<ActivityLogDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all ActivityLogs");
        return activityLogRepository.findAll(pageable).map(activityLogMapper::toDto);
    }

    /**
     * Get all the activityLogs with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<ActivityLogDTO> findAllWithEagerRelationships(Pageable pageable) {
        return activityLogRepository.findAllWithEagerRelationships(pageable).map(activityLogMapper::toDto);
    }

    /**
     * Get one activityLog by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<ActivityLogDTO> findOne(Long id) {
        LOG.debug("Request to get ActivityLog : {}", id);
        return activityLogRepository.findOneWithEagerRelationships(id).map(activityLogMapper::toDto);
    }

    /**
     * Delete the activityLog by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete ActivityLog : {}", id);
        activityLogRepository.deleteById(id);
    }
}

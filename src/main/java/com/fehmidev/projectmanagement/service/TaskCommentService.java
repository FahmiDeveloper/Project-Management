package com.fehmidev.projectmanagement.service;

import com.fehmidev.projectmanagement.domain.TaskComment;
import com.fehmidev.projectmanagement.repository.TaskCommentRepository;
import com.fehmidev.projectmanagement.service.dto.TaskCommentDTO;
import com.fehmidev.projectmanagement.service.mapper.TaskCommentMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.fehmidev.projectmanagement.domain.TaskComment}.
 */
@Service
@Transactional
public class TaskCommentService {

    private static final Logger LOG = LoggerFactory.getLogger(TaskCommentService.class);

    private final TaskCommentRepository taskCommentRepository;

    private final TaskCommentMapper taskCommentMapper;

    public TaskCommentService(TaskCommentRepository taskCommentRepository, TaskCommentMapper taskCommentMapper) {
        this.taskCommentRepository = taskCommentRepository;
        this.taskCommentMapper = taskCommentMapper;
    }

    /**
     * Save a taskComment.
     *
     * @param taskCommentDTO the entity to save.
     * @return the persisted entity.
     */
    public TaskCommentDTO save(TaskCommentDTO taskCommentDTO) {
        LOG.debug("Request to save TaskComment : {}", taskCommentDTO);
        TaskComment taskComment = taskCommentMapper.toEntity(taskCommentDTO);
        taskComment = taskCommentRepository.save(taskComment);
        return taskCommentMapper.toDto(taskComment);
    }

    /**
     * Update a taskComment.
     *
     * @param taskCommentDTO the entity to save.
     * @return the persisted entity.
     */
    public TaskCommentDTO update(TaskCommentDTO taskCommentDTO) {
        LOG.debug("Request to update TaskComment : {}", taskCommentDTO);
        TaskComment taskComment = taskCommentMapper.toEntity(taskCommentDTO);
        taskComment = taskCommentRepository.save(taskComment);
        return taskCommentMapper.toDto(taskComment);
    }

    /**
     * Partially update a taskComment.
     *
     * @param taskCommentDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<TaskCommentDTO> partialUpdate(TaskCommentDTO taskCommentDTO) {
        LOG.debug("Request to partially update TaskComment : {}", taskCommentDTO);

        return taskCommentRepository
            .findById(taskCommentDTO.getId())
            .map(existingTaskComment -> {
                taskCommentMapper.partialUpdate(existingTaskComment, taskCommentDTO);

                return existingTaskComment;
            })
            .map(taskCommentRepository::save)
            .map(taskCommentMapper::toDto);
    }

    /**
     * Get all the taskComments.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<TaskCommentDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all TaskComments");
        return taskCommentRepository.findAll(pageable).map(taskCommentMapper::toDto);
    }

    /**
     * Get all the taskComments with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<TaskCommentDTO> findAllWithEagerRelationships(Pageable pageable) {
        return taskCommentRepository.findAllWithEagerRelationships(pageable).map(taskCommentMapper::toDto);
    }

    /**
     * Get one taskComment by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<TaskCommentDTO> findOne(Long id) {
        LOG.debug("Request to get TaskComment : {}", id);
        return taskCommentRepository.findOneWithEagerRelationships(id).map(taskCommentMapper::toDto);
    }

    /**
     * Delete the taskComment by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete TaskComment : {}", id);
        taskCommentRepository.deleteById(id);
    }
}

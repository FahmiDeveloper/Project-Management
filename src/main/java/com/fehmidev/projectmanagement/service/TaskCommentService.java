package com.fehmidev.projectmanagement.service;

import com.fehmidev.projectmanagement.domain.TaskComment;
import com.fehmidev.projectmanagement.repository.TaskCommentRepository;
import com.fehmidev.projectmanagement.repository.TaskCommentSpecification;
import com.fehmidev.projectmanagement.service.dto.TaskCommentDTO;
import com.fehmidev.projectmanagement.service.mapper.TaskCommentMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
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

    public TaskCommentDTO save(TaskCommentDTO taskCommentDTO) {
        LOG.debug("Request to save TaskComment : {}", taskCommentDTO);
        TaskComment taskComment = taskCommentMapper.toEntity(taskCommentDTO);
        taskComment = taskCommentRepository.save(taskComment);
        return taskCommentMapper.toDto(taskComment);
    }

    public TaskCommentDTO update(TaskCommentDTO taskCommentDTO) {
        LOG.debug("Request to update TaskComment : {}", taskCommentDTO);
        TaskComment taskComment = taskCommentMapper.toEntity(taskCommentDTO);
        taskComment = taskCommentRepository.save(taskComment);
        return taskCommentMapper.toDto(taskComment);
    }

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

    @Transactional(readOnly = true)
    public Page<TaskCommentDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all TaskComments");
        return taskCommentRepository.findAll(pageable).map(taskCommentMapper::toDto);
    }

    // NEW: filtered
    @Transactional(readOnly = true)
    public Page<TaskCommentDTO> findAll(String content, Long taskId, Long employeeId, Pageable pageable) {
        LOG.debug("Request to get all TaskComments filtered by content: {}, taskId: {}, employeeId: {}", content, taskId, employeeId);
        Specification<TaskComment> spec = TaskCommentSpecification.withFilters(content, taskId, employeeId);
        return taskCommentRepository.findAll(spec, pageable).map(taskCommentMapper::toDto);
    }

    public Page<TaskCommentDTO> findAllWithEagerRelationships(Pageable pageable) {
        return findAll(null, null, null, pageable);
    }

    // NEW: eager, filtered
    public Page<TaskCommentDTO> findAllWithEagerRelationships(String content, Long taskId, Long employeeId, Pageable pageable) {
        LOG.debug(
            "Request to get all TaskComments (eager) filtered by content: {}, taskId: {}, employeeId: {}",
            content,
            taskId,
            employeeId
        );
        return findAll(content, taskId, employeeId, pageable);
    }

    @Transactional(readOnly = true)
    public Optional<TaskCommentDTO> findOne(Long id) {
        LOG.debug("Request to get TaskComment : {}", id);
        return taskCommentRepository.findOneWithEagerRelationships(id).map(taskCommentMapper::toDto);
    }

    public void delete(Long id) {
        LOG.debug("Request to delete TaskComment : {}", id);
        taskCommentRepository.deleteById(id);
    }
}

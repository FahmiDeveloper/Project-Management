package com.fehmidev.projectmanagement.service;

import com.fehmidev.projectmanagement.domain.Task;
import com.fehmidev.projectmanagement.domain.enumeration.TaskPriority;
import com.fehmidev.projectmanagement.domain.enumeration.TaskStatus;
import com.fehmidev.projectmanagement.repository.TaskRepository;
import com.fehmidev.projectmanagement.repository.TaskSpecification;
import com.fehmidev.projectmanagement.service.dto.TaskDTO;
import com.fehmidev.projectmanagement.service.mapper.TaskMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.fehmidev.projectmanagement.domain.Task}.
 */
@Service
@Transactional
public class TaskService {

    private static final Logger LOG = LoggerFactory.getLogger(TaskService.class);

    private final TaskRepository taskRepository;

    private final TaskMapper taskMapper;

    public TaskService(TaskRepository taskRepository, TaskMapper taskMapper) {
        this.taskRepository = taskRepository;
        this.taskMapper = taskMapper;
    }

    public TaskDTO save(TaskDTO taskDTO) {
        LOG.debug("Request to save Task : {}", taskDTO);
        Task task = taskMapper.toEntity(taskDTO);
        task = taskRepository.save(task);
        return taskMapper.toDto(task);
    }

    public TaskDTO update(TaskDTO taskDTO) {
        LOG.debug("Request to update Task : {}", taskDTO);
        Task task = taskMapper.toEntity(taskDTO);
        task = taskRepository.save(task);
        return taskMapper.toDto(task);
    }

    public Optional<TaskDTO> partialUpdate(TaskDTO taskDTO) {
        LOG.debug("Request to partially update Task : {}", taskDTO);

        return taskRepository
            .findById(taskDTO.getId())
            .map(existingTask -> {
                taskMapper.partialUpdate(existingTask, taskDTO);

                return existingTask;
            })
            .map(taskRepository::save)
            .map(taskMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Page<TaskDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all Tasks");
        return taskRepository.findAll(pageable).map(taskMapper::toDto);
    }

    // NEW: filtered
    @Transactional(readOnly = true)
    public Page<TaskDTO> findAll(
        String title,
        TaskStatus status,
        TaskPriority priority,
        Long assignedToId,
        Long sprintId,
        Long createdById,
        Pageable pageable
    ) {
        LOG.debug(
            "Request to get all Tasks filtered by title: {}, status: {}, priority: {}, assignedToId: {}, sprintId: {}, createdById: {}",
            title,
            status,
            priority,
            assignedToId,
            sprintId,
            createdById
        );
        Specification<Task> spec = TaskSpecification.withFilters(title, status, priority, assignedToId, sprintId, createdById);
        return taskRepository.findAll(spec, pageable).map(taskMapper::toDto);
    }

    public Page<TaskDTO> findAllWithEagerRelationships(Pageable pageable) {
        return findAll(null, null, null, null, null, null, pageable);
    }

    // NEW: eager, filtered
    public Page<TaskDTO> findAllWithEagerRelationships(
        String title,
        TaskStatus status,
        TaskPriority priority,
        Long assignedToId,
        Long sprintId,
        Long createdById,
        Pageable pageable
    ) {
        LOG.debug(
            "Request to get all Tasks (eager) filtered by title: {}, status: {}, priority: {}, assignedToId: {}, sprintId: {}, createdById: {}",
            title,
            status,
            priority,
            assignedToId,
            sprintId,
            createdById
        );
        return findAll(title, status, priority, assignedToId, sprintId, createdById, pageable);
    }

    @Transactional(readOnly = true)
    public Optional<TaskDTO> findOne(Long id) {
        LOG.debug("Request to get Task : {}", id);
        return taskRepository.findOneWithEagerRelationships(id).map(taskMapper::toDto);
    }

    public void delete(Long id) {
        LOG.debug("Request to delete Task : {}", id);
        taskRepository.deleteById(id);
    }
}

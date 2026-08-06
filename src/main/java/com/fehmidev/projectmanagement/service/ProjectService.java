package com.fehmidev.projectmanagement.service;

import com.fehmidev.projectmanagement.domain.Project;
import com.fehmidev.projectmanagement.domain.enumeration.ProjectStatus;
import com.fehmidev.projectmanagement.repository.ProjectRepository;
import com.fehmidev.projectmanagement.repository.ProjectSpecification;
import com.fehmidev.projectmanagement.service.dto.ProjectDTO;
import com.fehmidev.projectmanagement.service.mapper.ProjectMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ProjectService {

    private static final Logger LOG = LoggerFactory.getLogger(ProjectService.class);

    private final ProjectRepository projectRepository;

    private final ProjectMapper projectMapper;

    public ProjectService(ProjectRepository projectRepository, ProjectMapper projectMapper) {
        this.projectRepository = projectRepository;
        this.projectMapper = projectMapper;
    }

    public ProjectDTO save(ProjectDTO projectDTO) {
        LOG.debug("Request to save Project : {}", projectDTO);
        Project project = projectMapper.toEntity(projectDTO);
        project = projectRepository.save(project);
        return projectMapper.toDto(project);
    }

    public ProjectDTO update(ProjectDTO projectDTO) {
        LOG.debug("Request to update Project : {}", projectDTO);
        Project project = projectMapper.toEntity(projectDTO);
        project = projectRepository.save(project);
        return projectMapper.toDto(project);
    }

    public Optional<ProjectDTO> partialUpdate(ProjectDTO projectDTO) {
        LOG.debug("Request to partially update Project : {}", projectDTO);

        return projectRepository
            .findById(projectDTO.getId())
            .map(existingProject -> {
                projectMapper.partialUpdate(existingProject, projectDTO);

                return existingProject;
            })
            .map(projectRepository::save)
            .map(projectMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Page<ProjectDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all Projects");
        return projectRepository.findAll(pageable).map(projectMapper::toDto);
    }

    // NEW: non-eager, filtered
    @Transactional(readOnly = true)
    public Page<ProjectDTO> findAll(String name, ProjectStatus status, Long clientId, Long managerId, Pageable pageable) {
        LOG.debug(
            "Request to get all Projects filtered by name: {}, status: {}, clientId: {}, managerId: {}",
            name,
            status,
            clientId,
            managerId
        );
        Specification<Project> spec = ProjectSpecification.withFilters(name, status, clientId, managerId);
        return projectRepository.findAll(spec, pageable).map(projectMapper::toDto);
    }

    public Page<ProjectDTO> findAllWithEagerRelationships(Pageable pageable) {
        return findAll(null, null, null, null, pageable);
    }

    // NEW: eager, filtered
    public Page<ProjectDTO> findAllWithEagerRelationships(
        String name,
        ProjectStatus status,
        Long clientId,
        Long managerId,
        Pageable pageable
    ) {
        LOG.debug(
            "Request to get all Projects (eager) filtered by name: {}, status: {}, clientId: {}, managerId: {}",
            name,
            status,
            clientId,
            managerId
        );
        return findAll(name, status, clientId, managerId, pageable);
    }

    @Transactional(readOnly = true)
    public Optional<ProjectDTO> findOne(Long id) {
        LOG.debug("Request to get Project : {}", id);
        return projectRepository.findById(id).map(projectMapper::toDto);
    }

    public void delete(Long id) {
        LOG.debug("Request to delete Project : {}", id);
        projectRepository.deleteById(id);
    }
}

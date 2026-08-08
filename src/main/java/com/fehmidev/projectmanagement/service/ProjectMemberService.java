package com.fehmidev.projectmanagement.service;

import com.fehmidev.projectmanagement.domain.ProjectMember;
import com.fehmidev.projectmanagement.repository.ProjectMemberRepository;
import com.fehmidev.projectmanagement.repository.ProjectMemberSpecification;
import com.fehmidev.projectmanagement.service.dto.ProjectMemberDTO;
import com.fehmidev.projectmanagement.service.mapper.ProjectMemberMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.fehmidev.projectmanagement.domain.ProjectMember}.
 */
@Service
@Transactional
public class ProjectMemberService {

    private static final Logger LOG = LoggerFactory.getLogger(ProjectMemberService.class);

    private final ProjectMemberRepository projectMemberRepository;

    private final ProjectMemberMapper projectMemberMapper;

    public ProjectMemberService(ProjectMemberRepository projectMemberRepository, ProjectMemberMapper projectMemberMapper) {
        this.projectMemberRepository = projectMemberRepository;
        this.projectMemberMapper = projectMemberMapper;
    }

    public ProjectMemberDTO save(ProjectMemberDTO projectMemberDTO) {
        LOG.debug("Request to save ProjectMember : {}", projectMemberDTO);
        ProjectMember projectMember = projectMemberMapper.toEntity(projectMemberDTO);
        projectMember = projectMemberRepository.save(projectMember);
        return projectMemberMapper.toDto(projectMember);
    }

    public ProjectMemberDTO update(ProjectMemberDTO projectMemberDTO) {
        LOG.debug("Request to update ProjectMember : {}", projectMemberDTO);
        ProjectMember projectMember = projectMemberMapper.toEntity(projectMemberDTO);
        projectMember = projectMemberRepository.save(projectMember);
        return projectMemberMapper.toDto(projectMember);
    }

    public Optional<ProjectMemberDTO> partialUpdate(ProjectMemberDTO projectMemberDTO) {
        LOG.debug("Request to partially update ProjectMember : {}", projectMemberDTO);

        return projectMemberRepository
            .findById(projectMemberDTO.getId())
            .map(existingProjectMember -> {
                projectMemberMapper.partialUpdate(existingProjectMember, projectMemberDTO);

                return existingProjectMember;
            })
            .map(projectMemberRepository::save)
            .map(projectMemberMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Page<ProjectMemberDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all ProjectMembers");
        return projectMemberRepository.findAll(pageable).map(projectMemberMapper::toDto);
    }

    // NEW: filtered
    @Transactional(readOnly = true)
    public Page<ProjectMemberDTO> findAll(Long projectId, Long employeeId, Pageable pageable) {
        LOG.debug("Request to get all ProjectMembers filtered by projectId: {}, employeeId: {}", projectId, employeeId);
        Specification<ProjectMember> spec = ProjectMemberSpecification.withFilters(projectId, employeeId);
        return projectMemberRepository.findAll(spec, pageable).map(projectMemberMapper::toDto);
    }

    public Page<ProjectMemberDTO> findAllWithEagerRelationships(Pageable pageable) {
        return findAll(null, null, pageable);
    }

    // NEW: eager, filtered
    public Page<ProjectMemberDTO> findAllWithEagerRelationships(Long projectId, Long employeeId, Pageable pageable) {
        LOG.debug("Request to get all ProjectMembers (eager) filtered by projectId: {}, employeeId: {}", projectId, employeeId);
        return findAll(projectId, employeeId, pageable);
    }

    @Transactional(readOnly = true)
    public Optional<ProjectMemberDTO> findOne(Long id) {
        LOG.debug("Request to get ProjectMember : {}", id);
        return projectMemberRepository.findById(id).map(projectMemberMapper::toDto);
    }

    public void delete(Long id) {
        LOG.debug("Request to delete ProjectMember : {}", id);
        projectMemberRepository.deleteById(id);
    }
}

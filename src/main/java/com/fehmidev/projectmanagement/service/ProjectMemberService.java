package com.fehmidev.projectmanagement.service;

import com.fehmidev.projectmanagement.domain.ProjectMember;
import com.fehmidev.projectmanagement.repository.ProjectMemberRepository;
import com.fehmidev.projectmanagement.service.dto.ProjectMemberDTO;
import com.fehmidev.projectmanagement.service.mapper.ProjectMemberMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    /**
     * Save a projectMember.
     *
     * @param projectMemberDTO the entity to save.
     * @return the persisted entity.
     */
    public ProjectMemberDTO save(ProjectMemberDTO projectMemberDTO) {
        LOG.debug("Request to save ProjectMember : {}", projectMemberDTO);
        ProjectMember projectMember = projectMemberMapper.toEntity(projectMemberDTO);
        projectMember = projectMemberRepository.save(projectMember);
        return projectMemberMapper.toDto(projectMember);
    }

    /**
     * Update a projectMember.
     *
     * @param projectMemberDTO the entity to save.
     * @return the persisted entity.
     */
    public ProjectMemberDTO update(ProjectMemberDTO projectMemberDTO) {
        LOG.debug("Request to update ProjectMember : {}", projectMemberDTO);
        ProjectMember projectMember = projectMemberMapper.toEntity(projectMemberDTO);
        projectMember = projectMemberRepository.save(projectMember);
        return projectMemberMapper.toDto(projectMember);
    }

    /**
     * Partially update a projectMember.
     *
     * @param projectMemberDTO the entity to update partially.
     * @return the persisted entity.
     */
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

    /**
     * Get all the projectMembers.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<ProjectMemberDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all ProjectMembers");
        return projectMemberRepository.findAll(pageable).map(projectMemberMapper::toDto);
    }

    /**
     * Get all the employees with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<ProjectMemberDTO> findAllWithEagerRelationships(Pageable pageable) {
        return projectMemberRepository.findAllWithEagerRelationships(pageable).map(projectMemberMapper::toDto);
    }

    /**
     * Get one projectMember by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<ProjectMemberDTO> findOne(Long id) {
        LOG.debug("Request to get ProjectMember : {}", id);
        return projectMemberRepository.findById(id).map(projectMemberMapper::toDto);
    }

    /**
     * Delete the projectMember by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete ProjectMember : {}", id);
        projectMemberRepository.deleteById(id);
    }
}

package com.fehmidev.projectmanagement.web.rest;

import com.fehmidev.projectmanagement.repository.ProjectMemberRepository;
import com.fehmidev.projectmanagement.service.ProjectMemberService;
import com.fehmidev.projectmanagement.service.dto.ProjectMemberDTO;
import com.fehmidev.projectmanagement.web.rest.errors.BadRequestAlertException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link com.fehmidev.projectmanagement.domain.ProjectMember}.
 */
@RestController
@RequestMapping("/api/project-members")
public class ProjectMemberResource {

    private static final Logger LOG = LoggerFactory.getLogger(ProjectMemberResource.class);

    private static final String ENTITY_NAME = "projectMember";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final ProjectMemberService projectMemberService;

    private final ProjectMemberRepository projectMemberRepository;

    public ProjectMemberResource(ProjectMemberService projectMemberService, ProjectMemberRepository projectMemberRepository) {
        this.projectMemberService = projectMemberService;
        this.projectMemberRepository = projectMemberRepository;
    }

    /**
     * {@code POST  /project-members} : Create a new projectMember.
     *
     * @param projectMemberDTO the projectMemberDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new projectMemberDTO, or with status {@code 400 (Bad Request)} if the projectMember has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<ProjectMemberDTO> createProjectMember(@Valid @RequestBody ProjectMemberDTO projectMemberDTO)
        throws URISyntaxException {
        LOG.debug("REST request to save ProjectMember : {}", projectMemberDTO);
        if (projectMemberDTO.getId() != null) {
            throw new BadRequestAlertException("A new projectMember cannot already have an ID", ENTITY_NAME, "idexists");
        }
        projectMemberDTO = projectMemberService.save(projectMemberDTO);
        return ResponseEntity.created(new URI("/api/project-members/" + projectMemberDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, projectMemberDTO.getId().toString()))
            .body(projectMemberDTO);
    }

    /**
     * {@code PUT  /project-members/:id} : Updates an existing projectMember.
     *
     * @param id the id of the projectMemberDTO to save.
     * @param projectMemberDTO the projectMemberDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated projectMemberDTO,
     * or with status {@code 400 (Bad Request)} if the projectMemberDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the projectMemberDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ProjectMemberDTO> updateProjectMember(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody ProjectMemberDTO projectMemberDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update ProjectMember : {}, {}", id, projectMemberDTO);
        if (projectMemberDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, projectMemberDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!projectMemberRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        projectMemberDTO = projectMemberService.update(projectMemberDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, projectMemberDTO.getId().toString()))
            .body(projectMemberDTO);
    }

    /**
     * {@code PATCH  /project-members/:id} : Partial updates given fields of an existing projectMember, field will ignore if it is null
     *
     * @param id the id of the projectMemberDTO to save.
     * @param projectMemberDTO the projectMemberDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated projectMemberDTO,
     * or with status {@code 400 (Bad Request)} if the projectMemberDTO is not valid,
     * or with status {@code 404 (Not Found)} if the projectMemberDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the projectMemberDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<ProjectMemberDTO> partialUpdateProjectMember(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody ProjectMemberDTO projectMemberDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update ProjectMember partially : {}, {}", id, projectMemberDTO);
        if (projectMemberDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, projectMemberDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!projectMemberRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<ProjectMemberDTO> result = projectMemberService.partialUpdate(projectMemberDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, projectMemberDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /project-members} : get all the projectMembers.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of projectMembers in body.
     */
    @GetMapping("")
    public ResponseEntity<List<ProjectMemberDTO>> getAllProjectMembers(@org.springdoc.core.annotations.ParameterObject Pageable pageable) {
        LOG.debug("REST request to get a page of ProjectMembers");
        Page<ProjectMemberDTO> page = projectMemberService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /project-members/:id} : get the "id" projectMember.
     *
     * @param id the id of the projectMemberDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the projectMemberDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProjectMemberDTO> getProjectMember(@PathVariable("id") Long id) {
        LOG.debug("REST request to get ProjectMember : {}", id);
        Optional<ProjectMemberDTO> projectMemberDTO = projectMemberService.findOne(id);
        return ResponseUtil.wrapOrNotFound(projectMemberDTO);
    }

    /**
     * {@code DELETE  /project-members/:id} : delete the "id" projectMember.
     *
     * @param id the id of the projectMemberDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProjectMember(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete ProjectMember : {}", id);
        projectMemberService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}

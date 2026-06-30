package com.fehmidev.projectmanagement.web.rest;

import com.fehmidev.projectmanagement.repository.TaskCommentRepository;
import com.fehmidev.projectmanagement.service.TaskCommentService;
import com.fehmidev.projectmanagement.service.dto.TaskCommentDTO;
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
 * REST controller for managing {@link com.fehmidev.projectmanagement.domain.TaskComment}.
 */
@RestController
@RequestMapping("/api/task-comments")
public class TaskCommentResource {

    private static final Logger LOG = LoggerFactory.getLogger(TaskCommentResource.class);

    private static final String ENTITY_NAME = "taskComment";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final TaskCommentService taskCommentService;

    private final TaskCommentRepository taskCommentRepository;

    public TaskCommentResource(TaskCommentService taskCommentService, TaskCommentRepository taskCommentRepository) {
        this.taskCommentService = taskCommentService;
        this.taskCommentRepository = taskCommentRepository;
    }

    /**
     * {@code POST  /task-comments} : Create a new taskComment.
     *
     * @param taskCommentDTO the taskCommentDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new taskCommentDTO, or with status {@code 400 (Bad Request)} if the taskComment has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<TaskCommentDTO> createTaskComment(@Valid @RequestBody TaskCommentDTO taskCommentDTO) throws URISyntaxException {
        LOG.debug("REST request to save TaskComment : {}", taskCommentDTO);
        if (taskCommentDTO.getId() != null) {
            throw new BadRequestAlertException("A new taskComment cannot already have an ID", ENTITY_NAME, "idexists");
        }
        taskCommentDTO = taskCommentService.save(taskCommentDTO);
        return ResponseEntity.created(new URI("/api/task-comments/" + taskCommentDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, taskCommentDTO.getId().toString()))
            .body(taskCommentDTO);
    }

    /**
     * {@code PUT  /task-comments/:id} : Updates an existing taskComment.
     *
     * @param id the id of the taskCommentDTO to save.
     * @param taskCommentDTO the taskCommentDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated taskCommentDTO,
     * or with status {@code 400 (Bad Request)} if the taskCommentDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the taskCommentDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<TaskCommentDTO> updateTaskComment(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody TaskCommentDTO taskCommentDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update TaskComment : {}, {}", id, taskCommentDTO);
        if (taskCommentDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, taskCommentDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!taskCommentRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        taskCommentDTO = taskCommentService.update(taskCommentDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, taskCommentDTO.getId().toString()))
            .body(taskCommentDTO);
    }

    /**
     * {@code PATCH  /task-comments/:id} : Partial updates given fields of an existing taskComment, field will ignore if it is null
     *
     * @param id the id of the taskCommentDTO to save.
     * @param taskCommentDTO the taskCommentDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated taskCommentDTO,
     * or with status {@code 400 (Bad Request)} if the taskCommentDTO is not valid,
     * or with status {@code 404 (Not Found)} if the taskCommentDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the taskCommentDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<TaskCommentDTO> partialUpdateTaskComment(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody TaskCommentDTO taskCommentDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update TaskComment partially : {}, {}", id, taskCommentDTO);
        if (taskCommentDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, taskCommentDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!taskCommentRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<TaskCommentDTO> result = taskCommentService.partialUpdate(taskCommentDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, taskCommentDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /task-comments} : get all the taskComments.
     *
     * @param pageable the pagination information.
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of taskComments in body.
     */
    @GetMapping("")
    public ResponseEntity<List<TaskCommentDTO>> getAllTaskComments(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable,
        @RequestParam(name = "eagerload", required = false, defaultValue = "true") boolean eagerload
    ) {
        LOG.debug("REST request to get a page of TaskComments");
        Page<TaskCommentDTO> page;
        if (eagerload) {
            page = taskCommentService.findAllWithEagerRelationships(pageable);
        } else {
            page = taskCommentService.findAll(pageable);
        }
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /task-comments/:id} : get the "id" taskComment.
     *
     * @param id the id of the taskCommentDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the taskCommentDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<TaskCommentDTO> getTaskComment(@PathVariable("id") Long id) {
        LOG.debug("REST request to get TaskComment : {}", id);
        Optional<TaskCommentDTO> taskCommentDTO = taskCommentService.findOne(id);
        return ResponseUtil.wrapOrNotFound(taskCommentDTO);
    }

    /**
     * {@code DELETE  /task-comments/:id} : delete the "id" taskComment.
     *
     * @param id the id of the taskCommentDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTaskComment(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete TaskComment : {}", id);
        taskCommentService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}

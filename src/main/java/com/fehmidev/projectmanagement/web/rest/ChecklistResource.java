package com.fehmidev.projectmanagement.web.rest;

import com.fehmidev.projectmanagement.repository.ChecklistRepository;
import com.fehmidev.projectmanagement.service.ChecklistService;
import com.fehmidev.projectmanagement.service.dto.ChecklistDTO;
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
 * REST controller for managing {@link com.fehmidev.projectmanagement.domain.Checklist}.
 */
@RestController
@RequestMapping("/api/checklists")
public class ChecklistResource {

    private static final Logger LOG = LoggerFactory.getLogger(ChecklistResource.class);

    private static final String ENTITY_NAME = "checklist";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final ChecklistService checklistService;

    private final ChecklistRepository checklistRepository;

    public ChecklistResource(ChecklistService checklistService, ChecklistRepository checklistRepository) {
        this.checklistService = checklistService;
        this.checklistRepository = checklistRepository;
    }

    /**
     * {@code POST  /checklists} : Create a new checklist.
     *
     * @param checklistDTO the checklistDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new checklistDTO, or with status {@code 400 (Bad Request)} if the checklist has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<ChecklistDTO> createChecklist(@Valid @RequestBody ChecklistDTO checklistDTO) throws URISyntaxException {
        LOG.debug("REST request to save Checklist : {}", checklistDTO);
        if (checklistDTO.getId() != null) {
            throw new BadRequestAlertException("A new checklist cannot already have an ID", ENTITY_NAME, "idexists");
        }
        checklistDTO = checklistService.save(checklistDTO);
        return ResponseEntity.created(new URI("/api/checklists/" + checklistDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, checklistDTO.getId().toString()))
            .body(checklistDTO);
    }

    /**
     * {@code PUT  /checklists/:id} : Updates an existing checklist.
     *
     * @param id the id of the checklistDTO to save.
     * @param checklistDTO the checklistDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated checklistDTO,
     * or with status {@code 400 (Bad Request)} if the checklistDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the checklistDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ChecklistDTO> updateChecklist(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody ChecklistDTO checklistDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update Checklist : {}, {}", id, checklistDTO);
        if (checklistDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, checklistDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!checklistRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        checklistDTO = checklistService.update(checklistDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, checklistDTO.getId().toString()))
            .body(checklistDTO);
    }

    /**
     * {@code PATCH  /checklists/:id} : Partial updates given fields of an existing checklist, field will ignore if it is null
     *
     * @param id the id of the checklistDTO to save.
     * @param checklistDTO the checklistDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated checklistDTO,
     * or with status {@code 400 (Bad Request)} if the checklistDTO is not valid,
     * or with status {@code 404 (Not Found)} if the checklistDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the checklistDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<ChecklistDTO> partialUpdateChecklist(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody ChecklistDTO checklistDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update Checklist partially : {}, {}", id, checklistDTO);
        if (checklistDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, checklistDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!checklistRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<ChecklistDTO> result = checklistService.partialUpdate(checklistDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, checklistDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /checklists} : get all the checklists.
     *
     * @param pageable the pagination information.
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of checklists in body.
     */
    @GetMapping("")
    public ResponseEntity<List<ChecklistDTO>> getAllChecklists(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable,
        @RequestParam(name = "eagerload", required = false, defaultValue = "true") boolean eagerload
    ) {
        LOG.debug("REST request to get a page of Checklists");
        Page<ChecklistDTO> page;
        if (eagerload) {
            page = checklistService.findAllWithEagerRelationships(pageable);
        } else {
            page = checklistService.findAll(pageable);
        }
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /checklists/:id} : get the "id" checklist.
     *
     * @param id the id of the checklistDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the checklistDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ChecklistDTO> getChecklist(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Checklist : {}", id);
        Optional<ChecklistDTO> checklistDTO = checklistService.findOne(id);
        return ResponseUtil.wrapOrNotFound(checklistDTO);
    }

    /**
     * {@code DELETE  /checklists/:id} : delete the "id" checklist.
     *
     * @param id the id of the checklistDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteChecklist(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Checklist : {}", id);
        checklistService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}

package com.fehmidev.projectmanagement.web.rest;

import com.fehmidev.projectmanagement.repository.ChecklistItemRepository;
import com.fehmidev.projectmanagement.service.ChecklistItemService;
import com.fehmidev.projectmanagement.service.dto.ChecklistItemDTO;
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
 * REST controller for managing {@link com.fehmidev.projectmanagement.domain.ChecklistItem}.
 */
@RestController
@RequestMapping("/api/checklist-items")
public class ChecklistItemResource {

    private static final Logger LOG = LoggerFactory.getLogger(ChecklistItemResource.class);

    private static final String ENTITY_NAME = "checklistItem";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final ChecklistItemService checklistItemService;

    private final ChecklistItemRepository checklistItemRepository;

    public ChecklistItemResource(ChecklistItemService checklistItemService, ChecklistItemRepository checklistItemRepository) {
        this.checklistItemService = checklistItemService;
        this.checklistItemRepository = checklistItemRepository;
    }

    /**
     * {@code POST  /checklist-items} : Create a new checklistItem.
     *
     * @param checklistItemDTO the checklistItemDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new checklistItemDTO, or with status {@code 400 (Bad Request)} if the checklistItem has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<ChecklistItemDTO> createChecklistItem(@Valid @RequestBody ChecklistItemDTO checklistItemDTO)
        throws URISyntaxException {
        LOG.debug("REST request to save ChecklistItem : {}", checklistItemDTO);
        if (checklistItemDTO.getId() != null) {
            throw new BadRequestAlertException("A new checklistItem cannot already have an ID", ENTITY_NAME, "idexists");
        }
        checklistItemDTO = checklistItemService.save(checklistItemDTO);
        return ResponseEntity.created(new URI("/api/checklist-items/" + checklistItemDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, checklistItemDTO.getId().toString()))
            .body(checklistItemDTO);
    }

    /**
     * {@code PUT  /checklist-items/:id} : Updates an existing checklistItem.
     *
     * @param id the id of the checklistItemDTO to save.
     * @param checklistItemDTO the checklistItemDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated checklistItemDTO,
     * or with status {@code 400 (Bad Request)} if the checklistItemDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the checklistItemDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ChecklistItemDTO> updateChecklistItem(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody ChecklistItemDTO checklistItemDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update ChecklistItem : {}, {}", id, checklistItemDTO);
        if (checklistItemDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, checklistItemDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!checklistItemRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        checklistItemDTO = checklistItemService.update(checklistItemDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, checklistItemDTO.getId().toString()))
            .body(checklistItemDTO);
    }

    /**
     * {@code PATCH  /checklist-items/:id} : Partial updates given fields of an existing checklistItem, field will ignore if it is null
     *
     * @param id the id of the checklistItemDTO to save.
     * @param checklistItemDTO the checklistItemDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated checklistItemDTO,
     * or with status {@code 400 (Bad Request)} if the checklistItemDTO is not valid,
     * or with status {@code 404 (Not Found)} if the checklistItemDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the checklistItemDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<ChecklistItemDTO> partialUpdateChecklistItem(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody ChecklistItemDTO checklistItemDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update ChecklistItem partially : {}, {}", id, checklistItemDTO);
        if (checklistItemDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, checklistItemDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!checklistItemRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<ChecklistItemDTO> result = checklistItemService.partialUpdate(checklistItemDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, checklistItemDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /checklist-items} : get all the checklistItems.
     *
     * @param pageable the pagination information.
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of checklistItems in body.
     */
    @GetMapping("")
    public ResponseEntity<List<ChecklistItemDTO>> getAllChecklistItems(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable,
        @RequestParam(name = "eagerload", required = false, defaultValue = "true") boolean eagerload
    ) {
        LOG.debug("REST request to get a page of ChecklistItems");
        Page<ChecklistItemDTO> page;
        if (eagerload) {
            page = checklistItemService.findAllWithEagerRelationships(pageable);
        } else {
            page = checklistItemService.findAll(pageable);
        }
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /checklist-items/:id} : get the "id" checklistItem.
     *
     * @param id the id of the checklistItemDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the checklistItemDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ChecklistItemDTO> getChecklistItem(@PathVariable("id") Long id) {
        LOG.debug("REST request to get ChecklistItem : {}", id);
        Optional<ChecklistItemDTO> checklistItemDTO = checklistItemService.findOne(id);
        return ResponseUtil.wrapOrNotFound(checklistItemDTO);
    }

    /**
     * {@code DELETE  /checklist-items/:id} : delete the "id" checklistItem.
     *
     * @param id the id of the checklistItemDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteChecklistItem(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete ChecklistItem : {}", id);
        checklistItemService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}

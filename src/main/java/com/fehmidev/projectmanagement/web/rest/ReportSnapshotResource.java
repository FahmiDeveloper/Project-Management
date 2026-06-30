package com.fehmidev.projectmanagement.web.rest;

import com.fehmidev.projectmanagement.repository.ReportSnapshotRepository;
import com.fehmidev.projectmanagement.service.ReportSnapshotService;
import com.fehmidev.projectmanagement.service.dto.ReportSnapshotDTO;
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
 * REST controller for managing {@link com.fehmidev.projectmanagement.domain.ReportSnapshot}.
 */
@RestController
@RequestMapping("/api/report-snapshots")
public class ReportSnapshotResource {

    private static final Logger LOG = LoggerFactory.getLogger(ReportSnapshotResource.class);

    private static final String ENTITY_NAME = "reportSnapshot";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final ReportSnapshotService reportSnapshotService;

    private final ReportSnapshotRepository reportSnapshotRepository;

    public ReportSnapshotResource(ReportSnapshotService reportSnapshotService, ReportSnapshotRepository reportSnapshotRepository) {
        this.reportSnapshotService = reportSnapshotService;
        this.reportSnapshotRepository = reportSnapshotRepository;
    }

    /**
     * {@code POST  /report-snapshots} : Create a new reportSnapshot.
     *
     * @param reportSnapshotDTO the reportSnapshotDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new reportSnapshotDTO, or with status {@code 400 (Bad Request)} if the reportSnapshot has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<ReportSnapshotDTO> createReportSnapshot(@Valid @RequestBody ReportSnapshotDTO reportSnapshotDTO)
        throws URISyntaxException {
        LOG.debug("REST request to save ReportSnapshot : {}", reportSnapshotDTO);
        if (reportSnapshotDTO.getId() != null) {
            throw new BadRequestAlertException("A new reportSnapshot cannot already have an ID", ENTITY_NAME, "idexists");
        }
        reportSnapshotDTO = reportSnapshotService.save(reportSnapshotDTO);
        return ResponseEntity.created(new URI("/api/report-snapshots/" + reportSnapshotDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, reportSnapshotDTO.getId().toString()))
            .body(reportSnapshotDTO);
    }

    /**
     * {@code PUT  /report-snapshots/:id} : Updates an existing reportSnapshot.
     *
     * @param id the id of the reportSnapshotDTO to save.
     * @param reportSnapshotDTO the reportSnapshotDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated reportSnapshotDTO,
     * or with status {@code 400 (Bad Request)} if the reportSnapshotDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the reportSnapshotDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ReportSnapshotDTO> updateReportSnapshot(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody ReportSnapshotDTO reportSnapshotDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update ReportSnapshot : {}, {}", id, reportSnapshotDTO);
        if (reportSnapshotDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, reportSnapshotDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!reportSnapshotRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        reportSnapshotDTO = reportSnapshotService.update(reportSnapshotDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, reportSnapshotDTO.getId().toString()))
            .body(reportSnapshotDTO);
    }

    /**
     * {@code PATCH  /report-snapshots/:id} : Partial updates given fields of an existing reportSnapshot, field will ignore if it is null
     *
     * @param id the id of the reportSnapshotDTO to save.
     * @param reportSnapshotDTO the reportSnapshotDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated reportSnapshotDTO,
     * or with status {@code 400 (Bad Request)} if the reportSnapshotDTO is not valid,
     * or with status {@code 404 (Not Found)} if the reportSnapshotDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the reportSnapshotDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<ReportSnapshotDTO> partialUpdateReportSnapshot(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody ReportSnapshotDTO reportSnapshotDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update ReportSnapshot partially : {}, {}", id, reportSnapshotDTO);
        if (reportSnapshotDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, reportSnapshotDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!reportSnapshotRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<ReportSnapshotDTO> result = reportSnapshotService.partialUpdate(reportSnapshotDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, reportSnapshotDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /report-snapshots} : get all the reportSnapshots.
     *
     * @param pageable the pagination information.
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of reportSnapshots in body.
     */
    @GetMapping("")
    public ResponseEntity<List<ReportSnapshotDTO>> getAllReportSnapshots(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable,
        @RequestParam(name = "eagerload", required = false, defaultValue = "true") boolean eagerload
    ) {
        LOG.debug("REST request to get a page of ReportSnapshots");
        Page<ReportSnapshotDTO> page;
        if (eagerload) {
            page = reportSnapshotService.findAllWithEagerRelationships(pageable);
        } else {
            page = reportSnapshotService.findAll(pageable);
        }
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /report-snapshots/:id} : get the "id" reportSnapshot.
     *
     * @param id the id of the reportSnapshotDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the reportSnapshotDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ReportSnapshotDTO> getReportSnapshot(@PathVariable("id") Long id) {
        LOG.debug("REST request to get ReportSnapshot : {}", id);
        Optional<ReportSnapshotDTO> reportSnapshotDTO = reportSnapshotService.findOne(id);
        return ResponseUtil.wrapOrNotFound(reportSnapshotDTO);
    }

    /**
     * {@code DELETE  /report-snapshots/:id} : delete the "id" reportSnapshot.
     *
     * @param id the id of the reportSnapshotDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReportSnapshot(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete ReportSnapshot : {}", id);
        reportSnapshotService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}

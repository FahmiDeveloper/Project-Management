package com.fehmidev.projectmanagement.service;

import com.fehmidev.projectmanagement.domain.Attachment;
import com.fehmidev.projectmanagement.repository.AttachmentRepository;
import com.fehmidev.projectmanagement.repository.AttachmentSpecification;
import com.fehmidev.projectmanagement.service.dto.AttachmentDTO;
import com.fehmidev.projectmanagement.service.mapper.AttachmentMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.fehmidev.projectmanagement.domain.Attachment}.
 */
@Service
@Transactional
public class AttachmentService {

    private static final Logger LOG = LoggerFactory.getLogger(AttachmentService.class);

    private final AttachmentRepository attachmentRepository;

    private final AttachmentMapper attachmentMapper;

    public AttachmentService(AttachmentRepository attachmentRepository, AttachmentMapper attachmentMapper) {
        this.attachmentRepository = attachmentRepository;
        this.attachmentMapper = attachmentMapper;
    }

    public AttachmentDTO save(AttachmentDTO attachmentDTO) {
        LOG.debug("Request to save Attachment : {}", attachmentDTO);
        Attachment attachment = attachmentMapper.toEntity(attachmentDTO);
        attachment = attachmentRepository.save(attachment);
        return attachmentMapper.toDto(attachment);
    }

    public AttachmentDTO update(AttachmentDTO attachmentDTO) {
        LOG.debug("Request to update Attachment : {}", attachmentDTO);
        Attachment attachment = attachmentMapper.toEntity(attachmentDTO);
        attachment = attachmentRepository.save(attachment);
        return attachmentMapper.toDto(attachment);
    }

    public Optional<AttachmentDTO> partialUpdate(AttachmentDTO attachmentDTO) {
        LOG.debug("Request to partially update Attachment : {}", attachmentDTO);

        return attachmentRepository
            .findById(attachmentDTO.getId())
            .map(existingAttachment -> {
                attachmentMapper.partialUpdate(existingAttachment, attachmentDTO);

                return existingAttachment;
            })
            .map(attachmentRepository::save)
            .map(attachmentMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Page<AttachmentDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all Attachments");
        return attachmentRepository.findAll(pageable).map(attachmentMapper::toDto);
    }

    // NEW: filtered
    @Transactional(readOnly = true)
    public Page<AttachmentDTO> findAll(String fileName, Long taskId, Long employeeId, Pageable pageable) {
        LOG.debug("Request to get all Attachments filtered by fileName: {}, taskId: {}, employeeId: {}", fileName, taskId, employeeId);
        Specification<Attachment> spec = AttachmentSpecification.withFilters(fileName, taskId, employeeId);
        return attachmentRepository.findAll(spec, pageable).map(attachmentMapper::toDto);
    }

    public Page<AttachmentDTO> findAllWithEagerRelationships(Pageable pageable) {
        return findAll(null, null, null, pageable);
    }

    // NEW: eager, filtered
    public Page<AttachmentDTO> findAllWithEagerRelationships(String fileName, Long taskId, Long employeeId, Pageable pageable) {
        LOG.debug(
            "Request to get all Attachments (eager) filtered by fileName: {}, taskId: {}, employeeId: {}",
            fileName,
            taskId,
            employeeId
        );
        return findAll(fileName, taskId, employeeId, pageable);
    }

    @Transactional(readOnly = true)
    public Optional<AttachmentDTO> findOne(Long id) {
        LOG.debug("Request to get Attachment : {}", id);
        return attachmentRepository.findOneWithEagerRelationships(id).map(attachmentMapper::toDto);
    }

    public void delete(Long id) {
        LOG.debug("Request to delete Attachment : {}", id);
        attachmentRepository.deleteById(id);
    }
}

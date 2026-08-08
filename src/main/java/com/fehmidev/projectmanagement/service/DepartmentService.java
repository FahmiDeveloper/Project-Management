package com.fehmidev.projectmanagement.service;

import com.fehmidev.projectmanagement.domain.Department;
import com.fehmidev.projectmanagement.repository.DepartmentRepository;
import com.fehmidev.projectmanagement.service.dto.DepartmentDTO;
import com.fehmidev.projectmanagement.service.mapper.DepartmentMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.fehmidev.projectmanagement.domain.Department}.
 */
@Service
@Transactional
public class DepartmentService {

    private static final Logger LOG = LoggerFactory.getLogger(DepartmentService.class);

    private final DepartmentRepository departmentRepository;

    private final DepartmentMapper departmentMapper;

    public DepartmentService(DepartmentRepository departmentRepository, DepartmentMapper departmentMapper) {
        this.departmentRepository = departmentRepository;
        this.departmentMapper = departmentMapper;
    }

    public DepartmentDTO save(DepartmentDTO departmentDTO) {
        LOG.debug("Request to save Department : {}", departmentDTO);
        Department department = departmentMapper.toEntity(departmentDTO);
        department = departmentRepository.save(department);
        return departmentMapper.toDto(department);
    }

    public DepartmentDTO update(DepartmentDTO departmentDTO) {
        LOG.debug("Request to update Department : {}", departmentDTO);
        Department department = departmentMapper.toEntity(departmentDTO);
        department = departmentRepository.save(department);
        return departmentMapper.toDto(department);
    }

    public Optional<DepartmentDTO> partialUpdate(DepartmentDTO departmentDTO) {
        LOG.debug("Request to partially update Department : {}", departmentDTO);

        return departmentRepository
            .findById(departmentDTO.getId())
            .map(existingDepartment -> {
                departmentMapper.partialUpdate(existingDepartment, departmentDTO);

                return existingDepartment;
            })
            .map(departmentRepository::save)
            .map(departmentMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Page<DepartmentDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all Departments");
        return departmentRepository.findAll(pageable).map(departmentMapper::toDto);
    }

    // NEW: filtered by name
    @Transactional(readOnly = true)
    public Page<DepartmentDTO> findAll(String name, Pageable pageable) {
        LOG.debug("Request to get all Departments filtered by name: {}", name);
        if (name != null && !name.isBlank()) {
            return departmentRepository.findByNameContainingIgnoreCase(name, pageable).map(departmentMapper::toDto);
        }
        return departmentRepository.findAll(pageable).map(departmentMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Optional<DepartmentDTO> findOne(Long id) {
        LOG.debug("Request to get Department : {}", id);
        return departmentRepository.findById(id).map(departmentMapper::toDto);
    }

    public void delete(Long id) {
        LOG.debug("Request to delete Department : {}", id);
        departmentRepository.deleteById(id);
    }
}

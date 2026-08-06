package com.fehmidev.projectmanagement.service;

import com.fehmidev.projectmanagement.domain.Employee;
import com.fehmidev.projectmanagement.repository.EmployeeRepository;
import com.fehmidev.projectmanagement.repository.EmployeeSpecification;
import com.fehmidev.projectmanagement.service.dto.EmployeeDTO;
import com.fehmidev.projectmanagement.service.mapper.EmployeeMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.fehmidev.projectmanagement.domain.Employee}.
 */
@Service
@Transactional
public class EmployeeService {

    private static final Logger LOG = LoggerFactory.getLogger(EmployeeService.class);

    private final EmployeeRepository employeeRepository;

    private final EmployeeMapper employeeMapper;

    public EmployeeService(EmployeeRepository employeeRepository, EmployeeMapper employeeMapper) {
        this.employeeRepository = employeeRepository;
        this.employeeMapper = employeeMapper;
    }

    public EmployeeDTO save(EmployeeDTO employeeDTO) {
        LOG.debug("Request to save Employee : {}", employeeDTO);
        Employee employee = employeeMapper.toEntity(employeeDTO);
        employee = employeeRepository.save(employee);
        return employeeMapper.toDto(employee);
    }

    public EmployeeDTO update(EmployeeDTO employeeDTO) {
        LOG.debug("Request to update Employee : {}", employeeDTO);
        Employee employee = employeeMapper.toEntity(employeeDTO);
        employee = employeeRepository.save(employee);
        return employeeMapper.toDto(employee);
    }

    public Optional<EmployeeDTO> partialUpdate(EmployeeDTO employeeDTO) {
        LOG.debug("Request to partially update Employee : {}", employeeDTO);

        return employeeRepository
            .findById(employeeDTO.getId())
            .map(existingEmployee -> {
                employeeMapper.partialUpdate(existingEmployee, employeeDTO);

                return existingEmployee;
            })
            .map(employeeRepository::save)
            .map(employeeMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Page<EmployeeDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all Employees");
        return employeeRepository.findAll(pageable).map(employeeMapper::toDto);
    }

    // NEW: filtered
    @Transactional(readOnly = true)
    public Page<EmployeeDTO> findAll(String name, String jobTitle, Long departmentId, Pageable pageable) {
        LOG.debug("Request to get all Employees filtered by name: {}, jobTitle: {}, departmentId: {}", name, jobTitle, departmentId);
        Specification<Employee> spec = EmployeeSpecification.withFilters(name, jobTitle, departmentId);
        return employeeRepository.findAll(spec, pageable).map(employeeMapper::toDto);
    }

    public Page<EmployeeDTO> findAllWithEagerRelationships(Pageable pageable) {
        return findAll(null, null, null, pageable);
    }

    // NEW: eager, filtered
    public Page<EmployeeDTO> findAllWithEagerRelationships(String name, String jobTitle, Long departmentId, Pageable pageable) {
        LOG.debug(
            "Request to get all Employees (eager) filtered by name: {}, jobTitle: {}, departmentId: {}",
            name,
            jobTitle,
            departmentId
        );
        return findAll(name, jobTitle, departmentId, pageable);
    }

    @Transactional(readOnly = true)
    public Optional<EmployeeDTO> findOne(Long id) {
        LOG.debug("Request to get Employee : {}", id);
        return employeeRepository.findById(id).map(employeeMapper::toDto);
    }

    public void delete(Long id) {
        LOG.debug("Request to delete Employee : {}", id);
        employeeRepository.deleteById(id);
    }
}

package com.fehmidev.projectmanagement.service.mapper;

import com.fehmidev.projectmanagement.domain.Department;
import com.fehmidev.projectmanagement.service.dto.DepartmentDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Department} and its DTO {@link DepartmentDTO}.
 */
@Mapper(componentModel = "spring")
public interface DepartmentMapper extends EntityMapper<DepartmentDTO, Department> {}

package com.fehmidev.projectmanagement.service.mapper;

import com.fehmidev.projectmanagement.domain.Department;
import com.fehmidev.projectmanagement.domain.Employee;
import com.fehmidev.projectmanagement.domain.User;
import com.fehmidev.projectmanagement.service.dto.DepartmentDTO;
import com.fehmidev.projectmanagement.service.dto.EmployeeDTO;
import com.fehmidev.projectmanagement.service.dto.UserDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Employee} and its DTO {@link EmployeeDTO}.
 */
@Mapper(componentModel = "spring")
public interface EmployeeMapper extends EntityMapper<EmployeeDTO, Employee> {
    @Mapping(target = "user", source = "user", qualifiedByName = "userId")
    @Mapping(target = "department", source = "department", qualifiedByName = "departmentId")
    EmployeeDTO toDto(Employee s);

    @Named("userId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "login", source = "login")
    UserDTO toDtoUserId(User user);

    @Named("departmentId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "name", source = "name")
    DepartmentDTO toDtoDepartmentId(Department department);
}

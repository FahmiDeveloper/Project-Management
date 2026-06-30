package com.fehmidev.projectmanagement.service.mapper;

import com.fehmidev.projectmanagement.domain.Dashboard;
import com.fehmidev.projectmanagement.domain.Employee;
import com.fehmidev.projectmanagement.domain.Project;
import com.fehmidev.projectmanagement.service.dto.DashboardDTO;
import com.fehmidev.projectmanagement.service.dto.EmployeeDTO;
import com.fehmidev.projectmanagement.service.dto.ProjectDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Dashboard} and its DTO {@link DashboardDTO}.
 */
@Mapper(componentModel = "spring")
public interface DashboardMapper extends EntityMapper<DashboardDTO, Dashboard> {
    @Mapping(target = "employee", source = "employee", qualifiedByName = "employeeFirstName")
    @Mapping(target = "project", source = "project", qualifiedByName = "projectName")
    DashboardDTO toDto(Dashboard s);

    @Named("employeeFirstName")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "firstName", source = "firstName")
    EmployeeDTO toDtoEmployeeFirstName(Employee employee);

    @Named("projectName")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "name", source = "name")
    ProjectDTO toDtoProjectName(Project project);
}

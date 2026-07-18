package com.fehmidev.projectmanagement.service.mapper;

import com.fehmidev.projectmanagement.domain.Employee;
import com.fehmidev.projectmanagement.domain.Project;
import com.fehmidev.projectmanagement.domain.ProjectMember;
import com.fehmidev.projectmanagement.service.dto.EmployeeDTO;
import com.fehmidev.projectmanagement.service.dto.ProjectDTO;
import com.fehmidev.projectmanagement.service.dto.ProjectMemberDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link ProjectMember} and its DTO {@link ProjectMemberDTO}.
 */
@Mapper(componentModel = "spring")
public interface ProjectMemberMapper extends EntityMapper<ProjectMemberDTO, ProjectMember> {
    @Mapping(target = "project", source = "project", qualifiedByName = "projectId")
    @Mapping(target = "employee", source = "employee", qualifiedByName = "employeeId")
    ProjectMemberDTO toDto(ProjectMember s);

    @Named("projectId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "name", source = "name")
    ProjectDTO toDtoProjectId(Project project);

    @Named("employeeId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "firstName", source = "firstName")
    @Mapping(target = "lastName", source = "lastName")
    EmployeeDTO toDtoEmployeeId(Employee employee);
}

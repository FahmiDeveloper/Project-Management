package com.fehmidev.projectmanagement.service.mapper;

import com.fehmidev.projectmanagement.domain.Employee;
import com.fehmidev.projectmanagement.domain.Milestone;
import com.fehmidev.projectmanagement.domain.Sprint;
import com.fehmidev.projectmanagement.domain.Task;
import com.fehmidev.projectmanagement.service.dto.EmployeeDTO;
import com.fehmidev.projectmanagement.service.dto.MilestoneDTO;
import com.fehmidev.projectmanagement.service.dto.SprintDTO;
import com.fehmidev.projectmanagement.service.dto.TaskDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Task} and its DTO {@link TaskDTO}.
 */
@Mapper(componentModel = "spring")
public interface TaskMapper extends EntityMapper<TaskDTO, Task> {
    @Mapping(target = "sprint", source = "sprint", qualifiedByName = "sprintName")
    @Mapping(target = "milestone", source = "milestone", qualifiedByName = "milestoneTitle")
    @Mapping(target = "assignedTo", source = "assignedTo", qualifiedByName = "employeeEmployeeNumber")
    @Mapping(target = "createdBy", source = "createdBy", qualifiedByName = "employeeEmployeeNumber")
    TaskDTO toDto(Task s);

    @Named("sprintName")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "name", source = "name")
    SprintDTO toDtoSprintName(Sprint sprint);

    @Named("milestoneTitle")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "title", source = "title")
    MilestoneDTO toDtoMilestoneTitle(Milestone milestone);

    @Named("employeeEmployeeNumber")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "employeeNumber", source = "employeeNumber")
    EmployeeDTO toDtoEmployeeEmployeeNumber(Employee employee);
}

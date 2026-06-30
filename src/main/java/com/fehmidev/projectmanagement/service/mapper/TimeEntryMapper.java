package com.fehmidev.projectmanagement.service.mapper;

import com.fehmidev.projectmanagement.domain.Employee;
import com.fehmidev.projectmanagement.domain.Task;
import com.fehmidev.projectmanagement.domain.TimeEntry;
import com.fehmidev.projectmanagement.service.dto.EmployeeDTO;
import com.fehmidev.projectmanagement.service.dto.TaskDTO;
import com.fehmidev.projectmanagement.service.dto.TimeEntryDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link TimeEntry} and its DTO {@link TimeEntryDTO}.
 */
@Mapper(componentModel = "spring")
public interface TimeEntryMapper extends EntityMapper<TimeEntryDTO, TimeEntry> {
    @Mapping(target = "task", source = "task", qualifiedByName = "taskTitle")
    @Mapping(target = "employee", source = "employee", qualifiedByName = "employeeFirstName")
    TimeEntryDTO toDto(TimeEntry s);

    @Named("taskTitle")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "title", source = "title")
    TaskDTO toDtoTaskTitle(Task task);

    @Named("employeeFirstName")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "firstName", source = "firstName")
    EmployeeDTO toDtoEmployeeFirstName(Employee employee);
}

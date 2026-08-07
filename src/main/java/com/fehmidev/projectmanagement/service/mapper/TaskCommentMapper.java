package com.fehmidev.projectmanagement.service.mapper;

import com.fehmidev.projectmanagement.domain.Employee;
import com.fehmidev.projectmanagement.domain.Task;
import com.fehmidev.projectmanagement.domain.TaskComment;
import com.fehmidev.projectmanagement.service.dto.EmployeeDTO;
import com.fehmidev.projectmanagement.service.dto.TaskCommentDTO;
import com.fehmidev.projectmanagement.service.dto.TaskDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link TaskComment} and its DTO {@link TaskCommentDTO}.
 */
@Mapper(componentModel = "spring")
public interface TaskCommentMapper extends EntityMapper<TaskCommentDTO, TaskComment> {
    @Mapping(target = "task", source = "task", qualifiedByName = "taskTitle")
    @Mapping(target = "employee", source = "employee", qualifiedByName = "employeeId")
    TaskCommentDTO toDto(TaskComment s);

    @Named("taskTitle")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "title", source = "title")
    TaskDTO toDtoTaskTitle(Task task);

    @Named("employeeId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "firstName", source = "firstName")
    @Mapping(target = "lastName", source = "lastName")
    EmployeeDTO toDtoEmployeeId(Employee employee);
}

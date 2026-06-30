package com.fehmidev.projectmanagement.service.mapper;

import com.fehmidev.projectmanagement.domain.Attachment;
import com.fehmidev.projectmanagement.domain.Employee;
import com.fehmidev.projectmanagement.domain.Task;
import com.fehmidev.projectmanagement.service.dto.AttachmentDTO;
import com.fehmidev.projectmanagement.service.dto.EmployeeDTO;
import com.fehmidev.projectmanagement.service.dto.TaskDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Attachment} and its DTO {@link AttachmentDTO}.
 */
@Mapper(componentModel = "spring")
public interface AttachmentMapper extends EntityMapper<AttachmentDTO, Attachment> {
    @Mapping(target = "task", source = "task", qualifiedByName = "taskTitle")
    @Mapping(target = "employee", source = "employee", qualifiedByName = "employeeFirstName")
    AttachmentDTO toDto(Attachment s);

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

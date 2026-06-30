package com.fehmidev.projectmanagement.service.mapper;

import com.fehmidev.projectmanagement.domain.Checklist;
import com.fehmidev.projectmanagement.domain.Task;
import com.fehmidev.projectmanagement.service.dto.ChecklistDTO;
import com.fehmidev.projectmanagement.service.dto.TaskDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Checklist} and its DTO {@link ChecklistDTO}.
 */
@Mapper(componentModel = "spring")
public interface ChecklistMapper extends EntityMapper<ChecklistDTO, Checklist> {
    @Mapping(target = "task", source = "task", qualifiedByName = "taskTitle")
    ChecklistDTO toDto(Checklist s);

    @Named("taskTitle")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "title", source = "title")
    TaskDTO toDtoTaskTitle(Task task);
}

package com.fehmidev.projectmanagement.service.mapper;

import com.fehmidev.projectmanagement.domain.Checklist;
import com.fehmidev.projectmanagement.domain.ChecklistItem;
import com.fehmidev.projectmanagement.service.dto.ChecklistDTO;
import com.fehmidev.projectmanagement.service.dto.ChecklistItemDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link ChecklistItem} and its DTO {@link ChecklistItemDTO}.
 */
@Mapper(componentModel = "spring")
public interface ChecklistItemMapper extends EntityMapper<ChecklistItemDTO, ChecklistItem> {
    @Mapping(target = "checklist", source = "checklist", qualifiedByName = "checklistTitle")
    ChecklistItemDTO toDto(ChecklistItem s);

    @Named("checklistTitle")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "title", source = "title")
    ChecklistDTO toDtoChecklistTitle(Checklist checklist);
}

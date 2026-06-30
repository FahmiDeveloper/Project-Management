package com.fehmidev.projectmanagement.service.mapper;

import com.fehmidev.projectmanagement.domain.Project;
import com.fehmidev.projectmanagement.domain.Sprint;
import com.fehmidev.projectmanagement.service.dto.ProjectDTO;
import com.fehmidev.projectmanagement.service.dto.SprintDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Sprint} and its DTO {@link SprintDTO}.
 */
@Mapper(componentModel = "spring")
public interface SprintMapper extends EntityMapper<SprintDTO, Sprint> {
    @Mapping(target = "project", source = "project", qualifiedByName = "projectName")
    SprintDTO toDto(Sprint s);

    @Named("projectName")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "name", source = "name")
    ProjectDTO toDtoProjectName(Project project);
}

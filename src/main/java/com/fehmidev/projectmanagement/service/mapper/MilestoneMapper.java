package com.fehmidev.projectmanagement.service.mapper;

import com.fehmidev.projectmanagement.domain.Milestone;
import com.fehmidev.projectmanagement.domain.Project;
import com.fehmidev.projectmanagement.service.dto.MilestoneDTO;
import com.fehmidev.projectmanagement.service.dto.ProjectDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Milestone} and its DTO {@link MilestoneDTO}.
 */
@Mapper(componentModel = "spring")
public interface MilestoneMapper extends EntityMapper<MilestoneDTO, Milestone> {
    @Mapping(target = "project", source = "project", qualifiedByName = "projectName")
    MilestoneDTO toDto(Milestone s);

    @Named("projectName")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "name", source = "name")
    ProjectDTO toDtoProjectName(Project project);
}

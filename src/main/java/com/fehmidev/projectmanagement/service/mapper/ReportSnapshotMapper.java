package com.fehmidev.projectmanagement.service.mapper;

import com.fehmidev.projectmanagement.domain.Project;
import com.fehmidev.projectmanagement.domain.ReportSnapshot;
import com.fehmidev.projectmanagement.service.dto.ProjectDTO;
import com.fehmidev.projectmanagement.service.dto.ReportSnapshotDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link ReportSnapshot} and its DTO {@link ReportSnapshotDTO}.
 */
@Mapper(componentModel = "spring")
public interface ReportSnapshotMapper extends EntityMapper<ReportSnapshotDTO, ReportSnapshot> {
    @Mapping(target = "project", source = "project", qualifiedByName = "projectName")
    ReportSnapshotDTO toDto(ReportSnapshot s);

    @Named("projectName")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "name", source = "name")
    ProjectDTO toDtoProjectName(Project project);
}

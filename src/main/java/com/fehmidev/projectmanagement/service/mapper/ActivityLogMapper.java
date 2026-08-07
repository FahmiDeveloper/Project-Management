package com.fehmidev.projectmanagement.service.mapper;

import com.fehmidev.projectmanagement.domain.ActivityLog;
import com.fehmidev.projectmanagement.domain.Employee;
import com.fehmidev.projectmanagement.service.dto.ActivityLogDTO;
import com.fehmidev.projectmanagement.service.dto.EmployeeDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link ActivityLog} and its DTO {@link ActivityLogDTO}.
 */
@Mapper(componentModel = "spring")
public interface ActivityLogMapper extends EntityMapper<ActivityLogDTO, ActivityLog> {
    @Mapping(target = "employee", source = "employee", qualifiedByName = "employeeId")
    ActivityLogDTO toDto(ActivityLog s);

    @Named("employeeId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "firstName", source = "firstName")
    @Mapping(target = "lastName", source = "lastName")
    EmployeeDTO toDtoEmployeeId(Employee employee);
}

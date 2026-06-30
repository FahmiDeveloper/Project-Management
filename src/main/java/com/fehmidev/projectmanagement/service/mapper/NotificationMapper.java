package com.fehmidev.projectmanagement.service.mapper;

import com.fehmidev.projectmanagement.domain.Employee;
import com.fehmidev.projectmanagement.domain.Notification;
import com.fehmidev.projectmanagement.service.dto.EmployeeDTO;
import com.fehmidev.projectmanagement.service.dto.NotificationDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Notification} and its DTO {@link NotificationDTO}.
 */
@Mapper(componentModel = "spring")
public interface NotificationMapper extends EntityMapper<NotificationDTO, Notification> {
    @Mapping(target = "employee", source = "employee", qualifiedByName = "employeeFirstName")
    NotificationDTO toDto(Notification s);

    @Named("employeeFirstName")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "firstName", source = "firstName")
    EmployeeDTO toDtoEmployeeFirstName(Employee employee);
}

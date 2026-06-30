package com.fehmidev.projectmanagement.service.mapper;

import com.fehmidev.projectmanagement.domain.Client;
import com.fehmidev.projectmanagement.service.dto.ClientDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Client} and its DTO {@link ClientDTO}.
 */
@Mapper(componentModel = "spring")
public interface ClientMapper extends EntityMapper<ClientDTO, Client> {}

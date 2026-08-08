package com.fehmidev.projectmanagement.service;

import com.fehmidev.projectmanagement.domain.Client;
import com.fehmidev.projectmanagement.repository.ClientRepository;
import com.fehmidev.projectmanagement.service.dto.ClientDTO;
import com.fehmidev.projectmanagement.service.mapper.ClientMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.fehmidev.projectmanagement.domain.Client}.
 */
@Service
@Transactional
public class ClientService {

    private static final Logger LOG = LoggerFactory.getLogger(ClientService.class);

    private final ClientRepository clientRepository;

    private final ClientMapper clientMapper;

    public ClientService(ClientRepository clientRepository, ClientMapper clientMapper) {
        this.clientRepository = clientRepository;
        this.clientMapper = clientMapper;
    }

    public ClientDTO save(ClientDTO clientDTO) {
        LOG.debug("Request to save Client : {}", clientDTO);
        Client client = clientMapper.toEntity(clientDTO);
        client = clientRepository.save(client);
        return clientMapper.toDto(client);
    }

    public ClientDTO update(ClientDTO clientDTO) {
        LOG.debug("Request to update Client : {}", clientDTO);
        Client client = clientMapper.toEntity(clientDTO);
        client = clientRepository.save(client);
        return clientMapper.toDto(client);
    }

    public Optional<ClientDTO> partialUpdate(ClientDTO clientDTO) {
        LOG.debug("Request to partially update Client : {}", clientDTO);

        return clientRepository
            .findById(clientDTO.getId())
            .map(existingClient -> {
                clientMapper.partialUpdate(existingClient, clientDTO);

                return existingClient;
            })
            .map(clientRepository::save)
            .map(clientMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Page<ClientDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all Clients");
        return clientRepository.findAll(pageable).map(clientMapper::toDto);
    }

    // NEW: filtered by company name
    @Transactional(readOnly = true)
    public Page<ClientDTO> findAll(String companyName, Pageable pageable) {
        LOG.debug("Request to get all Clients filtered by companyName: {}", companyName);
        if (companyName != null && !companyName.isBlank()) {
            return clientRepository.findByCompanyNameContainingIgnoreCase(companyName, pageable).map(clientMapper::toDto);
        }
        return clientRepository.findAll(pageable).map(clientMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Optional<ClientDTO> findOne(Long id) {
        LOG.debug("Request to get Client : {}", id);
        return clientRepository.findById(id).map(clientMapper::toDto);
    }

    public void delete(Long id) {
        LOG.debug("Request to delete Client : {}", id);
        clientRepository.deleteById(id);
    }
}

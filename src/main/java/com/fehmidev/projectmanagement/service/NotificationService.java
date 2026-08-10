package com.fehmidev.projectmanagement.service;

import com.fehmidev.projectmanagement.domain.Employee;
import com.fehmidev.projectmanagement.domain.Notification;
import com.fehmidev.projectmanagement.repository.NotificationRepository;
import com.fehmidev.projectmanagement.repository.NotificationSpecification;
import com.fehmidev.projectmanagement.service.dto.NotificationDTO;
import com.fehmidev.projectmanagement.service.mapper.NotificationMapper;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.fehmidev.projectmanagement.domain.Notification}.
 */
@Service
@Transactional
public class NotificationService {

    private static final Logger LOG = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;

    private final NotificationMapper notificationMapper;

    public NotificationService(NotificationRepository notificationRepository, NotificationMapper notificationMapper) {
        this.notificationRepository = notificationRepository;
        this.notificationMapper = notificationMapper;
    }

    /**
     * Save a notification.
     *
     * @param notificationDTO the entity to save.
     * @return the persisted entity.
     */
    public NotificationDTO save(NotificationDTO notificationDTO) {
        LOG.debug("Request to save Notification : {}", notificationDTO);
        Notification notification = notificationMapper.toEntity(notificationDTO);
        notification = notificationRepository.save(notification);
        return notificationMapper.toDto(notification);
    }

    /**
     * Update a notification.
     *
     * @param notificationDTO the entity to save.
     * @return the persisted entity.
     */
    public NotificationDTO update(NotificationDTO notificationDTO) {
        LOG.debug("Request to update Notification : {}", notificationDTO);
        Notification notification = notificationMapper.toEntity(notificationDTO);
        notification = notificationRepository.save(notification);
        return notificationMapper.toDto(notification);
    }

    /**
     * Partially update a notification.
     *
     * @param notificationDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<NotificationDTO> partialUpdate(NotificationDTO notificationDTO) {
        LOG.debug("Request to partially update Notification : {}", notificationDTO);

        return notificationRepository
            .findById(notificationDTO.getId())
            .map(existingNotification -> {
                notificationMapper.partialUpdate(existingNotification, notificationDTO);

                return existingNotification;
            })
            .map(notificationRepository::save)
            .map(notificationMapper::toDto);
    }

    /**
     * Get all the notifications.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<NotificationDTO> findAll(String title, Long employeeId, Pageable pageable) {
        LOG.debug("Request to get all Notifications filtered by title: {}, employeeId: {}", title, employeeId);
        Specification<Notification> spec = NotificationSpecification.withFilters(title, employeeId);
        return notificationRepository.findAll(spec, pageable).map(notificationMapper::toDto);
    }

    public Page<NotificationDTO> findAllWithEagerRelationships(Pageable pageable) {
        return findAll(null, null, pageable);
    }

    // NEW: eager, filtered
    public Page<NotificationDTO> findAllWithEagerRelationships(String title, Long employeeId, Pageable pageable) {
        LOG.debug("Request to get all Notifications (eager) filtered by title: {}, employeeId: {}", title, employeeId);
        return findAll(title, employeeId, pageable);
    }

    /**
     * Get one notification by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<NotificationDTO> findOne(Long id) {
        LOG.debug("Request to get Notification : {}", id);
        return notificationRepository.findOneWithEagerRelationships(id).map(notificationMapper::toDto);
    }

    /**
     * Delete the notification by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete Notification : {}", id);
        notificationRepository.deleteById(id);
    }

    /**
     * Save a notification with simple parameters (convenience method)
     *
     * @param title the notification title
     * @param message the notification message/body
     * @param type the notification type (WEB_PUSH, FCM, LOCAL)
     * @param employee the employee to associate with (can be null)
     * @return the persisted entity
     */
    public Notification saveNotification(String title, String message, String type, Employee employee) {
        LOG.debug("Request to save Notification : title={}, type={}", title, type);

        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setIsRead(false);
        notification.setCreatedDate(Instant.now());

        if (employee != null) {
            notification.setEmployee(employee);
        }

        notification = notificationRepository.save(notification);
        return notification;
    }

    /**
     * Save a notification for the current user
     */
    public Notification saveNotificationForCurrentUser(String title, String message, String type) {
        // You'll need to get the current user's employee
        // This is a placeholder - implement based on your security context
        Employee currentEmployee = getCurrentEmployee(); // You need to implement this
        return saveNotification(title, message, type, currentEmployee);
    }

    /**
     * Get current employee - implement this based on your authentication
     */
    private Employee getCurrentEmployee() {
        // Using Spring Security
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        // Get current user
        String username = authentication.getName();
        // Fetch Employee by username - you'll need to inject UserService or similar
        // return employeeRepository.findByUserLogin(username).orElse(null);
        return null; // Placeholder
    }

    /**
     * Get all notifications for the current user
     */
    @Transactional(readOnly = true)
    public List<NotificationDTO> getNotificationsForCurrentUser() {
        Employee currentEmployee = getCurrentEmployee();
        if (currentEmployee == null) {
            return new ArrayList<>();
        }
        return notificationRepository.findByEmployee(currentEmployee).stream().map(notificationMapper::toDto).collect(Collectors.toList());
    }

    /**
     * Mark a notification as read
     */
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository
            .findById(notificationId)
            .orElseThrow(() -> new RuntimeException("Notification not found with id: " + notificationId));

        notification.setIsRead(true);
        notificationRepository.save(notification);
    }
}

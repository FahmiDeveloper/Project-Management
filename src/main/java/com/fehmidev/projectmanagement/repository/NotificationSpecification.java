package com.fehmidev.projectmanagement.repository;

import com.fehmidev.projectmanagement.domain.Notification;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

public final class NotificationSpecification {

    private NotificationSpecification() {}

    public static Specification<Notification> withFilters(String title, Long employeeId) {
        return (root, query, cb) -> {
            Predicate predicate = cb.conjunction();

            if (title != null && !title.isBlank()) {
                predicate = cb.and(predicate, cb.like(cb.lower(root.get("title")), "%" + title.toLowerCase() + "%"));
            }
            if (employeeId != null) {
                predicate = cb.and(predicate, cb.equal(root.get("employee").get("id"), employeeId));
            }
            return predicate;
        };
    }
}

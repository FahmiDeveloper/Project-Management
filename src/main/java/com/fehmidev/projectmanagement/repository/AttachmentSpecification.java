package com.fehmidev.projectmanagement.repository;

import com.fehmidev.projectmanagement.domain.Attachment;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

public final class AttachmentSpecification {

    private AttachmentSpecification() {}

    public static Specification<Attachment> withFilters(String fileName, Long taskId, Long employeeId) {
        return (root, query, cb) -> {
            Predicate predicate = cb.conjunction();

            if (fileName != null && !fileName.isBlank()) {
                predicate = cb.and(predicate, cb.like(cb.lower(root.get("fileName")), "%" + fileName.toLowerCase() + "%"));
            }
            if (taskId != null) {
                predicate = cb.and(predicate, cb.equal(root.get("task").get("id"), taskId));
            }
            if (employeeId != null) {
                predicate = cb.and(predicate, cb.equal(root.get("employee").get("id"), employeeId));
            }
            return predicate;
        };
    }
}

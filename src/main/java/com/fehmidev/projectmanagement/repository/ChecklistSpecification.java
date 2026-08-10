package com.fehmidev.projectmanagement.repository;

import com.fehmidev.projectmanagement.domain.Checklist;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

public final class ChecklistSpecification {

    private ChecklistSpecification() {}

    public static Specification<Checklist> withFilters(String title, Long taskId) {
        return (root, query, cb) -> {
            Predicate predicate = cb.conjunction();

            if (title != null && !title.isBlank()) {
                predicate = cb.and(predicate, cb.like(cb.lower(root.get("title")), "%" + title.toLowerCase() + "%"));
            }
            if (taskId != null) {
                predicate = cb.and(predicate, cb.equal(root.get("task").get("id"), taskId));
            }
            return predicate;
        };
    }
}

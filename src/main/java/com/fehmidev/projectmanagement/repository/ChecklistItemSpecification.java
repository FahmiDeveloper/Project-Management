package com.fehmidev.projectmanagement.repository;

import com.fehmidev.projectmanagement.domain.ChecklistItem;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

public final class ChecklistItemSpecification {

    private ChecklistItemSpecification() {}

    public static Specification<ChecklistItem> withFilters(String content, Long checklistId) {
        return (root, query, cb) -> {
            Predicate predicate = cb.conjunction();

            if (content != null && !content.isBlank()) {
                predicate = cb.and(predicate, cb.like(cb.lower(root.get("content")), "%" + content.toLowerCase() + "%"));
            }
            if (checklistId != null) {
                predicate = cb.and(predicate, cb.equal(root.get("checklist").get("id"), checklistId));
            }
            return predicate;
        };
    }
}

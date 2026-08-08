package com.fehmidev.projectmanagement.repository;

import com.fehmidev.projectmanagement.domain.Sprint;
import com.fehmidev.projectmanagement.domain.enumeration.SprintStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

public final class SprintSpecification {

    private SprintSpecification() {}

    public static Specification<Sprint> withFilters(String name, SprintStatus status, Long projectId) {
        return (root, query, cb) -> {
            Predicate predicate = cb.conjunction();

            if (name != null && !name.isBlank()) {
                predicate = cb.and(predicate, cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%"));
            }
            if (status != null) {
                predicate = cb.and(predicate, cb.equal(root.get("status"), status));
            }
            if (projectId != null) {
                predicate = cb.and(predicate, cb.equal(root.get("project").get("id"), projectId));
            }
            return predicate;
        };
    }
}

package com.fehmidev.projectmanagement.repository;

import com.fehmidev.projectmanagement.domain.Milestone;
import com.fehmidev.projectmanagement.domain.enumeration.MilestoneStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

public final class MilestoneSpecification {

    private MilestoneSpecification() {}

    public static Specification<Milestone> withFilters(String title, MilestoneStatus status, Long projectId) {
        return (root, query, cb) -> {
            Predicate predicate = cb.conjunction();

            if (title != null && !title.isBlank()) {
                predicate = cb.and(predicate, cb.like(cb.lower(root.get("title")), "%" + title.toLowerCase() + "%"));
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

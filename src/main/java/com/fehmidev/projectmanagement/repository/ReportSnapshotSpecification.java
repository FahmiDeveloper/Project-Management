package com.fehmidev.projectmanagement.repository;

import com.fehmidev.projectmanagement.domain.ReportSnapshot;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

public final class ReportSnapshotSpecification {

    private ReportSnapshotSpecification() {}

    public static Specification<ReportSnapshot> withFilters(String name, Long projectId) {
        return (root, query, cb) -> {
            Predicate predicate = cb.conjunction();

            if (name != null && !name.isBlank()) {
                predicate = cb.and(predicate, cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%"));
            }
            if (projectId != null) {
                predicate = cb.and(predicate, cb.equal(root.get("project").get("id"), projectId));
            }
            return predicate;
        };
    }
}

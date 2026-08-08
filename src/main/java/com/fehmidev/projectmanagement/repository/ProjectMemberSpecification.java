package com.fehmidev.projectmanagement.repository;

import com.fehmidev.projectmanagement.domain.ProjectMember;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

public final class ProjectMemberSpecification {

    private ProjectMemberSpecification() {}

    public static Specification<ProjectMember> withFilters(Long projectId, Long employeeId) {
        return (root, query, cb) -> {
            Predicate predicate = cb.conjunction();

            if (projectId != null) {
                predicate = cb.and(predicate, cb.equal(root.get("project").get("id"), projectId));
            }
            if (employeeId != null) {
                predicate = cb.and(predicate, cb.equal(root.get("employee").get("id"), employeeId));
            }
            return predicate;
        };
    }
}

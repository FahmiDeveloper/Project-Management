package com.fehmidev.projectmanagement.repository;

import com.fehmidev.projectmanagement.domain.Project;
import com.fehmidev.projectmanagement.domain.enumeration.ProjectStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public final class ProjectSpecification {

    private ProjectSpecification() {}

    public static Specification<Project> withFilters(String name, ProjectStatus status, Long clientId, Long managerId) {
        return (root, query, cb) -> {
            Predicate predicate = cb.conjunction();

            if (StringUtils.hasText(name)) {
                predicate = cb.and(predicate, cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%"));
            }
            if (status != null) {
                predicate = cb.and(predicate, cb.equal(root.get("status"), status));
            }
            if (clientId != null) {
                predicate = cb.and(predicate, cb.equal(root.get("client").get("id"), clientId));
            }
            if (managerId != null) {
                predicate = cb.and(predicate, cb.equal(root.get("manager").get("id"), managerId));
            }
            return predicate;
        };
    }
}

package com.fehmidev.projectmanagement.repository;

import com.fehmidev.projectmanagement.domain.ProjectMember;
import com.fehmidev.projectmanagement.domain.enumeration.MemberRole;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.jpa.domain.Specification;

public class ProjectMemberSpecification {

    private ProjectMemberSpecification() {}

    public static Specification<ProjectMember> withFilters(Long projectId, Long employeeId, String role) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (projectId != null) {
                predicates.add(cb.equal(root.get("project").get("id"), projectId));
            }
            if (employeeId != null) {
                predicates.add(cb.equal(root.get("employee").get("id"), employeeId));
            }
            if (role != null && !role.isBlank()) {
                try {
                    predicates.add(cb.equal(root.get("role"), MemberRole.valueOf(role)));
                } catch (IllegalArgumentException e) {
                    // unknown role value — ignore filter rather than throw
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}

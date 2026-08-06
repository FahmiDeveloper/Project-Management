package com.fehmidev.projectmanagement.repository;

import com.fehmidev.projectmanagement.domain.Employee;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public final class EmployeeSpecification {

    private EmployeeSpecification() {}

    public static Specification<Employee> withFilters(String firstName, String jobTitle, Long departmentId) {
        return (root, query, cb) -> {
            Predicate predicate = cb.conjunction();

            if (StringUtils.hasText(firstName)) {
                predicate = cb.and(predicate, cb.like(cb.lower(root.get("firstName")), "%" + firstName.toLowerCase() + "%"));
            }
            if (StringUtils.hasText(jobTitle)) {
                predicate = cb.and(predicate, cb.like(cb.lower(root.get("jobTitle")), "%" + jobTitle.toLowerCase() + "%"));
            }
            if (departmentId != null) {
                predicate = cb.and(predicate, cb.equal(root.get("department").get("id"), departmentId));
            }
            return predicate;
        };
    }
}

package com.fehmidev.projectmanagement.repository;

import com.fehmidev.projectmanagement.domain.TimeEntry;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

public final class TimeEntrySpecification {

    private TimeEntrySpecification() {}

    public static Specification<TimeEntry> withFilters(Long taskId, Long employeeId) {
        return (root, query, cb) -> {
            Predicate predicate = cb.conjunction();

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

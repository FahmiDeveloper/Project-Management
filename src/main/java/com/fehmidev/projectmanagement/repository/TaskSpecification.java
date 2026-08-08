package com.fehmidev.projectmanagement.repository;

import com.fehmidev.projectmanagement.domain.Task;
import com.fehmidev.projectmanagement.domain.enumeration.TaskPriority;
import com.fehmidev.projectmanagement.domain.enumeration.TaskStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

public final class TaskSpecification {

    private TaskSpecification() {}

    public static Specification<Task> withFilters(
        String title,
        TaskStatus status,
        TaskPriority priority,
        Long assignedToId,
        Long sprintId,
        Long createdById
    ) {
        return (root, query, cb) -> {
            Predicate predicate = cb.conjunction();

            if (title != null && !title.isBlank()) {
                predicate = cb.and(predicate, cb.like(cb.lower(root.get("title")), "%" + title.toLowerCase() + "%"));
            }
            if (status != null) {
                predicate = cb.and(predicate, cb.equal(root.get("status"), status));
            }
            if (priority != null) {
                predicate = cb.and(predicate, cb.equal(root.get("priority"), priority));
            }
            if (assignedToId != null) {
                predicate = cb.and(predicate, cb.equal(root.get("assignedTo").get("id"), assignedToId));
            }
            if (sprintId != null) {
                predicate = cb.and(predicate, cb.equal(root.get("sprint").get("id"), sprintId));
            }
            if (createdById != null) {
                predicate = cb.and(predicate, cb.equal(root.get("createdBy").get("id"), createdById));
            }
            return predicate;
        };
    }
}

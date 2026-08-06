package com.fehmidev.projectmanagement.repository;

import com.fehmidev.projectmanagement.domain.Task;
import com.fehmidev.projectmanagement.domain.enumeration.TaskPriority;
import com.fehmidev.projectmanagement.domain.enumeration.TaskStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

public final class TaskSpecification {

    private TaskSpecification() {}

    public static Specification<Task> withFilters(TaskStatus status, TaskPriority priority, Long assignedToId, Long sprintId) {
        return (root, query, cb) -> {
            Predicate predicate = cb.conjunction();

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
            return predicate;
        };
    }
}

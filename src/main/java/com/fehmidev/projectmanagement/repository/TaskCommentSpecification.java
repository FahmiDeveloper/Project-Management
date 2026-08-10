package com.fehmidev.projectmanagement.repository;

import com.fehmidev.projectmanagement.domain.TaskComment;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

public final class TaskCommentSpecification {

    private TaskCommentSpecification() {}

    public static Specification<TaskComment> withFilters(String content, Long taskId, Long employeeId) {
        return (root, query, cb) -> {
            Predicate predicate = cb.conjunction();

            if (content != null && !content.isBlank()) {
                predicate = cb.and(predicate, cb.like(cb.lower(root.get("content")), "%" + content.toLowerCase() + "%"));
            }
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

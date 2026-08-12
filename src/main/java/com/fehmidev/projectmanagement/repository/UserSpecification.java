package com.fehmidev.projectmanagement.repository;

import com.fehmidev.projectmanagement.domain.User;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

public final class UserSpecification {

    private UserSpecification() {}

    public static Specification<User> withFilters(String login, String email) {
        return (root, query, cb) -> {
            Predicate predicate = cb.conjunction();

            if (login != null && !login.isBlank()) {
                predicate = cb.and(predicate, cb.like(cb.lower(root.get("login")), "%" + login.toLowerCase() + "%"));
            }
            if (email != null && !email.isBlank()) {
                predicate = cb.and(predicate, cb.like(cb.lower(root.get("email")), "%" + email.toLowerCase() + "%"));
            }
            return predicate;
        };
    }
}

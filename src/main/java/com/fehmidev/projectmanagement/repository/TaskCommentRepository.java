package com.fehmidev.projectmanagement.repository;

import com.fehmidev.projectmanagement.domain.TaskComment;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the TaskComment entity.
 */
@Repository
public interface TaskCommentRepository extends JpaRepository<TaskComment, Long>, JpaSpecificationExecutor<TaskComment> {
    default Optional<TaskComment> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<TaskComment> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<TaskComment> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAll((Specification<TaskComment>) null, pageable);
    }

    // NEW: eager fetch relationships while applying any Specification (content/task/employee filters)
    @EntityGraph(attributePaths = { "task", "employee" })
    @Override
    Page<TaskComment> findAll(Specification<TaskComment> spec, Pageable pageable);

    @Query("select taskComment from TaskComment taskComment left join fetch taskComment.task left join fetch taskComment.employee")
    List<TaskComment> findAllWithToOneRelationships();

    @Query(
        "select taskComment from TaskComment taskComment left join fetch taskComment.task left join fetch taskComment.employee where taskComment.id =:id"
    )
    Optional<TaskComment> findOneWithToOneRelationships(@Param("id") Long id);

    long countByEmployeeId(Long employeeId);
}

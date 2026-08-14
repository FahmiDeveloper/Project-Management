package com.fehmidev.projectmanagement.repository;

import com.fehmidev.projectmanagement.domain.Task;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Task entity.
 */
@Repository
public interface TaskRepository extends JpaRepository<Task, Long>, JpaSpecificationExecutor<Task> {
    default Optional<Task> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<Task> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<Task> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAll((Specification<Task>) null, pageable);
    }

    // NEW: eager fetch relationships while applying any Specification (status/priority/assignedTo/sprint filters)
    @EntityGraph(attributePaths = { "sprint", "milestone", "assignedTo", "createdBy" })
    @Override
    Page<Task> findAll(Specification<Task> spec, Pageable pageable);

    @Query(
        "select task from Task task left join fetch task.sprint left join fetch task.milestone left join fetch task.assignedTo left join fetch task.createdBy"
    )
    List<Task> findAllWithToOneRelationships();

    @Query(
        "select task from Task task left join fetch task.sprint left join fetch task.milestone left join fetch task.assignedTo left join fetch task.createdBy where task.id =:id"
    )
    Optional<Task> findOneWithToOneRelationships(@Param("id") Long id);

    long countByassignedToId(Long assignedToId);

    long countBycreatedById(Long createdById);
}

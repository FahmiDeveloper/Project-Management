package com.fehmidev.projectmanagement.repository;

import com.fehmidev.projectmanagement.domain.TimeEntry;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the TimeEntry entity.
 */
@Repository
public interface TimeEntryRepository extends JpaRepository<TimeEntry, Long>, JpaSpecificationExecutor<TimeEntry> {
    default Optional<TimeEntry> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<TimeEntry> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<TimeEntry> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAll((Specification<TimeEntry>) null, pageable);
    }

    // NEW: eager fetch relationships while applying any Specification (task/employee filters)
    @EntityGraph(attributePaths = { "task", "employee" })
    @Override
    Page<TimeEntry> findAll(Specification<TimeEntry> spec, Pageable pageable);

    @Query("select timeEntry from TimeEntry timeEntry left join fetch timeEntry.task left join fetch timeEntry.employee")
    List<TimeEntry> findAllWithToOneRelationships();

    @Query(
        "select timeEntry from TimeEntry timeEntry left join fetch timeEntry.task left join fetch timeEntry.employee where timeEntry.id =:id"
    )
    Optional<TimeEntry> findOneWithToOneRelationships(@Param("id") Long id);

    long countByTaskId(Long taskId);

    long countByEmployeeId(Long employeeId);
}

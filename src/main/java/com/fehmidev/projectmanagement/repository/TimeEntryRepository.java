package com.fehmidev.projectmanagement.repository;

import com.fehmidev.projectmanagement.domain.TimeEntry;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the TimeEntry entity.
 */
@Repository
public interface TimeEntryRepository extends JpaRepository<TimeEntry, Long> {
    default Optional<TimeEntry> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<TimeEntry> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<TimeEntry> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAllWithToOneRelationships(pageable);
    }

    @Query(
        value = "select timeEntry from TimeEntry timeEntry left join fetch timeEntry.task left join fetch timeEntry.employee",
        countQuery = "select count(timeEntry) from TimeEntry timeEntry"
    )
    Page<TimeEntry> findAllWithToOneRelationships(Pageable pageable);

    @Query("select timeEntry from TimeEntry timeEntry left join fetch timeEntry.task left join fetch timeEntry.employee")
    List<TimeEntry> findAllWithToOneRelationships();

    @Query(
        "select timeEntry from TimeEntry timeEntry left join fetch timeEntry.task left join fetch timeEntry.employee where timeEntry.id =:id"
    )
    Optional<TimeEntry> findOneWithToOneRelationships(@Param("id") Long id);
}

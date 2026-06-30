package com.fehmidev.projectmanagement.repository;

import com.fehmidev.projectmanagement.domain.ActivityLog;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the ActivityLog entity.
 */
@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    default Optional<ActivityLog> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<ActivityLog> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<ActivityLog> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAllWithToOneRelationships(pageable);
    }

    @Query(
        value = "select activityLog from ActivityLog activityLog left join fetch activityLog.employee",
        countQuery = "select count(activityLog) from ActivityLog activityLog"
    )
    Page<ActivityLog> findAllWithToOneRelationships(Pageable pageable);

    @Query("select activityLog from ActivityLog activityLog left join fetch activityLog.employee")
    List<ActivityLog> findAllWithToOneRelationships();

    @Query("select activityLog from ActivityLog activityLog left join fetch activityLog.employee where activityLog.id =:id")
    Optional<ActivityLog> findOneWithToOneRelationships(@Param("id") Long id);
}

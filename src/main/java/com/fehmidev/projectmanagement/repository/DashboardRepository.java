package com.fehmidev.projectmanagement.repository;

import com.fehmidev.projectmanagement.domain.Dashboard;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Dashboard entity.
 */
@Repository
public interface DashboardRepository extends JpaRepository<Dashboard, Long> {
    default Optional<Dashboard> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<Dashboard> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<Dashboard> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAllWithToOneRelationships(pageable);
    }

    @Query(
        value = "select dashboard from Dashboard dashboard left join fetch dashboard.employee left join fetch dashboard.project",
        countQuery = "select count(dashboard) from Dashboard dashboard"
    )
    Page<Dashboard> findAllWithToOneRelationships(Pageable pageable);

    @Query("select dashboard from Dashboard dashboard left join fetch dashboard.employee left join fetch dashboard.project")
    List<Dashboard> findAllWithToOneRelationships();

    @Query(
        "select dashboard from Dashboard dashboard left join fetch dashboard.employee left join fetch dashboard.project where dashboard.id =:id"
    )
    Optional<Dashboard> findOneWithToOneRelationships(@Param("id") Long id);
}

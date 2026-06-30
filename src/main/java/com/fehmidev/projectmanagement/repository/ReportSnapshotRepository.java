package com.fehmidev.projectmanagement.repository;

import com.fehmidev.projectmanagement.domain.ReportSnapshot;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the ReportSnapshot entity.
 */
@Repository
public interface ReportSnapshotRepository extends JpaRepository<ReportSnapshot, Long> {
    default Optional<ReportSnapshot> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<ReportSnapshot> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<ReportSnapshot> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAllWithToOneRelationships(pageable);
    }

    @Query(
        value = "select reportSnapshot from ReportSnapshot reportSnapshot left join fetch reportSnapshot.project",
        countQuery = "select count(reportSnapshot) from ReportSnapshot reportSnapshot"
    )
    Page<ReportSnapshot> findAllWithToOneRelationships(Pageable pageable);

    @Query("select reportSnapshot from ReportSnapshot reportSnapshot left join fetch reportSnapshot.project")
    List<ReportSnapshot> findAllWithToOneRelationships();

    @Query("select reportSnapshot from ReportSnapshot reportSnapshot left join fetch reportSnapshot.project where reportSnapshot.id =:id")
    Optional<ReportSnapshot> findOneWithToOneRelationships(@Param("id") Long id);
}

package com.fehmidev.projectmanagement.repository;

import com.fehmidev.projectmanagement.domain.Milestone;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Milestone entity.
 */
@Repository
public interface MilestoneRepository extends JpaRepository<Milestone, Long>, JpaSpecificationExecutor<Milestone> {
    default Optional<Milestone> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<Milestone> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<Milestone> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAll((Specification<Milestone>) null, pageable);
    }

    // NEW: eager fetch relationships while applying any Specification (title/status/project filters)
    @EntityGraph(attributePaths = { "project" })
    @Override
    Page<Milestone> findAll(Specification<Milestone> spec, Pageable pageable);

    @Query("select milestone from Milestone milestone left join fetch milestone.project")
    List<Milestone> findAllWithToOneRelationships();

    @Query("select milestone from Milestone milestone left join fetch milestone.project where milestone.id =:id")
    Optional<Milestone> findOneWithToOneRelationships(@Param("id") Long id);

    long countByProjectId(Long projectId);
}

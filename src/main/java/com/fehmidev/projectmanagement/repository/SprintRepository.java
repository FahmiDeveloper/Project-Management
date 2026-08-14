package com.fehmidev.projectmanagement.repository;

import com.fehmidev.projectmanagement.domain.Sprint;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Sprint entity.
 */
@Repository
public interface SprintRepository extends JpaRepository<Sprint, Long>, JpaSpecificationExecutor<Sprint> {
    default Optional<Sprint> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<Sprint> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<Sprint> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAll((Specification<Sprint>) null, pageable);
    }

    // NEW: eager fetch relationships while applying any Specification (name/status/project filters)
    @EntityGraph(attributePaths = { "project" })
    @Override
    Page<Sprint> findAll(Specification<Sprint> spec, Pageable pageable);

    @Query("select sprint from Sprint sprint left join fetch sprint.project")
    List<Sprint> findAllWithToOneRelationships();

    @Query("select sprint from Sprint sprint left join fetch sprint.project where sprint.id =:id")
    Optional<Sprint> findOneWithToOneRelationships(@Param("id") Long id);

    long countByProjectId(Long projectId);
}

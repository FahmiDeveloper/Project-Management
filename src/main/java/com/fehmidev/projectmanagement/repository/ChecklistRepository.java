package com.fehmidev.projectmanagement.repository;

import com.fehmidev.projectmanagement.domain.Checklist;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Checklist entity.
 */
@Repository
public interface ChecklistRepository extends JpaRepository<Checklist, Long>, JpaSpecificationExecutor<Checklist> {
    default Optional<Checklist> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<Checklist> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<Checklist> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAll((Specification<Checklist>) null, pageable);
    }

    // NEW: eager fetch relationships while applying any Specification (title/task filters)
    @EntityGraph(attributePaths = { "task" })
    @Override
    Page<Checklist> findAll(Specification<Checklist> spec, Pageable pageable);

    @Query("select checklist from Checklist checklist left join fetch checklist.task")
    List<Checklist> findAllWithToOneRelationships();

    @Query("select checklist from Checklist checklist left join fetch checklist.task where checklist.id =:id")
    Optional<Checklist> findOneWithToOneRelationships(@Param("id") Long id);
}

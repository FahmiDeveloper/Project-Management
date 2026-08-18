package com.fehmidev.projectmanagement.repository;

import com.fehmidev.projectmanagement.domain.ChecklistItem;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the ChecklistItem entity.
 */
@Repository
public interface ChecklistItemRepository extends JpaRepository<ChecklistItem, Long>, JpaSpecificationExecutor<ChecklistItem> {
    default Optional<ChecklistItem> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<ChecklistItem> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<ChecklistItem> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAll((Specification<ChecklistItem>) null, pageable);
    }

    // NEW: eager fetch relationships while applying any Specification (content/checklist filters)
    @EntityGraph(attributePaths = { "checklist" })
    @Override
    Page<ChecklistItem> findAll(Specification<ChecklistItem> spec, Pageable pageable);

    @Query("select checklistItem from ChecklistItem checklistItem left join fetch checklistItem.checklist")
    List<ChecklistItem> findAllWithToOneRelationships();

    @Query("select checklistItem from ChecklistItem checklistItem left join fetch checklistItem.checklist where checklistItem.id =:id")
    Optional<ChecklistItem> findOneWithToOneRelationships(@Param("id") Long id);

    long countByChecklistId(Long checklistId);
}

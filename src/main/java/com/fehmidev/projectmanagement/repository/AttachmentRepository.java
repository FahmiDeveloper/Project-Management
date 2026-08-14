package com.fehmidev.projectmanagement.repository;

import com.fehmidev.projectmanagement.domain.Attachment;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Attachment entity.
 */
@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, Long>, JpaSpecificationExecutor<Attachment> {
    default Optional<Attachment> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<Attachment> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<Attachment> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAll((Specification<Attachment>) null, pageable);
    }

    // NEW: eager fetch relationships while applying any Specification (fileName/task/employee filters)
    @EntityGraph(attributePaths = { "task", "employee" })
    @Override
    Page<Attachment> findAll(Specification<Attachment> spec, Pageable pageable);

    @Query("select attachment from Attachment attachment left join fetch attachment.task left join fetch attachment.employee")
    List<Attachment> findAllWithToOneRelationships();

    @Query(
        "select attachment from Attachment attachment left join fetch attachment.task left join fetch attachment.employee where attachment.id =:id"
    )
    Optional<Attachment> findOneWithToOneRelationships(@Param("id") Long id);

    long countByEmployeeId(Long employeeId);
}

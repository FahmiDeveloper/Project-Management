package com.fehmidev.projectmanagement.repository;

import com.fehmidev.projectmanagement.domain.ProjectMember;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the ProjectMember entity.
 */
@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long>, JpaSpecificationExecutor<ProjectMember> {
    default Optional<ProjectMember> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<ProjectMember> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<ProjectMember> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAll((Specification<ProjectMember>) null, pageable);
    }

    // NEW: eager fetch relationships while applying any Specification (project/employee/role filters)
    @EntityGraph(attributePaths = { "project", "employee" })
    @Override
    Page<ProjectMember> findAll(Specification<ProjectMember> spec, Pageable pageable);

    @Query(
        "select projectMember from ProjectMember projectMember left join fetch projectMember.project left join fetch projectMember.employee"
    )
    List<ProjectMember> findAllWithToOneRelationships();

    @Query(
        "select projectMember from ProjectMember projectMember left join fetch projectMember.project left join fetch projectMember.employee where projectMember.id =:id"
    )
    Optional<ProjectMember> findOneWithToOneRelationships(@Param("id") Long id);

    long countByProjectId(Long projectId);
}

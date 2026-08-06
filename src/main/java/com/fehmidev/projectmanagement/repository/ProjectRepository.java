package com.fehmidev.projectmanagement.repository;

import com.fehmidev.projectmanagement.domain.Project;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long>, JpaSpecificationExecutor<Project> {
    default Optional<Project> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<Project> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    // NEW: eager fetch client + manager while applying any Specification (name/status/client/manager filters)
    @EntityGraph(attributePaths = { "client", "manager" })
    @Override
    Page<Project> findAll(Specification<Project> spec, Pageable pageable);

    @Query("select project from Project project left join fetch project.client left join fetch project.manager")
    List<Project> findAllWithToOneRelationships();

    @Query("select project from Project project left join fetch project.client left join fetch project.manager where project.id =:id")
    Optional<Project> findOneWithToOneRelationships(@Param("id") Long id);
}

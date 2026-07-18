package com.fehmidev.projectmanagement.repository;

import com.fehmidev.projectmanagement.domain.Project;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Project entity.
 */
@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    default Optional<Project> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<Project> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<Project> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAllWithToOneRelationships(pageable);
    }

    @Query(
        value = "select project from Project project left join fetch project.client left join fetch project.manager",
        countQuery = "select count(project) from Project project"
    )
    Page<Project> findAllWithToOneRelationships(Pageable pageable);

    @Query("select project from Project project left join fetch project.client left join fetch project.manager")
    List<Project> findAllWithToOneRelationships();

    @Query("select project from Project project left join fetch project.client left join fetch project.manager where project.id =:id")
    Optional<Project> findOneWithToOneRelationships(@Param("id") Long id);
}

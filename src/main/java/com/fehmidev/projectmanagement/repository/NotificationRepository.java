package com.fehmidev.projectmanagement.repository;

import com.fehmidev.projectmanagement.domain.Employee;
import com.fehmidev.projectmanagement.domain.Notification;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Notification entity.
 */
@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long>, JpaSpecificationExecutor<Notification> {
    default Optional<Notification> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<Notification> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<Notification> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAll((Specification<Notification>) null, pageable);
    }

    // NEW: eager fetch relationships while applying any Specification (title/employee filters)
    @EntityGraph(attributePaths = { "employee" })
    @Override
    Page<Notification> findAll(Specification<Notification> spec, Pageable pageable);

    @Query("select notification from Notification notification left join fetch notification.employee")
    List<Notification> findAllWithToOneRelationships();

    @Query("select notification from Notification notification left join fetch notification.employee where notification.id =:id")
    Optional<Notification> findOneWithToOneRelationships(@Param("id") Long id);

    List<Notification> findByEmployee(Employee employee);

    Page<Notification> findByEmployee(Employee employee, Pageable pageable);
}

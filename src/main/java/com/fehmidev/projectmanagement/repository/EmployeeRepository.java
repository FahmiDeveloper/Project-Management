package com.fehmidev.projectmanagement.repository;

import com.fehmidev.projectmanagement.domain.Employee;
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

/**
 * Spring Data JPA repository for the Employee entity.
 */
@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long>, JpaSpecificationExecutor<Employee> {
    default Optional<Employee> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<Employee> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<Employee> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAll((Specification<Employee>) null, pageable);
    }

    // NEW: eager fetch user + department while applying any Specification (name/jobTitle/department filters)
    @EntityGraph(attributePaths = { "user", "department" })
    @Override
    Page<Employee> findAll(Specification<Employee> spec, Pageable pageable);

    @Query("select employee from Employee employee left join fetch employee.user left join fetch employee.department")
    List<Employee> findAllWithToOneRelationships();

    @Query(
        "select employee from Employee employee left join fetch employee.user left join fetch employee.department where employee.id =:id"
    )
    Optional<Employee> findOneWithToOneRelationships(@Param("id") Long id);

    long countByDepartmentId(Long departmentId);

    // NEW: lightweight projection used to compute the next EMP-XXX sequence number
    // without loading full Employee entities (or their relationships).
    @Query("select employee.employeeNumber from Employee employee")
    List<String> findAllEmployeeNumbers();

    boolean existsByUserId(Long userId);

    // NEW: resolves the Employee linked to a given User's login. Used to attribute
    // actions performed by the currently authenticated user (e.g. test push notifications)
    // to their Employee record.
    Optional<Employee> findOneByUserLogin(String login);
}

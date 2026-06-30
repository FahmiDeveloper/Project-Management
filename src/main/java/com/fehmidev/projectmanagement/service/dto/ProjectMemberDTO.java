package com.fehmidev.projectmanagement.service.dto;

import com.fehmidev.projectmanagement.domain.enumeration.MemberRole;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;

/**
 * A DTO for the {@link com.fehmidev.projectmanagement.domain.ProjectMember} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class ProjectMemberDTO implements Serializable {

    private Long id;

    @NotNull
    private MemberRole role;

    @NotNull
    private LocalDate joinedDate;

    @NotNull
    private Boolean active;

    private ProjectDTO project;

    private EmployeeDTO employee;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public MemberRole getRole() {
        return role;
    }

    public void setRole(MemberRole role) {
        this.role = role;
    }

    public LocalDate getJoinedDate() {
        return joinedDate;
    }

    public void setJoinedDate(LocalDate joinedDate) {
        this.joinedDate = joinedDate;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public ProjectDTO getProject() {
        return project;
    }

    public void setProject(ProjectDTO project) {
        this.project = project;
    }

    public EmployeeDTO getEmployee() {
        return employee;
    }

    public void setEmployee(EmployeeDTO employee) {
        this.employee = employee;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof ProjectMemberDTO)) {
            return false;
        }

        ProjectMemberDTO projectMemberDTO = (ProjectMemberDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, projectMemberDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ProjectMemberDTO{" +
            "id=" + getId() +
            ", role='" + getRole() + "'" +
            ", joinedDate='" + getJoinedDate() + "'" +
            ", active='" + getActive() + "'" +
            ", project=" + getProject() +
            ", employee=" + getEmployee() +
            "}";
    }
}

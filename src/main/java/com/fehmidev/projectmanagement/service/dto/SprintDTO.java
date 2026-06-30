package com.fehmidev.projectmanagement.service.dto;

import com.fehmidev.projectmanagement.domain.enumeration.SprintStatus;
import jakarta.persistence.Lob;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;

/**
 * A DTO for the {@link com.fehmidev.projectmanagement.domain.Sprint} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class SprintDTO implements Serializable {

    private Long id;

    @NotNull
    @Size(min = 2, max = 100)
    private String name;

    private String goal;

    @NotNull
    private LocalDate startDate;

    @NotNull
    private LocalDate endDate;

    @NotNull
    private SprintStatus status;

    @Min(value = 1)
    private Integer capacity;

    @Min(value = 0)
    private Integer velocity;

    private ProjectDTO project;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getGoal() {
        return goal;
    }

    public void setGoal(String goal) {
        this.goal = goal;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public SprintStatus getStatus() {
        return status;
    }

    public void setStatus(SprintStatus status) {
        this.status = status;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public Integer getVelocity() {
        return velocity;
    }

    public void setVelocity(Integer velocity) {
        this.velocity = velocity;
    }

    public ProjectDTO getProject() {
        return project;
    }

    public void setProject(ProjectDTO project) {
        this.project = project;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof SprintDTO)) {
            return false;
        }

        SprintDTO sprintDTO = (SprintDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, sprintDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "SprintDTO{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", goal='" + getGoal() + "'" +
            ", startDate='" + getStartDate() + "'" +
            ", endDate='" + getEndDate() + "'" +
            ", status='" + getStatus() + "'" +
            ", capacity=" + getCapacity() +
            ", velocity=" + getVelocity() +
            ", project=" + getProject() +
            "}";
    }
}

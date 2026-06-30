package com.fehmidev.projectmanagement.service.dto;

import com.fehmidev.projectmanagement.domain.enumeration.TaskPriority;
import com.fehmidev.projectmanagement.domain.enumeration.TaskStatus;
import jakarta.persistence.Lob;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;

/**
 * A DTO for the {@link com.fehmidev.projectmanagement.domain.Task} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class TaskDTO implements Serializable {

    private Long id;

    @NotNull
    @Size(min = 2, max = 200)
    private String title;

    private String description;

    @NotNull
    private TaskPriority priority;

    @NotNull
    private TaskStatus status;

    @Min(value = 1)
    @Max(value = 100)
    private Integer storyPoints;

    @DecimalMin(value = "0")
    private Double estimatedHours;

    @DecimalMin(value = "0")
    private Double spentHours;

    private LocalDate startDate;

    private LocalDate dueDate;

    @NotNull
    @Min(value = 0)
    @Max(value = 100)
    private Integer completionPercentage;

    private SprintDTO sprint;

    private MilestoneDTO milestone;

    private EmployeeDTO assignedTo;

    private EmployeeDTO createdBy;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public TaskPriority getPriority() {
        return priority;
    }

    public void setPriority(TaskPriority priority) {
        this.priority = priority;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
    }

    public Integer getStoryPoints() {
        return storyPoints;
    }

    public void setStoryPoints(Integer storyPoints) {
        this.storyPoints = storyPoints;
    }

    public Double getEstimatedHours() {
        return estimatedHours;
    }

    public void setEstimatedHours(Double estimatedHours) {
        this.estimatedHours = estimatedHours;
    }

    public Double getSpentHours() {
        return spentHours;
    }

    public void setSpentHours(Double spentHours) {
        this.spentHours = spentHours;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public Integer getCompletionPercentage() {
        return completionPercentage;
    }

    public void setCompletionPercentage(Integer completionPercentage) {
        this.completionPercentage = completionPercentage;
    }

    public SprintDTO getSprint() {
        return sprint;
    }

    public void setSprint(SprintDTO sprint) {
        this.sprint = sprint;
    }

    public MilestoneDTO getMilestone() {
        return milestone;
    }

    public void setMilestone(MilestoneDTO milestone) {
        this.milestone = milestone;
    }

    public EmployeeDTO getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(EmployeeDTO assignedTo) {
        this.assignedTo = assignedTo;
    }

    public EmployeeDTO getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(EmployeeDTO createdBy) {
        this.createdBy = createdBy;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof TaskDTO)) {
            return false;
        }

        TaskDTO taskDTO = (TaskDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, taskDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "TaskDTO{" +
            "id=" + getId() +
            ", title='" + getTitle() + "'" +
            ", description='" + getDescription() + "'" +
            ", priority='" + getPriority() + "'" +
            ", status='" + getStatus() + "'" +
            ", storyPoints=" + getStoryPoints() +
            ", estimatedHours=" + getEstimatedHours() +
            ", spentHours=" + getSpentHours() +
            ", startDate='" + getStartDate() + "'" +
            ", dueDate='" + getDueDate() + "'" +
            ", completionPercentage=" + getCompletionPercentage() +
            ", sprint=" + getSprint() +
            ", milestone=" + getMilestone() +
            ", assignedTo=" + getAssignedTo() +
            ", createdBy=" + getCreatedBy() +
            "}";
    }
}

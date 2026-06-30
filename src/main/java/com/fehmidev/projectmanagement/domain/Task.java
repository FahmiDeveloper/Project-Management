package com.fehmidev.projectmanagement.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fehmidev.projectmanagement.domain.enumeration.TaskPriority;
import com.fehmidev.projectmanagement.domain.enumeration.TaskStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.LocalDate;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * A Task.
 */
@Entity
@Table(name = "task")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Task implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Size(min = 2, max = 200)
    @Column(name = "title", length = 200, nullable = false)
    private String title;

    @Lob
    @Column(name = "description")
    private String description;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false)
    private TaskPriority priority;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private TaskStatus status;

    @Min(value = 1)
    @Max(value = 100)
    @Column(name = "story_points")
    private Integer storyPoints;

    @DecimalMin(value = "0")
    @Column(name = "estimated_hours")
    private Double estimatedHours;

    @DecimalMin(value = "0")
    @Column(name = "spent_hours")
    private Double spentHours;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @NotNull
    @Min(value = 0)
    @Max(value = 100)
    @Column(name = "completion_percentage", nullable = false)
    private Integer completionPercentage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "project" }, allowSetters = true)
    private Sprint sprint;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "project" }, allowSetters = true)
    private Milestone milestone;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "user", "department" }, allowSetters = true)
    private Employee assignedTo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "user", "department" }, allowSetters = true)
    private Employee createdBy;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Task id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return this.title;
    }

    public Task title(String title) {
        this.setTitle(title);
        return this;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return this.description;
    }

    public Task description(String description) {
        this.setDescription(description);
        return this;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public TaskPriority getPriority() {
        return this.priority;
    }

    public Task priority(TaskPriority priority) {
        this.setPriority(priority);
        return this;
    }

    public void setPriority(TaskPriority priority) {
        this.priority = priority;
    }

    public TaskStatus getStatus() {
        return this.status;
    }

    public Task status(TaskStatus status) {
        this.setStatus(status);
        return this;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
    }

    public Integer getStoryPoints() {
        return this.storyPoints;
    }

    public Task storyPoints(Integer storyPoints) {
        this.setStoryPoints(storyPoints);
        return this;
    }

    public void setStoryPoints(Integer storyPoints) {
        this.storyPoints = storyPoints;
    }

    public Double getEstimatedHours() {
        return this.estimatedHours;
    }

    public Task estimatedHours(Double estimatedHours) {
        this.setEstimatedHours(estimatedHours);
        return this;
    }

    public void setEstimatedHours(Double estimatedHours) {
        this.estimatedHours = estimatedHours;
    }

    public Double getSpentHours() {
        return this.spentHours;
    }

    public Task spentHours(Double spentHours) {
        this.setSpentHours(spentHours);
        return this;
    }

    public void setSpentHours(Double spentHours) {
        this.spentHours = spentHours;
    }

    public LocalDate getStartDate() {
        return this.startDate;
    }

    public Task startDate(LocalDate startDate) {
        this.setStartDate(startDate);
        return this;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getDueDate() {
        return this.dueDate;
    }

    public Task dueDate(LocalDate dueDate) {
        this.setDueDate(dueDate);
        return this;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public Integer getCompletionPercentage() {
        return this.completionPercentage;
    }

    public Task completionPercentage(Integer completionPercentage) {
        this.setCompletionPercentage(completionPercentage);
        return this;
    }

    public void setCompletionPercentage(Integer completionPercentage) {
        this.completionPercentage = completionPercentage;
    }

    public Sprint getSprint() {
        return this.sprint;
    }

    public void setSprint(Sprint sprint) {
        this.sprint = sprint;
    }

    public Task sprint(Sprint sprint) {
        this.setSprint(sprint);
        return this;
    }

    public Milestone getMilestone() {
        return this.milestone;
    }

    public void setMilestone(Milestone milestone) {
        this.milestone = milestone;
    }

    public Task milestone(Milestone milestone) {
        this.setMilestone(milestone);
        return this;
    }

    public Employee getAssignedTo() {
        return this.assignedTo;
    }

    public void setAssignedTo(Employee employee) {
        this.assignedTo = employee;
    }

    public Task assignedTo(Employee employee) {
        this.setAssignedTo(employee);
        return this;
    }

    public Employee getCreatedBy() {
        return this.createdBy;
    }

    public void setCreatedBy(Employee employee) {
        this.createdBy = employee;
    }

    public Task createdBy(Employee employee) {
        this.setCreatedBy(employee);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Task)) {
            return false;
        }
        return getId() != null && getId().equals(((Task) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Task{" +
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
            "}";
    }
}

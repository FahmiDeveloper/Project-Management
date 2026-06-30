package com.fehmidev.projectmanagement.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;

/**
 * A DTO for the {@link com.fehmidev.projectmanagement.domain.Checklist} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class ChecklistDTO implements Serializable {

    private Long id;

    @NotNull
    private String title;

    @NotNull
    private Instant createdDate;

    private TaskDTO task;

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

    public Instant getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(Instant createdDate) {
        this.createdDate = createdDate;
    }

    public TaskDTO getTask() {
        return task;
    }

    public void setTask(TaskDTO task) {
        this.task = task;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof ChecklistDTO)) {
            return false;
        }

        ChecklistDTO checklistDTO = (ChecklistDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, checklistDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ChecklistDTO{" +
            "id=" + getId() +
            ", title='" + getTitle() + "'" +
            ", createdDate='" + getCreatedDate() + "'" +
            ", task=" + getTask() +
            "}";
    }
}

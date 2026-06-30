package com.fehmidev.projectmanagement.service.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Lob;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;

/**
 * A DTO for the {@link com.fehmidev.projectmanagement.domain.TaskComment} entity.
 */
@Schema(description = "ENTITIES")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class TaskCommentDTO implements Serializable {

    private Long id;

    @Lob
    private String content;

    @NotNull
    private Instant createdDate;

    private TaskDTO task;

    private EmployeeDTO employee;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
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
        if (!(o instanceof TaskCommentDTO)) {
            return false;
        }

        TaskCommentDTO taskCommentDTO = (TaskCommentDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, taskCommentDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "TaskCommentDTO{" +
            "id=" + getId() +
            ", content='" + getContent() + "'" +
            ", createdDate='" + getCreatedDate() + "'" +
            ", task=" + getTask() +
            ", employee=" + getEmployee() +
            "}";
    }
}

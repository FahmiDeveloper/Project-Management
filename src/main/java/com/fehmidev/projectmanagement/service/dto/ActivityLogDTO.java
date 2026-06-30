package com.fehmidev.projectmanagement.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;

/**
 * A DTO for the {@link com.fehmidev.projectmanagement.domain.ActivityLog} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class ActivityLogDTO implements Serializable {

    private Long id;

    @NotNull
    private String action;

    @NotNull
    private String entityName;

    private Long entityId;

    private String description;

    @NotNull
    private Instant createdDate;

    private EmployeeDTO employee;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getEntityName() {
        return entityName;
    }

    public void setEntityName(String entityName) {
        this.entityName = entityName;
    }

    public Long getEntityId() {
        return entityId;
    }

    public void setEntityId(Long entityId) {
        this.entityId = entityId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Instant getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(Instant createdDate) {
        this.createdDate = createdDate;
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
        if (!(o instanceof ActivityLogDTO)) {
            return false;
        }

        ActivityLogDTO activityLogDTO = (ActivityLogDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, activityLogDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ActivityLogDTO{" +
            "id=" + getId() +
            ", action='" + getAction() + "'" +
            ", entityName='" + getEntityName() + "'" +
            ", entityId=" + getEntityId() +
            ", description='" + getDescription() + "'" +
            ", createdDate='" + getCreatedDate() + "'" +
            ", employee=" + getEmployee() +
            "}";
    }
}

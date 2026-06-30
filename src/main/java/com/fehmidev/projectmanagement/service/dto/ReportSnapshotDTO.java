package com.fehmidev.projectmanagement.service.dto;

import jakarta.persistence.Lob;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;

/**
 * A DTO for the {@link com.fehmidev.projectmanagement.domain.ReportSnapshot} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class ReportSnapshotDTO implements Serializable {

    private Long id;

    @NotNull
    private String name;

    @NotNull
    private String type;

    @NotNull
    private Instant generatedDate;

    @Lob
    private String data;

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

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Instant getGeneratedDate() {
        return generatedDate;
    }

    public void setGeneratedDate(Instant generatedDate) {
        this.generatedDate = generatedDate;
    }

    public String getData() {
        return data;
    }

    public void setData(String data) {
        this.data = data;
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
        if (!(o instanceof ReportSnapshotDTO)) {
            return false;
        }

        ReportSnapshotDTO reportSnapshotDTO = (ReportSnapshotDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, reportSnapshotDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ReportSnapshotDTO{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", type='" + getType() + "'" +
            ", generatedDate='" + getGeneratedDate() + "'" +
            ", data='" + getData() + "'" +
            ", project=" + getProject() +
            "}";
    }
}

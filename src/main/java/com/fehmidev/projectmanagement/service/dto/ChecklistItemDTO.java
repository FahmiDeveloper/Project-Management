package com.fehmidev.projectmanagement.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.Objects;

/**
 * A DTO for the {@link com.fehmidev.projectmanagement.domain.ChecklistItem} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class ChecklistItemDTO implements Serializable {

    private Long id;

    @NotNull
    private String content;

    @NotNull
    private Boolean isDone;

    private Integer position;

    private ChecklistDTO checklist;

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

    public Boolean getIsDone() {
        return isDone;
    }

    public void setIsDone(Boolean isDone) {
        this.isDone = isDone;
    }

    public Integer getPosition() {
        return position;
    }

    public void setPosition(Integer position) {
        this.position = position;
    }

    public ChecklistDTO getChecklist() {
        return checklist;
    }

    public void setChecklist(ChecklistDTO checklist) {
        this.checklist = checklist;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof ChecklistItemDTO)) {
            return false;
        }

        ChecklistItemDTO checklistItemDTO = (ChecklistItemDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, checklistItemDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ChecklistItemDTO{" +
            "id=" + getId() +
            ", content='" + getContent() + "'" +
            ", isDone='" + getIsDone() + "'" +
            ", position=" + getPosition() +
            ", checklist=" + getChecklist() +
            "}";
    }
}

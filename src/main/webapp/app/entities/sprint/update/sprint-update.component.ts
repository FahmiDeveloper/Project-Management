import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AlertError } from 'app/shared/alert/alert-error.model';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { DataUtils, FileLoadError } from 'app/core/util/data-util.service';
import { IProject } from 'app/entities/project/project.model';
import { ProjectService } from 'app/entities/project/service/project.service';
import { SprintStatus } from 'app/entities/enumerations/sprint-status.model';
import { SprintService } from '../service/sprint.service';
import { ISprint } from '../sprint.model';
import { SprintFormGroup, SprintFormService } from './sprint-form.service';

@Component({
  selector: 'jhi-sprint-update',
  templateUrl: './sprint-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class SprintUpdateComponent implements OnInit {
  isSaving = false;
  sprint: ISprint | null = null;
  sprintStatusValues = Object.keys(SprintStatus);

  projectsSharedCollection: IProject[] = [];

  protected dataUtils = inject(DataUtils);
  protected eventManager = inject(EventManager);
  protected sprintService = inject(SprintService);
  protected sprintFormService = inject(SprintFormService);
  protected projectService = inject(ProjectService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: SprintFormGroup = this.sprintFormService.createSprintFormGroup();

  compareProject = (o1: IProject | null, o2: IProject | null): boolean => this.projectService.compareProject(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ sprint }) => {
      this.sprint = sprint;
      if (sprint) {
        this.updateForm(sprint);
      }

      this.loadRelationshipsOptions();
    });
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  openFile(base64String: string, contentType: string | null | undefined): void {
    this.dataUtils.openFile(base64String, contentType);
  }

  setFileData(event: Event, field: string, isImage: boolean): void {
    this.dataUtils.loadFileToForm(event, this.editForm, field, isImage).subscribe({
      error: (err: FileLoadError) =>
        this.eventManager.broadcast(
          new EventWithContent<AlertError>('projectManagementApp.error', { ...err, key: `error.file.${err.key}` }),
        ),
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const sprint = this.sprintFormService.getSprint(this.editForm);
    if (sprint.id !== null) {
      this.subscribeToSaveResponse(this.sprintService.update(sprint));
    } else {
      this.subscribeToSaveResponse(this.sprintService.create(sprint));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ISprint>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(sprint: ISprint): void {
    this.sprint = sprint;
    this.sprintFormService.resetForm(this.editForm, sprint);

    this.projectsSharedCollection = this.projectService.addProjectToCollectionIfMissing<IProject>(
      this.projectsSharedCollection,
      sprint.project,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.projectService
      .query()
      .pipe(map((res: HttpResponse<IProject[]>) => res.body ?? []))
      .pipe(map((projects: IProject[]) => this.projectService.addProjectToCollectionIfMissing<IProject>(projects, this.sprint?.project)))
      .subscribe((projects: IProject[]) => (this.projectsSharedCollection = projects));
  }
}

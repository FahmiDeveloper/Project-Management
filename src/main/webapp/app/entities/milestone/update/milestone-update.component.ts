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
import { MilestoneStatus } from 'app/entities/enumerations/milestone-status.model';
import { MilestoneService } from '../service/milestone.service';
import { IMilestone } from '../milestone.model';
import { MilestoneFormGroup, MilestoneFormService } from './milestone-form.service';

@Component({
  selector: 'jhi-milestone-update',
  templateUrl: './milestone-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class MilestoneUpdateComponent implements OnInit {
  isSaving = false;
  milestone: IMilestone | null = null;
  milestoneStatusValues = Object.keys(MilestoneStatus);

  projectsSharedCollection: IProject[] = [];

  protected dataUtils = inject(DataUtils);
  protected eventManager = inject(EventManager);
  protected milestoneService = inject(MilestoneService);
  protected milestoneFormService = inject(MilestoneFormService);
  protected projectService = inject(ProjectService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: MilestoneFormGroup = this.milestoneFormService.createMilestoneFormGroup();

  compareProject = (o1: IProject | null, o2: IProject | null): boolean => this.projectService.compareProject(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ milestone }) => {
      this.milestone = milestone;
      if (milestone) {
        this.updateForm(milestone);
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
    const milestone = this.milestoneFormService.getMilestone(this.editForm);
    if (milestone.id !== null) {
      this.subscribeToSaveResponse(this.milestoneService.update(milestone));
    } else {
      this.subscribeToSaveResponse(this.milestoneService.create(milestone));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IMilestone>>): void {
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

  protected updateForm(milestone: IMilestone): void {
    this.milestone = milestone;
    this.milestoneFormService.resetForm(this.editForm, milestone);

    this.projectsSharedCollection = this.projectService.addProjectToCollectionIfMissing<IProject>(
      this.projectsSharedCollection,
      milestone.project,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.projectService
      .query()
      .pipe(map((res: HttpResponse<IProject[]>) => res.body ?? []))
      .pipe(map((projects: IProject[]) => this.projectService.addProjectToCollectionIfMissing<IProject>(projects, this.milestone?.project)))
      .subscribe((projects: IProject[]) => (this.projectsSharedCollection = projects));
  }
}

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
import { ReportSnapshotService } from '../service/report-snapshot.service';
import { IReportSnapshot } from '../report-snapshot.model';
import { ReportSnapshotFormGroup, ReportSnapshotFormService } from './report-snapshot-form.service';

@Component({
  selector: 'jhi-report-snapshot-update',
  templateUrl: './report-snapshot-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class ReportSnapshotUpdateComponent implements OnInit {
  isSaving = false;
  reportSnapshot: IReportSnapshot | null = null;

  projectsSharedCollection: IProject[] = [];

  protected dataUtils = inject(DataUtils);
  protected eventManager = inject(EventManager);
  protected reportSnapshotService = inject(ReportSnapshotService);
  protected reportSnapshotFormService = inject(ReportSnapshotFormService);
  protected projectService = inject(ProjectService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: ReportSnapshotFormGroup = this.reportSnapshotFormService.createReportSnapshotFormGroup();

  compareProject = (o1: IProject | null, o2: IProject | null): boolean => this.projectService.compareProject(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ reportSnapshot }) => {
      this.reportSnapshot = reportSnapshot;
      if (reportSnapshot) {
        this.updateForm(reportSnapshot);
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
    const reportSnapshot = this.reportSnapshotFormService.getReportSnapshot(this.editForm);
    if (reportSnapshot.id !== null) {
      this.subscribeToSaveResponse(this.reportSnapshotService.update(reportSnapshot));
    } else {
      this.subscribeToSaveResponse(this.reportSnapshotService.create(reportSnapshot));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IReportSnapshot>>): void {
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

  protected updateForm(reportSnapshot: IReportSnapshot): void {
    this.reportSnapshot = reportSnapshot;
    this.reportSnapshotFormService.resetForm(this.editForm, reportSnapshot);

    this.projectsSharedCollection = this.projectService.addProjectToCollectionIfMissing<IProject>(
      this.projectsSharedCollection,
      reportSnapshot.project,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.projectService
      .query()
      .pipe(map((res: HttpResponse<IProject[]>) => res.body ?? []))
      .pipe(
        map((projects: IProject[]) =>
          this.projectService.addProjectToCollectionIfMissing<IProject>(projects, this.reportSnapshot?.project),
        ),
      )
      .subscribe((projects: IProject[]) => (this.projectsSharedCollection = projects));
  }
}

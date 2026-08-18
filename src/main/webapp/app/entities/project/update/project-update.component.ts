import { HttpResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { MaterialModule } from 'app/shared/material.module';
import { AlertError } from 'app/shared/alert/alert-error.model';
import { CUSTOM_DATE_FORMATS, CustomDateAdapter } from 'app/shared/date/custom-date-adapter';
import { DataUtils, FileLoadError } from 'app/core/util/data-util.service';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';

import { IClient } from 'app/entities/client/client.model';
import { ClientService } from 'app/entities/client/service/client.service';
import { IEmployee } from 'app/entities/employee/employee.model';
import { EmployeeService } from 'app/entities/employee/service/employee.service';
import { ProjectStatus } from 'app/entities/enumerations/project-status.model';

import { IProject } from '../project.model';
import { ProjectService } from '../service/project.service';
import { ProjectFormGroup, ProjectFormService } from './project-form.service';

@Component({
  selector: 'jhi-project-update',
  templateUrl: './project-update.component.html',
  styleUrls: ['./project-update.component.scss'],
  imports: [SharedModule, FormsModule, ReactiveFormsModule, MaterialModule],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
  ],
})
export class ProjectUpdateComponent implements OnInit {
  isSaving = false;
  project: IProject | null = null;
  projectStatusValues = Object.keys(ProjectStatus);

  clientsSharedCollection: IClient[] = [];
  employeesSharedCollection: IEmployee[] = [];

  protected dataUtils = inject(DataUtils);
  protected eventManager = inject(EventManager);
  protected projectService = inject(ProjectService);
  protected projectFormService = inject(ProjectFormService);
  protected clientService = inject(ClientService);
  protected employeeService = inject(EmployeeService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: ProjectFormGroup = this.projectFormService.createProjectFormGroup();

  compareClient = (o1: IClient | null, o2: IClient | null): boolean => this.clientService.compareClient(o1, o2);

  compareEmployee = (o1: IEmployee | null, o2: IEmployee | null): boolean => this.employeeService.compareEmployee(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ project }) => {
      this.project = project;
      if (project) {
        this.updateForm(project);
        // Code is generated once at creation time and never editable afterwards.
      } else {
        // New project: generate the next sequential code for the current year,
        // then lock the field so the user can't override it.
        this.generateNextProjectCode().subscribe(code => {
          this.editForm.patchValue({ code });
        });
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
    const project = this.projectFormService.getProject(this.editForm);
    if (project.id !== null) {
      this.subscribeToSaveResponse(this.projectService.update(project));
    } else {
      this.subscribeToSaveResponse(this.projectService.create(project));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IProject>>): void {
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

  protected updateForm(project: IProject): void {
    this.project = project;
    this.projectFormService.resetForm(this.editForm, project);

    this.clientsSharedCollection = this.clientService.addClientToCollectionIfMissing<IClient>(this.clientsSharedCollection, project.client);
    this.employeesSharedCollection = this.employeeService.addEmployeeToCollectionIfMissing<IEmployee>(
      this.employeesSharedCollection,
      project.manager,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.clientService
      .query()
      .pipe(map((res: HttpResponse<IClient[]>) => res.body ?? []))
      .pipe(map((clients: IClient[]) => this.clientService.addClientToCollectionIfMissing<IClient>(clients, this.project?.client)))
      .subscribe((clients: IClient[]) => (this.clientsSharedCollection = clients));

    this.employeeService
      .query()
      .pipe(map((res: HttpResponse<IEmployee[]>) => res.body ?? []))
      .pipe(
        map((employees: IEmployee[]) => this.employeeService.addEmployeeToCollectionIfMissing<IEmployee>(employees, this.project?.manager)),
      )
      .subscribe((employees: IEmployee[]) => (this.employeesSharedCollection = employees));
  }

  /**
   * Generates the next project code for the current year in the format PR0001_<year>,
   * e.g. PR0001_2026, PR0002_2026, etc. The sequence is based on the highest existing
   * sequence number for the current year (i.e. the last project added), and resets
   * to 0001 at the start of each new year.
   */
  protected generateNextProjectCode(): Observable<string> {
    const currentYear = new Date().getFullYear();
    const yearSuffix = String(currentYear);
    const codePattern = /^PR(\d{4})_(\d{4})$/;

    return this.projectService.query().pipe(
      map((res: HttpResponse<IProject[]>) => res.body ?? []),
      map((projects: IProject[]) => {
        const sequencesForCurrentYear = projects
          .map(p => p.code)
          .filter((code): code is string => !!code)
          .map(code => codePattern.exec(code))
          .filter((match): match is RegExpExecArray => match !== null && match[2] === yearSuffix)
          .map(match => parseInt(match[1], 10));

        const nextSequence = sequencesForCurrentYear.length > 0 ? Math.max(...sequencesForCurrentYear) + 1 : 1;
        const paddedSequence = String(nextSequence).padStart(4, '0');

        return `PR${paddedSequence}_${yearSuffix}`;
      }),
    );
  }
}

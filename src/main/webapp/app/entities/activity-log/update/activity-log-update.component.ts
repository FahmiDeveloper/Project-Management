import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IEmployee } from 'app/entities/employee/employee.model';
import { EmployeeService } from 'app/entities/employee/service/employee.service';
import { IActivityLog } from '../activity-log.model';
import { ActivityLogService } from '../service/activity-log.service';
import { ActivityLogFormGroup, ActivityLogFormService } from './activity-log-form.service';

@Component({
  selector: 'jhi-activity-log-update',
  templateUrl: './activity-log-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class ActivityLogUpdateComponent implements OnInit {
  isSaving = false;
  activityLog: IActivityLog | null = null;

  employeesSharedCollection: IEmployee[] = [];

  protected activityLogService = inject(ActivityLogService);
  protected activityLogFormService = inject(ActivityLogFormService);
  protected employeeService = inject(EmployeeService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: ActivityLogFormGroup = this.activityLogFormService.createActivityLogFormGroup();

  compareEmployee = (o1: IEmployee | null, o2: IEmployee | null): boolean => this.employeeService.compareEmployee(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ activityLog }) => {
      this.activityLog = activityLog;
      if (activityLog) {
        this.updateForm(activityLog);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const activityLog = this.activityLogFormService.getActivityLog(this.editForm);
    if (activityLog.id !== null) {
      this.subscribeToSaveResponse(this.activityLogService.update(activityLog));
    } else {
      this.subscribeToSaveResponse(this.activityLogService.create(activityLog));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IActivityLog>>): void {
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

  protected updateForm(activityLog: IActivityLog): void {
    this.activityLog = activityLog;
    this.activityLogFormService.resetForm(this.editForm, activityLog);

    this.employeesSharedCollection = this.employeeService.addEmployeeToCollectionIfMissing<IEmployee>(
      this.employeesSharedCollection,
      activityLog.employee,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.employeeService
      .query()
      .pipe(map((res: HttpResponse<IEmployee[]>) => res.body ?? []))
      .pipe(
        map((employees: IEmployee[]) =>
          this.employeeService.addEmployeeToCollectionIfMissing<IEmployee>(employees, this.activityLog?.employee),
        ),
      )
      .subscribe((employees: IEmployee[]) => (this.employeesSharedCollection = employees));
  }
}

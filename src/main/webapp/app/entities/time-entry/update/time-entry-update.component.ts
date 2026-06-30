import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ITask } from 'app/entities/task/task.model';
import { TaskService } from 'app/entities/task/service/task.service';
import { IEmployee } from 'app/entities/employee/employee.model';
import { EmployeeService } from 'app/entities/employee/service/employee.service';
import { TimeEntryService } from '../service/time-entry.service';
import { ITimeEntry } from '../time-entry.model';
import { TimeEntryFormGroup, TimeEntryFormService } from './time-entry-form.service';

@Component({
  selector: 'jhi-time-entry-update',
  templateUrl: './time-entry-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class TimeEntryUpdateComponent implements OnInit {
  isSaving = false;
  timeEntry: ITimeEntry | null = null;

  tasksSharedCollection: ITask[] = [];
  employeesSharedCollection: IEmployee[] = [];

  protected timeEntryService = inject(TimeEntryService);
  protected timeEntryFormService = inject(TimeEntryFormService);
  protected taskService = inject(TaskService);
  protected employeeService = inject(EmployeeService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: TimeEntryFormGroup = this.timeEntryFormService.createTimeEntryFormGroup();

  compareTask = (o1: ITask | null, o2: ITask | null): boolean => this.taskService.compareTask(o1, o2);

  compareEmployee = (o1: IEmployee | null, o2: IEmployee | null): boolean => this.employeeService.compareEmployee(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ timeEntry }) => {
      this.timeEntry = timeEntry;
      if (timeEntry) {
        this.updateForm(timeEntry);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const timeEntry = this.timeEntryFormService.getTimeEntry(this.editForm);
    if (timeEntry.id !== null) {
      this.subscribeToSaveResponse(this.timeEntryService.update(timeEntry));
    } else {
      this.subscribeToSaveResponse(this.timeEntryService.create(timeEntry));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ITimeEntry>>): void {
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

  protected updateForm(timeEntry: ITimeEntry): void {
    this.timeEntry = timeEntry;
    this.timeEntryFormService.resetForm(this.editForm, timeEntry);

    this.tasksSharedCollection = this.taskService.addTaskToCollectionIfMissing<ITask>(this.tasksSharedCollection, timeEntry.task);
    this.employeesSharedCollection = this.employeeService.addEmployeeToCollectionIfMissing<IEmployee>(
      this.employeesSharedCollection,
      timeEntry.employee,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.taskService
      .query()
      .pipe(map((res: HttpResponse<ITask[]>) => res.body ?? []))
      .pipe(map((tasks: ITask[]) => this.taskService.addTaskToCollectionIfMissing<ITask>(tasks, this.timeEntry?.task)))
      .subscribe((tasks: ITask[]) => (this.tasksSharedCollection = tasks));

    this.employeeService
      .query()
      .pipe(map((res: HttpResponse<IEmployee[]>) => res.body ?? []))
      .pipe(
        map((employees: IEmployee[]) =>
          this.employeeService.addEmployeeToCollectionIfMissing<IEmployee>(employees, this.timeEntry?.employee),
        ),
      )
      .subscribe((employees: IEmployee[]) => (this.employeesSharedCollection = employees));
  }
}

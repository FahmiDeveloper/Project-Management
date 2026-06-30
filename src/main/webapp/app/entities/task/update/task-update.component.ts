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
import { ISprint } from 'app/entities/sprint/sprint.model';
import { SprintService } from 'app/entities/sprint/service/sprint.service';
import { IMilestone } from 'app/entities/milestone/milestone.model';
import { MilestoneService } from 'app/entities/milestone/service/milestone.service';
import { IEmployee } from 'app/entities/employee/employee.model';
import { EmployeeService } from 'app/entities/employee/service/employee.service';
import { TaskPriority } from 'app/entities/enumerations/task-priority.model';
import { TaskStatus } from 'app/entities/enumerations/task-status.model';
import { TaskService } from '../service/task.service';
import { ITask } from '../task.model';
import { TaskFormGroup, TaskFormService } from './task-form.service';

@Component({
  selector: 'jhi-task-update',
  templateUrl: './task-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class TaskUpdateComponent implements OnInit {
  isSaving = false;
  task: ITask | null = null;
  taskPriorityValues = Object.keys(TaskPriority);
  taskStatusValues = Object.keys(TaskStatus);

  sprintsSharedCollection: ISprint[] = [];
  milestonesSharedCollection: IMilestone[] = [];
  employeesSharedCollection: IEmployee[] = [];

  protected dataUtils = inject(DataUtils);
  protected eventManager = inject(EventManager);
  protected taskService = inject(TaskService);
  protected taskFormService = inject(TaskFormService);
  protected sprintService = inject(SprintService);
  protected milestoneService = inject(MilestoneService);
  protected employeeService = inject(EmployeeService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: TaskFormGroup = this.taskFormService.createTaskFormGroup();

  compareSprint = (o1: ISprint | null, o2: ISprint | null): boolean => this.sprintService.compareSprint(o1, o2);

  compareMilestone = (o1: IMilestone | null, o2: IMilestone | null): boolean => this.milestoneService.compareMilestone(o1, o2);

  compareEmployee = (o1: IEmployee | null, o2: IEmployee | null): boolean => this.employeeService.compareEmployee(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ task }) => {
      this.task = task;
      if (task) {
        this.updateForm(task);
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
    const task = this.taskFormService.getTask(this.editForm);
    if (task.id !== null) {
      this.subscribeToSaveResponse(this.taskService.update(task));
    } else {
      this.subscribeToSaveResponse(this.taskService.create(task));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ITask>>): void {
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

  protected updateForm(task: ITask): void {
    this.task = task;
    this.taskFormService.resetForm(this.editForm, task);

    this.sprintsSharedCollection = this.sprintService.addSprintToCollectionIfMissing<ISprint>(this.sprintsSharedCollection, task.sprint);
    this.milestonesSharedCollection = this.milestoneService.addMilestoneToCollectionIfMissing<IMilestone>(
      this.milestonesSharedCollection,
      task.milestone,
    );
    this.employeesSharedCollection = this.employeeService.addEmployeeToCollectionIfMissing<IEmployee>(
      this.employeesSharedCollection,
      task.assignedTo,
      task.createdBy,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.sprintService
      .query()
      .pipe(map((res: HttpResponse<ISprint[]>) => res.body ?? []))
      .pipe(map((sprints: ISprint[]) => this.sprintService.addSprintToCollectionIfMissing<ISprint>(sprints, this.task?.sprint)))
      .subscribe((sprints: ISprint[]) => (this.sprintsSharedCollection = sprints));

    this.milestoneService
      .query()
      .pipe(map((res: HttpResponse<IMilestone[]>) => res.body ?? []))
      .pipe(
        map((milestones: IMilestone[]) =>
          this.milestoneService.addMilestoneToCollectionIfMissing<IMilestone>(milestones, this.task?.milestone),
        ),
      )
      .subscribe((milestones: IMilestone[]) => (this.milestonesSharedCollection = milestones));

    this.employeeService
      .query()
      .pipe(map((res: HttpResponse<IEmployee[]>) => res.body ?? []))
      .pipe(
        map((employees: IEmployee[]) =>
          this.employeeService.addEmployeeToCollectionIfMissing<IEmployee>(employees, this.task?.assignedTo, this.task?.createdBy),
        ),
      )
      .subscribe((employees: IEmployee[]) => (this.employeesSharedCollection = employees));
  }
}

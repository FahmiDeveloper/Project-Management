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
import { ITask } from 'app/entities/task/task.model';
import { TaskService } from 'app/entities/task/service/task.service';
import { IEmployee } from 'app/entities/employee/employee.model';
import { EmployeeService } from 'app/entities/employee/service/employee.service';
import { TaskCommentService } from '../service/task-comment.service';
import { ITaskComment } from '../task-comment.model';
import { TaskCommentFormGroup, TaskCommentFormService } from './task-comment-form.service';

@Component({
  selector: 'jhi-task-comment-update',
  templateUrl: './task-comment-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class TaskCommentUpdateComponent implements OnInit {
  isSaving = false;
  taskComment: ITaskComment | null = null;

  tasksSharedCollection: ITask[] = [];
  employeesSharedCollection: IEmployee[] = [];

  protected dataUtils = inject(DataUtils);
  protected eventManager = inject(EventManager);
  protected taskCommentService = inject(TaskCommentService);
  protected taskCommentFormService = inject(TaskCommentFormService);
  protected taskService = inject(TaskService);
  protected employeeService = inject(EmployeeService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: TaskCommentFormGroup = this.taskCommentFormService.createTaskCommentFormGroup();

  compareTask = (o1: ITask | null, o2: ITask | null): boolean => this.taskService.compareTask(o1, o2);

  compareEmployee = (o1: IEmployee | null, o2: IEmployee | null): boolean => this.employeeService.compareEmployee(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ taskComment }) => {
      this.taskComment = taskComment;
      if (taskComment) {
        this.updateForm(taskComment);
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
    const taskComment = this.taskCommentFormService.getTaskComment(this.editForm);
    if (taskComment.id !== null) {
      this.subscribeToSaveResponse(this.taskCommentService.update(taskComment));
    } else {
      this.subscribeToSaveResponse(this.taskCommentService.create(taskComment));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ITaskComment>>): void {
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

  protected updateForm(taskComment: ITaskComment): void {
    this.taskComment = taskComment;
    this.taskCommentFormService.resetForm(this.editForm, taskComment);

    this.tasksSharedCollection = this.taskService.addTaskToCollectionIfMissing<ITask>(this.tasksSharedCollection, taskComment.task);
    this.employeesSharedCollection = this.employeeService.addEmployeeToCollectionIfMissing<IEmployee>(
      this.employeesSharedCollection,
      taskComment.employee,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.taskService
      .query()
      .pipe(map((res: HttpResponse<ITask[]>) => res.body ?? []))
      .pipe(map((tasks: ITask[]) => this.taskService.addTaskToCollectionIfMissing<ITask>(tasks, this.taskComment?.task)))
      .subscribe((tasks: ITask[]) => (this.tasksSharedCollection = tasks));

    this.employeeService
      .query()
      .pipe(map((res: HttpResponse<IEmployee[]>) => res.body ?? []))
      .pipe(
        map((employees: IEmployee[]) =>
          this.employeeService.addEmployeeToCollectionIfMissing<IEmployee>(employees, this.taskComment?.employee),
        ),
      )
      .subscribe((employees: IEmployee[]) => (this.employeesSharedCollection = employees));
  }
}

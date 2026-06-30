import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ITask } from 'app/entities/task/task.model';
import { TaskService } from 'app/entities/task/service/task.service';
import { IChecklist } from '../checklist.model';
import { ChecklistService } from '../service/checklist.service';
import { ChecklistFormGroup, ChecklistFormService } from './checklist-form.service';

@Component({
  selector: 'jhi-checklist-update',
  templateUrl: './checklist-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class ChecklistUpdateComponent implements OnInit {
  isSaving = false;
  checklist: IChecklist | null = null;

  tasksSharedCollection: ITask[] = [];

  protected checklistService = inject(ChecklistService);
  protected checklistFormService = inject(ChecklistFormService);
  protected taskService = inject(TaskService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: ChecklistFormGroup = this.checklistFormService.createChecklistFormGroup();

  compareTask = (o1: ITask | null, o2: ITask | null): boolean => this.taskService.compareTask(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ checklist }) => {
      this.checklist = checklist;
      if (checklist) {
        this.updateForm(checklist);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const checklist = this.checklistFormService.getChecklist(this.editForm);
    if (checklist.id !== null) {
      this.subscribeToSaveResponse(this.checklistService.update(checklist));
    } else {
      this.subscribeToSaveResponse(this.checklistService.create(checklist));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IChecklist>>): void {
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

  protected updateForm(checklist: IChecklist): void {
    this.checklist = checklist;
    this.checklistFormService.resetForm(this.editForm, checklist);

    this.tasksSharedCollection = this.taskService.addTaskToCollectionIfMissing<ITask>(this.tasksSharedCollection, checklist.task);
  }

  protected loadRelationshipsOptions(): void {
    this.taskService
      .query()
      .pipe(map((res: HttpResponse<ITask[]>) => res.body ?? []))
      .pipe(map((tasks: ITask[]) => this.taskService.addTaskToCollectionIfMissing<ITask>(tasks, this.checklist?.task)))
      .subscribe((tasks: ITask[]) => (this.tasksSharedCollection = tasks));
  }
}

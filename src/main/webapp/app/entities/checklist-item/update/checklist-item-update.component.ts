import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IChecklist } from 'app/entities/checklist/checklist.model';
import { ChecklistService } from 'app/entities/checklist/service/checklist.service';
import { IChecklistItem } from '../checklist-item.model';
import { ChecklistItemService } from '../service/checklist-item.service';
import { ChecklistItemFormGroup, ChecklistItemFormService } from './checklist-item-form.service';

@Component({
  selector: 'jhi-checklist-item-update',
  templateUrl: './checklist-item-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class ChecklistItemUpdateComponent implements OnInit {
  isSaving = false;
  checklistItem: IChecklistItem | null = null;

  checklistsSharedCollection: IChecklist[] = [];

  protected checklistItemService = inject(ChecklistItemService);
  protected checklistItemFormService = inject(ChecklistItemFormService);
  protected checklistService = inject(ChecklistService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: ChecklistItemFormGroup = this.checklistItemFormService.createChecklistItemFormGroup();

  compareChecklist = (o1: IChecklist | null, o2: IChecklist | null): boolean => this.checklistService.compareChecklist(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ checklistItem }) => {
      this.checklistItem = checklistItem;
      if (checklistItem) {
        this.updateForm(checklistItem);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const checklistItem = this.checklistItemFormService.getChecklistItem(this.editForm);
    if (checklistItem.id !== null) {
      this.subscribeToSaveResponse(this.checklistItemService.update(checklistItem));
    } else {
      this.subscribeToSaveResponse(this.checklistItemService.create(checklistItem));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IChecklistItem>>): void {
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

  protected updateForm(checklistItem: IChecklistItem): void {
    this.checklistItem = checklistItem;
    this.checklistItemFormService.resetForm(this.editForm, checklistItem);

    this.checklistsSharedCollection = this.checklistService.addChecklistToCollectionIfMissing<IChecklist>(
      this.checklistsSharedCollection,
      checklistItem.checklist,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.checklistService
      .query()
      .pipe(map((res: HttpResponse<IChecklist[]>) => res.body ?? []))
      .pipe(
        map((checklists: IChecklist[]) =>
          this.checklistService.addChecklistToCollectionIfMissing<IChecklist>(checklists, this.checklistItem?.checklist),
        ),
      )
      .subscribe((checklists: IChecklist[]) => (this.checklistsSharedCollection = checklists));
  }
}

import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IChecklist } from '../checklist.model';
import { ChecklistService } from '../service/checklist.service';
import { ChecklistItemService } from 'app/entities/checklist-item/service/checklist-item.service';
import { forkJoin } from 'rxjs';

@Component({
  templateUrl: './checklist-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class ChecklistDeleteDialogComponent implements OnInit {
  checklist?: IChecklist;
  messages: { message: string }[] = [];
  checkingReferences = true;

  protected checklistService = inject(ChecklistService);
  protected checklistItemService = inject(ChecklistItemService);
  protected activeModal = inject(NgbActiveModal);

  ngOnInit(): void {
    if (!this.checklist?.id) {
      this.checkingReferences = false;
      return;
    }

    const id = this.checklist.id;
    forkJoin({
      checklistItems: this.checklistItemService.count({ checklistId: id }),
    }).subscribe(({ checklistItems }) => {
      if ((checklistItems.body ?? 0) > 0) {
        this.messages.push({ message: `ChecklistItems list has ${checklistItems.body} row(s) with this checklist and cannot be deleted.` });
      }
      this.checkingReferences = false;
    });
  }

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.checklistService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}

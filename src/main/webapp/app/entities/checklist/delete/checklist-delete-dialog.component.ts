import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IChecklist } from '../checklist.model';
import { ChecklistService } from '../service/checklist.service';

@Component({
  templateUrl: './checklist-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class ChecklistDeleteDialogComponent {
  checklist?: IChecklist;

  protected checklistService = inject(ChecklistService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.checklistService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}

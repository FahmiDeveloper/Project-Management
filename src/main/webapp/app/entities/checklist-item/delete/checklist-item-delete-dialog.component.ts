import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IChecklistItem } from '../checklist-item.model';
import { ChecklistItemService } from '../service/checklist-item.service';

@Component({
  templateUrl: './checklist-item-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class ChecklistItemDeleteDialogComponent {
  checklistItem?: IChecklistItem;

  protected checklistItemService = inject(ChecklistItemService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.checklistItemService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}

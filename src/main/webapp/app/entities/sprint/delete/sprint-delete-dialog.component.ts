import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { ISprint } from '../sprint.model';
import { SprintService } from '../service/sprint.service';

@Component({
  templateUrl: './sprint-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class SprintDeleteDialogComponent {
  sprint?: ISprint;

  protected sprintService = inject(SprintService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.sprintService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}

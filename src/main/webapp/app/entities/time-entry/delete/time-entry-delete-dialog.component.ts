import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { ITimeEntry } from '../time-entry.model';
import { TimeEntryService } from '../service/time-entry.service';

@Component({
  templateUrl: './time-entry-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class TimeEntryDeleteDialogComponent {
  timeEntry?: ITimeEntry;

  protected timeEntryService = inject(TimeEntryService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.timeEntryService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}

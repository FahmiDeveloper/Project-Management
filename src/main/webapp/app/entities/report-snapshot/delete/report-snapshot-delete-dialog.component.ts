import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IReportSnapshot } from '../report-snapshot.model';
import { ReportSnapshotService } from '../service/report-snapshot.service';

@Component({
  templateUrl: './report-snapshot-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class ReportSnapshotDeleteDialogComponent {
  reportSnapshot?: IReportSnapshot;

  protected reportSnapshotService = inject(ReportSnapshotService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.reportSnapshotService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}

import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IDashboard } from '../dashboard.model';
import { DashboardService } from '../service/dashboard.service';

@Component({
  templateUrl: './dashboard-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class DashboardDeleteDialogComponent {
  dashboard?: IDashboard;

  protected dashboardService = inject(DashboardService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.dashboardService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}

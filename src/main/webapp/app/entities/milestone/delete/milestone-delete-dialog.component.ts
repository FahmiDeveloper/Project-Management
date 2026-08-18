import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IMilestone } from '../milestone.model';
import { MilestoneService } from '../service/milestone.service';
import { TaskService } from 'app/entities/task/service/task.service';
import { forkJoin } from 'rxjs';

@Component({
  templateUrl: './milestone-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class MilestoneDeleteDialogComponent implements OnInit {
  milestone?: IMilestone;
  messages: { message: string }[] = [];
  checkingReferences = true;

  protected milestoneService = inject(MilestoneService);
  protected taskService = inject(TaskService);
  protected activeModal = inject(NgbActiveModal);

  ngOnInit(): void {
    if (!this.milestone?.id) {
      this.checkingReferences = false;
      return;
    }

    const id = this.milestone.id;
    forkJoin({
      tasks: this.taskService.count({ milestoneId: id }),
    }).subscribe(({ tasks }) => {
      if ((tasks.body ?? 0) > 0) {
        this.messages.push({ message: `Tasks list has ${tasks.body} row(s) with this milestone and cannot be deleted.` });
      }
      this.checkingReferences = false;
    });
  }

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.milestoneService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}

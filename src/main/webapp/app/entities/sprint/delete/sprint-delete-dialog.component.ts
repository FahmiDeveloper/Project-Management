import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { ISprint } from '../sprint.model';
import { SprintService } from '../service/sprint.service';
import { TaskService } from 'app/entities/task/service/task.service';
import { forkJoin } from 'rxjs';

@Component({
  templateUrl: './sprint-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class SprintDeleteDialogComponent implements OnInit {
  sprint?: ISprint;
  messages: { message: string }[] = [];
  checkingReferences = true;

  protected sprintService = inject(SprintService);
  protected taskService = inject(TaskService);
  protected activeModal = inject(NgbActiveModal);

  ngOnInit(): void {
    if (!this.sprint?.id) {
      this.checkingReferences = false;
      return;
    }

    const id = this.sprint.id;
    forkJoin({
      tasks: this.taskService.count({ 'sprintId.equals': id }),
    }).subscribe(({ tasks }) => {
      if ((tasks.body ?? 0) > 0) {
        this.messages.push({ message: `Tasks list has ${tasks.body} row(s) with this sprint and cannot be deleted.` });
      }
      this.checkingReferences = false;
    });
  }

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.sprintService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}

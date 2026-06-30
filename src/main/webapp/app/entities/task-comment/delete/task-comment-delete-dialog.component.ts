import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { ITaskComment } from '../task-comment.model';
import { TaskCommentService } from '../service/task-comment.service';

@Component({
  templateUrl: './task-comment-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class TaskCommentDeleteDialogComponent {
  taskComment?: ITaskComment;

  protected taskCommentService = inject(TaskCommentService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.taskCommentService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}

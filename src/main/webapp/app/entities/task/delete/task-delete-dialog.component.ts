import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { ITask } from '../task.model';
import { TaskService } from '../service/task.service';
import { AttachmentService } from 'app/entities/attachment/service/attachment.service';
import { ChecklistService } from 'app/entities/checklist/service/checklist.service';
import { TaskCommentService } from 'app/entities/task-comment/service/task-comment.service';
import { TimeEntryService } from 'app/entities/time-entry/service/time-entry.service';
import { forkJoin } from 'rxjs';

@Component({
  templateUrl: './task-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class TaskDeleteDialogComponent implements OnInit {
  task?: ITask;
  messages: { message: string }[] = [];
  checkingReferences = true;

  protected taskService = inject(TaskService);
  protected attachmentService = inject(AttachmentService);
  protected checklistService = inject(ChecklistService);
  protected taskCommentService = inject(TaskCommentService);
  protected timeEntryService = inject(TimeEntryService);
  protected activeModal = inject(NgbActiveModal);

  ngOnInit(): void {
    if (!this.task?.id) {
      this.checkingReferences = false;
      return;
    }

    const id = this.task.id;
    forkJoin({
      attachments: this.attachmentService.count({ 'taskId.equals': id }),
      checklists: this.checklistService.count({ 'taskId.equals': id }),
      taskComments: this.taskCommentService.count({ 'taskId.equals': id }),
      timeEntries: this.timeEntryService.count({ 'taskId.equals': id }),
    }).subscribe(({ attachments, checklists, taskComments, timeEntries }) => {
      if ((attachments.body ?? 0) > 0) {
        this.messages.push({ message: `Attachments list has ${attachments.body} row(s) with this task and cannot be deleted.` });
      }
      if ((checklists.body ?? 0) > 0) {
        this.messages.push({ message: `Checklists list has ${checklists.body} row(s) with this task and cannot be deleted.` });
      }
      if ((taskComments.body ?? 0) > 0) {
        this.messages.push({ message: `Task comments list has ${taskComments.body} row(s) with this task and cannot be deleted.` });
      }
      if ((timeEntries.body ?? 0) > 0) {
        this.messages.push({ message: `Time entries list has ${timeEntries.body} row(s) with this task and cannot be deleted.` });
      }
      this.checkingReferences = false;
    });
  }

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.taskService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}

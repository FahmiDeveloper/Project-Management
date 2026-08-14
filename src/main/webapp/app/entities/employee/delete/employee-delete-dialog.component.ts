import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IEmployee } from '../employee.model';
import { EmployeeService } from '../service/employee.service';
import { forkJoin } from 'rxjs';
import { ActivityLogService } from 'app/entities/activity-log/service/activity-log.service';
import { AttachmentService } from 'app/entities/attachment/service/attachment.service';
import { DashboardService } from 'app/entities/dashboard/service/dashboard.service';
import { NotificationService } from 'app/entities/notification/service/notification.service';
import { ProjectService } from 'app/entities/project/service/project.service';
import { TaskCommentService } from 'app/entities/task-comment/service/task-comment.service';
import { TaskService } from 'app/entities/task/service/task.service';
import { TimeEntryService } from 'app/entities/time-entry/service/time-entry.service';
import { ProjectMemberService } from 'app/entities/project-member/service/project-member.service';

@Component({
  templateUrl: './employee-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class EmployeeDeleteDialogComponent implements OnInit {
  employee?: IEmployee;

  messages: { message: string }[] = [];
  checkingReferences = true;

  protected employeeService = inject(EmployeeService);
  protected activityLogService = inject(ActivityLogService);
  protected attachmentService = inject(AttachmentService);
  protected dashboardService = inject(DashboardService);
  protected notificationService = inject(NotificationService);
  protected projectMemberService = inject(ProjectMemberService);
  protected projectService = inject(ProjectService);
  protected taskCommentService = inject(TaskCommentService);
  protected taskService = inject(TaskService);
  protected timeEntryService = inject(TimeEntryService);
  protected activeModal = inject(NgbActiveModal);

  ngOnInit(): void {
    if (!this.employee?.id) {
      this.checkingReferences = false;
      return;
    }

    const id = this.employee.id;
    forkJoin({
      activityLogs: this.activityLogService.count({ 'employeeId.equals': id }),
      attachments: this.attachmentService.count({ 'employeeId.equals': id }),
      dashboards: this.dashboardService.count({ 'employeeId.equals': id }),
      notifications: this.notificationService.count({ 'employeeId.equals': id }),
      members: this.projectMemberService.count({ 'employeeId.equals': id }),
      projects: this.projectService.count({ 'managerId.equals': id }),
      taskComments: this.taskCommentService.count({ 'employeeId.equals': id }),
      tasksassignedTo: this.taskService.count({ 'assignedToId.equals': id }),
      taskscreatedBy: this.taskService.count({ 'createdById.equals': id }),
      timeEntries: this.timeEntryService.count({ 'employeeId.equals': id }),
    }).subscribe(
      ({
        activityLogs,
        attachments,
        dashboards,
        notifications,
        members,
        projects,
        taskComments,
        tasksassignedTo,
        taskscreatedBy,
        timeEntries,
      }) => {
        if ((activityLogs.body ?? 0) > 0) {
          this.messages.push({ message: `Activity logs list has ${activityLogs.body} row(s) with this employee and cannot be deleted.` });
        }
        if ((attachments.body ?? 0) > 0) {
          this.messages.push({ message: `Attachments list has ${attachments.body} row(s) with this employee and cannot be deleted.` });
        }
        if ((dashboards.body ?? 0) > 0) {
          this.messages.push({ message: `Dashboards list has ${dashboards.body} row(s) with this employee and cannot be deleted.` });
        }
        if ((notifications.body ?? 0) > 0) {
          this.messages.push({ message: `Notifications list has ${notifications.body} row(s) with this employee and cannot be deleted.` });
        }
        if ((members.body ?? 0) > 0) {
          this.messages.push({ message: `Projects members list has ${members.body} row(s) with this employee and cannot be deleted.` });
        }
        if ((projects.body ?? 0) > 0) {
          this.messages.push({ message: `Projects list has ${projects.body} row(s) with this employee and cannot be deleted.` });
        }
        if ((taskComments.body ?? 0) > 0) {
          this.messages.push({ message: `Task comments list has ${taskComments.body} row(s) with this employee and cannot be deleted.` });
        }
        if ((tasksassignedTo.body ?? 0) > 0) {
          this.messages.push({
            message: `Task list has ${tasksassignedTo.body} row(s) with this employee (assigned To) and cannot be deleted.`,
          });
        }
        if ((taskscreatedBy.body ?? 0) > 0) {
          this.messages.push({
            message: `Task list has ${taskscreatedBy.body} row(s) with this employee (created by) and cannot be deleted.`,
          });
        }
        if ((timeEntries.body ?? 0) > 0) {
          this.messages.push({ message: `Time entries list has ${timeEntries.body} row(s) with this employee and cannot be deleted.` });
        }
        this.checkingReferences = false;
      },
    );
  }

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.employeeService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}

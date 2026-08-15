import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IProject } from '../project.model';
import { ProjectService } from '../service/project.service';
import { TaskService } from 'app/entities/task/service/task.service';
import { ProjectMemberService } from 'app/entities/project-member/service/project-member.service';
import { MilestoneService } from 'app/entities/milestone/service/milestone.service';
import { ReportSnapshotService } from 'app/entities/report-snapshot/service/report-snapshot.service';
import { SprintService } from 'app/entities/sprint/service/sprint.service';
import { DashboardService } from 'app/entities/dashboard/service/dashboard.service';

@Component({
  templateUrl: './project-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class ProjectDeleteDialogComponent implements OnInit {
  project?: IProject;
  messages: { message: string }[] = [];
  checkingReferences = true;

  protected projectService = inject(ProjectService);
  protected milestoneService = inject(MilestoneService);
  protected projectMemberService = inject(ProjectMemberService);
  protected reportSnapshotService = inject(ReportSnapshotService);
  protected sprintService = inject(SprintService);
  protected dashboardService = inject(DashboardService);
  protected activeModal = inject(NgbActiveModal);

  ngOnInit(): void {
    if (!this.project?.id) {
      this.checkingReferences = false;
      return;
    }

    const id = this.project.id;
    forkJoin({
      milestones: this.milestoneService.count({ 'projectId.equals': id }),
      sprints: this.sprintService.count({ 'projectId.equals': id }),
      members: this.projectMemberService.count({ 'projectId.equals': id }),
      dashboards: this.dashboardService.count({ 'projectId.equals': id }),
      reportSnapshots: this.reportSnapshotService.count({ 'projectId.equals': id }),
    }).subscribe(({ milestones, sprints, members, dashboards, reportSnapshots }) => {
      if ((milestones.body ?? 0) > 0) {
        this.messages.push({ message: `Milestones list has ${milestones.body} row(s) with this project and cannot be deleted.` });
      }
      if ((sprints.body ?? 0) > 0) {
        this.messages.push({ message: `Sprints list has ${sprints.body} row(s) with this project and cannot be deleted.` });
      }
      if ((members.body ?? 0) > 0) {
        this.messages.push({ message: `Projects members list has ${members.body} row(s) with this project and cannot be deleted.` });
      }
      if ((dashboards.body ?? 0) > 0) {
        this.messages.push({ message: `Dashboards list has ${dashboards.body} row(s) with this project and cannot be deleted.` });
      }
      if ((reportSnapshots.body ?? 0) > 0) {
        this.messages.push({
          message: `Report snapshots list has ${reportSnapshots.body} row(s) with this project and cannot be deleted.`,
        });
      }
      this.checkingReferences = false;
    });
  }

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.projectService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}

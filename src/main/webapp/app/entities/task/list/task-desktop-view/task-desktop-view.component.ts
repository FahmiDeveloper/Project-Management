import { Component, EventEmitter, Input, Output, Signal, ViewChild, WritableSignal, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';

import SharedModule from 'app/shared/shared.module';
import { SortByDirective, SortDirective, type SortState } from 'app/shared/sort';
import { FormatMediumDatePipe } from 'app/shared/date';

import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ITask } from '../../task.model';
import { TaskService } from '../../service/task.service';

@Component({
  selector: 'jhi-task-desktop-view',
  templateUrl: './task-desktop-view.component.html',
  styleUrls: ['./task-desktop-view.component.scss'],
  imports: [
    RouterModule,
    SharedModule,
    SortDirective,
    SortByDirective,
    FormatMediumDatePipe,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatMenuModule,
  ],
})
export class TaskDesktopViewComponent {
  @Input({ required: true }) tasks!: Signal<ITask[]>;
  @Input({ required: true }) sortStateSignal!: WritableSignal<SortState>;
  @Input({ required: true }) statusLabelFn!: (status: string | null | undefined) => string;
  @Input({ required: true }) priorityLabelFn!: (priority: string | null | undefined) => string;

  @Output() sortChange = new EventEmitter<SortState>();
  @Output() delete = new EventEmitter<ITask>();

  displayedColumns: string[] = [
    'title',
    'description',
    'priority',
    'status',
    'effort',
    'dates',
    'completionPercentage',
    'sprint',
    'milestone',
    'assignedTo',
    'createdBy',
    'note',
  ];

  // Right-click context menu (view/edit/delete moved here instead of the always-visible
  // "actions" column), mirroring project-desktop-view/employee-desktop-view. mat-menu has
  // no "open at x/y" API, so the standard approach is a hidden trigger element whose
  // position we move to the cursor, then open it programmatically.
  @ViewChild(MatMenuTrigger) contextMenu!: MatMenuTrigger;
  contextMenuPosition = { x: 0, y: 0 };

  protected readonly taskService = inject(TaskService);

  trackId = (item: ITask): number => this.taskService.getTaskIdentifier(item);

  onRowContextMenu(event: MouseEvent, task: ITask): void {
    event.preventDefault();
    this.contextMenuPosition = { x: event.clientX, y: event.clientY };
    this.contextMenu.menuData = { task };
    this.contextMenu.menu?.focusFirstItem('mouse');
    this.contextMenu.openMenu();
  }
}

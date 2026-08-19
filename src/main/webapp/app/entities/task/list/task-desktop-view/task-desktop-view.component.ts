import { Component, EventEmitter, Input, Output, Signal, WritableSignal, inject } from '@angular/core';
import { RouterModule } from '@angular/router';

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
    'actions',
  ];

  protected readonly taskService = inject(TaskService);

  trackId = (item: ITask): number => this.taskService.getTaskIdentifier(item);
}

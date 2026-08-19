import { Component, EventEmitter, Input, Output, Signal } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { FormatMediumDatePipe } from 'app/shared/date';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { ITask } from '../../task.model';

@Component({
  selector: 'jhi-task-mobile-view',
  templateUrl: './task-mobile-view.component.html',
  styleUrls: ['./task-mobile-view.component.scss'],
  imports: [
    RouterModule,
    SharedModule,
    FormatMediumDatePipe,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressBarModule,
  ],
})
export class TaskMobileViewComponent {
  @Input({ required: true }) tasks!: Signal<ITask[]>;
  @Input({ required: true }) statusLabelFn!: (status: string | null | undefined) => string;
  @Input({ required: true }) priorityLabelFn!: (priority: string | null | undefined) => string;

  @Output() delete = new EventEmitter<ITask>();
}

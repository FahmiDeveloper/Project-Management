import { Component, EventEmitter, Input, Output, Signal, WritableSignal } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { SortByDirective, SortDirective, type SortState } from 'app/shared/sort';
import { FormatMediumDatePipe } from 'app/shared/date';

import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ISprint } from '../../sprint.model';

@Component({
  selector: 'jhi-sprint-desktop-view',
  templateUrl: './sprint-desktop-view.component.html',
  styleUrls: ['./sprint-desktop-view.component.scss'],
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
export class SprintDesktopViewComponent {
  @Input({ required: true }) sprints!: Signal<ISprint[]>;
  @Input({ required: true }) sortStateSignal!: WritableSignal<SortState>;
  @Input({ required: true }) statusLabelFn!: (status: string | null | undefined) => string;

  @Output() sortChange = new EventEmitter<SortState>();
  @Output() delete = new EventEmitter<ISprint>();

  displayedColumns: string[] = ['name', 'goal', 'startDate', 'endDate', 'status', 'capacity', 'velocity', 'project', 'actions'];
}

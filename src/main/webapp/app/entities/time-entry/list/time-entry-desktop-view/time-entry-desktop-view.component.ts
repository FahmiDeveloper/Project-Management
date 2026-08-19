import { Component, EventEmitter, Input, Output, Signal, WritableSignal, inject } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { SortByDirective, SortDirective, type SortState } from 'app/shared/sort';
import { FormatMediumDatePipe, FormatMediumDatetimePipe } from 'app/shared/date';

import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ITimeEntry } from '../../time-entry.model';
import { TimeEntryService } from '../../service/time-entry.service';

@Component({
  selector: 'jhi-time-entry-desktop-view',
  templateUrl: './time-entry-desktop-view.component.html',
  styleUrls: ['./time-entry-desktop-view.component.scss'],
  imports: [
    RouterModule,
    SharedModule,
    SortDirective,
    SortByDirective,
    FormatMediumDatePipe,
    FormatMediumDatetimePipe,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
})
export class TimeEntryDesktopViewComponent {
  @Input({ required: true }) timeEntries!: Signal<ITimeEntry[]>;
  @Input({ required: true }) sortStateSignal!: WritableSignal<SortState>;

  @Output() sortChange = new EventEmitter<SortState>();
  @Output() delete = new EventEmitter<ITimeEntry>();

  displayedColumns: string[] = ['description', 'startTime', 'endTime', 'hours', 'entryDate', 'task', 'employee', 'note', 'actions'];

  protected readonly timeEntryService = inject(TimeEntryService);

  trackId = (item: ITimeEntry): number => this.timeEntryService.getTimeEntryIdentifier(item);
}

import { Component, EventEmitter, Input, Output, Signal, ViewChild, WritableSignal, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';

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
    MatMenuModule,
  ],
})
export class TimeEntryDesktopViewComponent {
  @Input({ required: true }) timeEntries!: Signal<ITimeEntry[]>;
  @Input({ required: true }) sortStateSignal!: WritableSignal<SortState>;

  @Output() sortChange = new EventEmitter<SortState>();
  @Output() delete = new EventEmitter<ITimeEntry>();

  displayedColumns: string[] = ['description', 'startTime', 'endTime', 'hours', 'entryDate', 'task', 'employee', 'note'];

  protected readonly timeEntryService = inject(TimeEntryService);

  // Right-click context menu (view/edit/delete moved here instead of the always-visible
  // "actions" column), mirroring sprint-desktop-view. mat-menu has no "open at x/y" API,
  // so the standard approach is a hidden trigger element whose position we move to the
  // cursor, then open it programmatically.
  @ViewChild(MatMenuTrigger) contextMenu!: MatMenuTrigger;
  contextMenuPosition = { x: 0, y: 0 };

  trackId = (item: ITimeEntry): number => this.timeEntryService.getTimeEntryIdentifier(item);

  onRowContextMenu(event: MouseEvent, timeEntry: ITimeEntry): void {
    event.preventDefault();
    this.contextMenuPosition = { x: event.clientX, y: event.clientY };
    this.contextMenu.menuData = { timeEntry };
    this.contextMenu.menu?.focusFirstItem('mouse');
    this.contextMenu.openMenu();
  }
}

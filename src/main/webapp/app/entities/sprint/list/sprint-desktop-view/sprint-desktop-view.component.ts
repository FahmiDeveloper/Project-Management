import { Component, EventEmitter, Input, Output, Signal, ViewChild, WritableSignal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';

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
    MatMenuModule,
  ],
})
export class SprintDesktopViewComponent {
  @Input({ required: true }) sprints!: Signal<ISprint[]>;
  @Input({ required: true }) sortStateSignal!: WritableSignal<SortState>;
  @Input({ required: true }) statusLabelFn!: (status: string | null | undefined) => string;

  @Output() sortChange = new EventEmitter<SortState>();
  @Output() delete = new EventEmitter<ISprint>();

  displayedColumns: string[] = ['name', 'goal', 'startDate', 'endDate', 'status', 'capacity', 'velocity', 'project'];

  // Right-click context menu (view/edit/delete moved here instead of the always-visible
  // "actions" column), mirroring project/employee/task/milestone-desktop-view. mat-menu
  // has no "open at x/y" API, so the standard approach is a hidden trigger element whose
  // position we move to the cursor, then open it programmatically.
  @ViewChild(MatMenuTrigger) contextMenu!: MatMenuTrigger;
  contextMenuPosition = { x: 0, y: 0 };

  onRowContextMenu(event: MouseEvent, sprint: ISprint): void {
    event.preventDefault();
    this.contextMenuPosition = { x: event.clientX, y: event.clientY };
    this.contextMenu.menuData = { sprint };
    this.contextMenu.menu?.focusFirstItem('mouse');
    this.contextMenu.openMenu();
  }
}

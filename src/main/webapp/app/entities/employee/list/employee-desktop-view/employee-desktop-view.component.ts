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

import { IEmployee } from '../../employee.model';

@Component({
  selector: 'jhi-employee-desktop-view',
  templateUrl: './employee-desktop-view.component.html',
  styleUrls: ['./employee-desktop-view.component.scss'],
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
export class EmployeeDesktopViewComponent {
  @Input({ required: true }) employees!: Signal<IEmployee[]>;
  @Input({ required: true }) sortStateSignal!: WritableSignal<SortState>;

  @Output() sortChange = new EventEmitter<SortState>();
  @Output() delete = new EventEmitter<IEmployee>();

  displayedColumns: string[] = ['employeeNumber', 'firstName', 'lastName', 'phone', 'jobTitle', 'hireDate', 'user', 'department', 'note'];

  // Right-click context menu (view/edit/delete moved here instead of the always-visible
  // "actions" column), mirroring project-desktop-view. mat-menu has no "open at x/y"
  // API, so the standard approach is a hidden trigger element whose position we move
  // to the cursor, then open it programmatically.
  @ViewChild(MatMenuTrigger) contextMenu!: MatMenuTrigger;
  contextMenuPosition = { x: 0, y: 0 };

  onRowContextMenu(event: MouseEvent, employee: IEmployee): void {
    event.preventDefault();
    this.contextMenuPosition = { x: event.clientX, y: event.clientY };
    this.contextMenu.menuData = { employee };
    this.contextMenu.menu?.focusFirstItem('mouse');
    this.contextMenu.openMenu();
  }
}

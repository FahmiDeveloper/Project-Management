import { Component, EventEmitter, Input, Output, Signal, WritableSignal } from '@angular/core';
import { RouterModule } from '@angular/router';

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
  ],
})
export class EmployeeDesktopViewComponent {
  @Input({ required: true }) employees!: Signal<IEmployee[]>;
  @Input({ required: true }) sortStateSignal!: WritableSignal<SortState>;

  @Output() sortChange = new EventEmitter<SortState>();
  @Output() delete = new EventEmitter<IEmployee>();

  displayedColumns: string[] = [
    'employeeNumber',
    'firstName',
    'lastName',
    'phone',
    'jobTitle',
    'hireDate',
    'user',
    'department',
    'note',
    'actions',
  ];
}

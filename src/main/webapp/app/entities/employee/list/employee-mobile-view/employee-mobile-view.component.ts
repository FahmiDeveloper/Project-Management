import { Component, EventEmitter, Input, Output, Signal } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { FormatMediumDatePipe } from 'app/shared/date';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IEmployee } from '../../employee.model';

@Component({
  selector: 'jhi-employee-mobile-view',
  templateUrl: './employee-mobile-view.component.html',
  styleUrls: ['./employee-mobile-view.component.scss'],
  imports: [RouterModule, SharedModule, FormatMediumDatePipe, MatCardModule, MatIconModule, MatButtonModule, MatTooltipModule],
})
export class EmployeeMobileViewComponent {
  @Input({ required: true }) employees!: Signal<IEmployee[]>;

  @Output() delete = new EventEmitter<IEmployee>();
}

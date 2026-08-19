import { Component, EventEmitter, Input, Output, Signal } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { FormatMediumDatePipe, FormatMediumDatetimePipe } from 'app/shared/date';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ITimeEntry } from '../../time-entry.model';

@Component({
  selector: 'jhi-time-entry-mobile-view',
  templateUrl: './time-entry-mobile-view.component.html',
  styleUrls: ['./time-entry-mobile-view.component.scss'],
  imports: [
    RouterModule,
    SharedModule,
    FormatMediumDatePipe,
    FormatMediumDatetimePipe,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
})
export class TimeEntryMobileViewComponent {
  @Input({ required: true }) timeEntries!: Signal<ITimeEntry[]>;

  @Output() delete = new EventEmitter<ITimeEntry>();
}

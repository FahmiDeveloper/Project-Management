import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { FormatMediumDatePipe, FormatMediumDatetimePipe } from 'app/shared/date';
import { ITimeEntry } from '../time-entry.model';

@Component({
  selector: 'jhi-time-entry-detail',
  templateUrl: './time-entry-detail.component.html',
  imports: [SharedModule, RouterModule, FormatMediumDatetimePipe, FormatMediumDatePipe],
})
export class TimeEntryDetailComponent {
  timeEntry = input<ITimeEntry | null>(null);

  previousState(): void {
    window.history.back();
  }
}

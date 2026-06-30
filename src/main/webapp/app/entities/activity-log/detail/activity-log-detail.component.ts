import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { FormatMediumDatetimePipe } from 'app/shared/date';
import { IActivityLog } from '../activity-log.model';

@Component({
  selector: 'jhi-activity-log-detail',
  templateUrl: './activity-log-detail.component.html',
  imports: [SharedModule, RouterModule, FormatMediumDatetimePipe],
})
export class ActivityLogDetailComponent {
  activityLog = input<IActivityLog | null>(null);

  previousState(): void {
    window.history.back();
  }
}

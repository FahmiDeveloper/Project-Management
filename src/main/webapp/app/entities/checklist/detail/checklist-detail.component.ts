import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { FormatMediumDatetimePipe } from 'app/shared/date';
import { IChecklist } from '../checklist.model';

@Component({
  selector: 'jhi-checklist-detail',
  templateUrl: './checklist-detail.component.html',
  imports: [SharedModule, RouterModule, FormatMediumDatetimePipe],
})
export class ChecklistDetailComponent {
  checklist = input<IChecklist | null>(null);

  previousState(): void {
    window.history.back();
  }
}

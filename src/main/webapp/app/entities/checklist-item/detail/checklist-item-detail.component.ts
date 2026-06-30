import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { IChecklistItem } from '../checklist-item.model';

@Component({
  selector: 'jhi-checklist-item-detail',
  templateUrl: './checklist-item-detail.component.html',
  imports: [SharedModule, RouterModule],
})
export class ChecklistItemDetailComponent {
  checklistItem = input<IChecklistItem | null>(null);

  previousState(): void {
    window.history.back();
  }
}

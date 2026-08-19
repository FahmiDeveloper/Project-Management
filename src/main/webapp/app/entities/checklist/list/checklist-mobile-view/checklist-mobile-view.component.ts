import { Component, EventEmitter, Input, Output, Signal } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { FormatMediumDatetimePipe } from 'app/shared/date';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IChecklist } from '../../checklist.model';

@Component({
  selector: 'jhi-checklist-mobile-view',
  templateUrl: './checklist-mobile-view.component.html',
  styleUrls: ['./checklist-mobile-view.component.scss'],
  imports: [RouterModule, SharedModule, FormatMediumDatetimePipe, MatCardModule, MatIconModule, MatButtonModule, MatTooltipModule],
})
export class ChecklistMobileViewComponent {
  @Input({ required: true }) checklists!: Signal<IChecklist[]>;

  @Output() delete = new EventEmitter<IChecklist>();
}

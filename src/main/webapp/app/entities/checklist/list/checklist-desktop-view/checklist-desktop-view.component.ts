import { Component, EventEmitter, Input, Output, Signal, WritableSignal, inject } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { SortByDirective, SortDirective, type SortState } from 'app/shared/sort';
import { FormatMediumDatetimePipe } from 'app/shared/date';

import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IChecklist } from '../../checklist.model';
import { ChecklistService } from '../../service/checklist.service';

@Component({
  selector: 'jhi-checklist-desktop-view',
  templateUrl: './checklist-desktop-view.component.html',
  styleUrls: ['./checklist-desktop-view.component.scss'],
  imports: [
    RouterModule,
    SharedModule,
    SortDirective,
    SortByDirective,
    FormatMediumDatetimePipe,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
})
export class ChecklistDesktopViewComponent {
  @Input({ required: true }) checklists!: Signal<IChecklist[]>;
  @Input({ required: true }) sortStateSignal!: WritableSignal<SortState>;

  @Output() sortChange = new EventEmitter<SortState>();
  @Output() delete = new EventEmitter<IChecklist>();

  displayedColumns: string[] = ['title', 'createdDate', 'task', 'actions'];

  protected readonly checklistService = inject(ChecklistService);

  trackId = (item: IChecklist): number => this.checklistService.getChecklistIdentifier(item);
}

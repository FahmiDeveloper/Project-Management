import { Component, EventEmitter, Input, Output, Signal, ViewChild, WritableSignal, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';

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
    MatMenuModule,
  ],
})
export class ChecklistDesktopViewComponent {
  @Input({ required: true }) checklists!: Signal<IChecklist[]>;
  @Input({ required: true }) sortStateSignal!: WritableSignal<SortState>;

  @Output() sortChange = new EventEmitter<SortState>();
  @Output() delete = new EventEmitter<IChecklist>();

  displayedColumns: string[] = ['title', 'createdDate', 'task'];

  protected readonly checklistService = inject(ChecklistService);

  // Right-click context menu (view/edit/delete moved here instead of the always-visible
  // "actions" column), mirroring sprint-desktop-view. mat-menu has no "open at x/y" API,
  // so the standard approach is a hidden trigger element whose position we move to the
  // cursor, then open it programmatically.
  @ViewChild(MatMenuTrigger) contextMenu!: MatMenuTrigger;
  contextMenuPosition = { x: 0, y: 0 };

  trackId = (item: IChecklist): number => this.checklistService.getChecklistIdentifier(item);

  onRowContextMenu(event: MouseEvent, checklist: IChecklist): void {
    event.preventDefault();
    this.contextMenuPosition = { x: event.clientX, y: event.clientY };
    this.contextMenu.menuData = { checklist };
    this.contextMenu.menu?.focusFirstItem('mouse');
    this.contextMenu.openMenu();
  }
}

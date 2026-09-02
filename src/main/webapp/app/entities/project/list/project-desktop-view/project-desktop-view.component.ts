import { Component, EventEmitter, Input, Output, Signal, ViewChild, WritableSignal, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatMenuTrigger } from '@angular/material/menu';

import SharedModule from 'app/shared/shared.module';
import { MaterialModule } from 'app/shared/material.module';
import { FormatMediumDatePipe } from 'app/shared/date';
import { SortByDirective, SortDirective, type SortState } from 'app/shared/sort';

import { IProject } from '../../project.model';
import { ProjectService } from '../../service/project.service';

@Component({
  selector: 'jhi-project-desktop-view',
  templateUrl: './project-desktop-view.component.html',
  styleUrls: ['./project-desktop-view.component.scss'],
  imports: [RouterModule, SharedModule, SortDirective, SortByDirective, FormatMediumDatePipe, MaterialModule],
})
export class ProjectDesktopViewComponent {
  @Input({ required: true }) projects!: Signal<IProject[]>;
  @Input({ required: true }) sortStateSignal!: WritableSignal<SortState>;
  @Input({ required: true }) statusLabelFn!: (status: string | null | undefined) => string;

  @Output() sortChange = new EventEmitter<SortState>();
  @Output() delete = new EventEmitter<IProject>();

  displayedColumns: string[] = [
    'code',
    'name',
    'description',
    'startDate',
    'endDate',
    'budget',
    'progress',
    'status',
    'client',
    'manager',
    'note',
  ];

  // Right-click context menu (view/edit/delete moved here instead of always-visible
  // row buttons). mat-menu has no "open at x/y" API, so the standard approach is a
  // hidden trigger element whose position we move to the cursor, then open it
  // programmatically.
  @ViewChild(MatMenuTrigger) contextMenu!: MatMenuTrigger;
  contextMenuPosition = { x: 0, y: 0 };

  protected readonly projectService = inject(ProjectService);

  trackId = (item: IProject): number => this.projectService.getProjectIdentifier(item);

  onRowContextMenu(event: MouseEvent, project: IProject): void {
    event.preventDefault();
    this.contextMenuPosition = { x: event.clientX, y: event.clientY };
    this.contextMenu.menuData = { project };
    this.contextMenu.menu?.focusFirstItem('mouse');
    this.contextMenu.openMenu();
  }
}

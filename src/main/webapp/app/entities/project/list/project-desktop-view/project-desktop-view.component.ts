import { Component, EventEmitter, Input, Output, Signal, WritableSignal } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { SortByDirective, SortDirective, type SortState } from 'app/shared/sort';
import { FormatMediumDatePipe } from 'app/shared/date';

import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IProject } from '../../project.model';
import { ProjectService } from '../../service/project.service';
import { inject } from '@angular/core';

@Component({
  selector: 'jhi-project-desktop-view',
  templateUrl: './project-desktop-view.component.html',
  styleUrls: ['./project-desktop-view.component.scss'],
  imports: [
    RouterModule,
    SharedModule,
    SortDirective,
    SortByDirective,
    FormatMediumDatePipe,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
})
export class ProjectDesktopViewComponent {
  // The parent's signal is passed directly (not called) so this component
  // always reads the same live source of truth rather than a stale copy.
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
    'actions',
  ];

  protected readonly projectService = inject(ProjectService);

  trackId = (item: IProject): number => this.projectService.getProjectIdentifier(item);
}

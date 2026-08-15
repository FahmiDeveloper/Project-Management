import { Component, EventEmitter, Input, Output, Signal } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { FormatMediumDatePipe } from 'app/shared/date';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { IProject } from '../../project.model';

@Component({
  selector: 'jhi-project-mobile-view',
  templateUrl: './project-mobile-view.component.html',
  styleUrls: ['./project-mobile-view.component.scss'],
  imports: [
    RouterModule,
    SharedModule,
    FormatMediumDatePipe,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressBarModule,
  ],
})
export class ProjectMobileViewComponent {
  // Same signal instance the parent owns — no data duplication, no manual sync.
  @Input({ required: true }) projects!: Signal<IProject[]>;
  @Input({ required: true }) statusLabelFn!: (status: string | null | undefined) => string;

  @Output() delete = new EventEmitter<IProject>();
}

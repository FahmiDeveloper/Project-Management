import { Component, EventEmitter, Input, Output, Signal } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { FormatMediumDatePipe } from 'app/shared/date';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ISprint } from '../../sprint.model';

@Component({
  selector: 'jhi-sprint-mobile-view',
  templateUrl: './sprint-mobile-view.component.html',
  styleUrls: ['./sprint-mobile-view.component.scss'],
  imports: [RouterModule, SharedModule, FormatMediumDatePipe, MatCardModule, MatIconModule, MatButtonModule, MatTooltipModule],
})
export class SprintMobileViewComponent {
  @Input({ required: true }) sprints!: Signal<ISprint[]>;
  @Input({ required: true }) statusLabelFn!: (status: string | null | undefined) => string;

  @Output() delete = new EventEmitter<ISprint>();
}

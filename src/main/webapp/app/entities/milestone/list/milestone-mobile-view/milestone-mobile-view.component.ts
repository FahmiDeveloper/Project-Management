import { Component, EventEmitter, Input, Output, Signal } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { FormatMediumDatePipe } from 'app/shared/date';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IMilestone } from '../../milestone.model';

@Component({
  selector: 'jhi-milestone-mobile-view',
  templateUrl: './milestone-mobile-view.component.html',
  styleUrls: ['./milestone-mobile-view.component.scss'],
  imports: [RouterModule, SharedModule, FormatMediumDatePipe, MatCardModule, MatIconModule, MatButtonModule, MatTooltipModule],
})
export class MilestoneMobileViewComponent {
  @Input({ required: true }) milestones!: Signal<IMilestone[]>;
  @Input({ required: true }) statusLabelFn!: (status: string | null | undefined) => string;

  @Output() delete = new EventEmitter<IMilestone>();
}

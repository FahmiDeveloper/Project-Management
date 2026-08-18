import { Component, EventEmitter, Input, Output, Signal } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { FormatMediumDatePipe } from 'app/shared/date';
import { MaterialModule } from 'app/shared/material.module';

import { IProject } from '../../project.model';

@Component({
  selector: 'jhi-project-mobile-view',
  templateUrl: './project-mobile-view.component.html',
  styleUrls: ['./project-mobile-view.component.scss'],
  imports: [RouterModule, SharedModule, FormatMediumDatePipe, MaterialModule],
})
export class ProjectMobileViewComponent {
  @Input({ required: true }) projects!: Signal<IProject[]>;
  @Input({ required: true }) statusLabelFn!: (status: string | null | undefined) => string;

  @Output() delete = new EventEmitter<IProject>();
}

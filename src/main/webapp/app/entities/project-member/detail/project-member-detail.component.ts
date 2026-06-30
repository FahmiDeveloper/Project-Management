import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { FormatMediumDatePipe } from 'app/shared/date';
import { IProjectMember } from '../project-member.model';

@Component({
  selector: 'jhi-project-member-detail',
  templateUrl: './project-member-detail.component.html',
  imports: [SharedModule, RouterModule, FormatMediumDatePipe],
})
export class ProjectMemberDetailComponent {
  projectMember = input<IProjectMember | null>(null);

  previousState(): void {
    window.history.back();
  }
}

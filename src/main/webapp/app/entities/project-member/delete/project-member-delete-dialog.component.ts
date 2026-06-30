import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IProjectMember } from '../project-member.model';
import { ProjectMemberService } from '../service/project-member.service';

@Component({
  templateUrl: './project-member-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class ProjectMemberDeleteDialogComponent {
  projectMember?: IProjectMember;

  protected projectMemberService = inject(ProjectMemberService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.projectMemberService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}

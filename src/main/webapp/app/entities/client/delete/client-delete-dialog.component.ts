import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IClient } from '../client.model';
import { ClientService } from '../service/client.service';
import { ProjectService } from 'app/entities/project/service/project.service';
import { forkJoin } from 'rxjs';

@Component({
  templateUrl: './client-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class ClientDeleteDialogComponent implements OnInit {
  client?: IClient;
  messages: { message: string }[] = [];
  checkingReferences = true;

  protected clientService = inject(ClientService);
  protected projectService = inject(ProjectService);
  protected activeModal = inject(NgbActiveModal);

  ngOnInit(): void {
    if (!this.client?.id) {
      this.checkingReferences = false;
      return;
    }

    const id = this.client.id;
    forkJoin({
      projects: this.projectService.count({ clientId: id }),
    }).subscribe(({ projects }) => {
      if ((projects.body ?? 0) > 0) {
        this.messages.push({ message: `Projects list has ${projects.body} row(s) with this client and cannot be deleted.` });
      }
      this.checkingReferences = false;
    });
  }

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.clientService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}

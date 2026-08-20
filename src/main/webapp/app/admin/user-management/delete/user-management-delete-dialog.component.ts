import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { User } from '../user-management.model';
import { UserManagementService } from '../service/user-management.service';
import { EmployeeService } from 'app/entities/employee/service/employee.service';

@Component({
  selector: 'jhi-user-mgmt-delete-dialog',
  templateUrl: './user-management-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export default class UserManagementDeleteDialogComponent implements OnInit {
  user?: User;

  // true while we're checking whether this user is still assigned to an employee
  checkingEmployeeLink = true;
  // true if at least one employee record still references this user
  hasLinkedEmployee = false;

  private readonly userService = inject(UserManagementService);
  private readonly employeeService = inject(EmployeeService);
  private readonly activeModal = inject(NgbActiveModal);

  ngOnInit(): void {
    this.checkEmployeeLink();
  }

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(login: string): void {
    this.userService.delete(login).subscribe(() => {
      this.activeModal.close('deleted');
    });
  }

  private checkEmployeeLink(): void {
    const userId = this.user?.id;

    if (userId === undefined || userId === null) {
      this.checkingEmployeeLink = false;
      return;
    }

    this.employeeService.existsForUser(userId).subscribe({
      next: exists => {
        this.hasLinkedEmployee = exists;
        this.checkingEmployeeLink = false;
      },
      error: () => {
        // Fail open on the check itself so a broken lookup doesn't permanently
        // lock the dialog in a loading state - the normal delete flow (and its
        // own error handling) still runs if the user proceeds.
        this.checkingEmployeeLink = false;
      },
    });
  }
}

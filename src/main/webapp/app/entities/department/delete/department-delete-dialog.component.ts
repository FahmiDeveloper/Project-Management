import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IDepartment } from '../department.model';
import { DepartmentService } from '../service/department.service';
import { EmployeeService } from 'app/entities/employee/service/employee.service';
import { forkJoin } from 'rxjs';

@Component({
  templateUrl: './department-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class DepartmentDeleteDialogComponent implements OnInit {
  department?: IDepartment;
  messages: { message: string }[] = [];
  checkingReferences = true;

  protected departmentService = inject(DepartmentService);
  protected employeeService = inject(EmployeeService);
  protected activeModal = inject(NgbActiveModal);

  ngOnInit(): void {
    if (!this.department?.id) {
      this.checkingReferences = false;
      return;
    }

    const id = this.department.id;
    forkJoin({
      employees: this.employeeService.count({ departmentId: id }),
    }).subscribe(({ employees }) => {
      if ((employees.body ?? 0) > 0) {
        this.messages.push({ message: `Employees list has ${employees.body} row(s) with this department and cannot be deleted.` });
      }
      this.checkingReferences = false;
    });
  }

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.departmentService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}

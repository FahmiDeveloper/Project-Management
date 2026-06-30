import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IEmployee, NewEmployee } from '../employee.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IEmployee for edit and NewEmployeeFormGroupInput for create.
 */
type EmployeeFormGroupInput = IEmployee | PartialWithRequiredKeyOf<NewEmployee>;

type EmployeeFormDefaults = Pick<NewEmployee, 'id'>;

type EmployeeFormGroupContent = {
  id: FormControl<IEmployee['id'] | NewEmployee['id']>;
  employeeNumber: FormControl<IEmployee['employeeNumber']>;
  firstName: FormControl<IEmployee['firstName']>;
  lastName: FormControl<IEmployee['lastName']>;
  phone: FormControl<IEmployee['phone']>;
  jobTitle: FormControl<IEmployee['jobTitle']>;
  hireDate: FormControl<IEmployee['hireDate']>;
  user: FormControl<IEmployee['user']>;
  department: FormControl<IEmployee['department']>;
};

export type EmployeeFormGroup = FormGroup<EmployeeFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class EmployeeFormService {
  createEmployeeFormGroup(employee: EmployeeFormGroupInput = { id: null }): EmployeeFormGroup {
    const employeeRawValue = {
      ...this.getFormDefaults(),
      ...employee,
    };
    return new FormGroup<EmployeeFormGroupContent>({
      id: new FormControl(
        { value: employeeRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      employeeNumber: new FormControl(employeeRawValue.employeeNumber, {
        validators: [Validators.required, Validators.minLength(3), Validators.maxLength(20)],
      }),
      firstName: new FormControl(employeeRawValue.firstName, {
        validators: [Validators.required, Validators.minLength(2), Validators.maxLength(50)],
      }),
      lastName: new FormControl(employeeRawValue.lastName, {
        validators: [Validators.required, Validators.minLength(2), Validators.maxLength(50)],
      }),
      phone: new FormControl(employeeRawValue.phone, {
        validators: [Validators.maxLength(20)],
      }),
      jobTitle: new FormControl(employeeRawValue.jobTitle, {
        validators: [Validators.required, Validators.maxLength(100)],
      }),
      hireDate: new FormControl(employeeRawValue.hireDate, {
        validators: [Validators.required],
      }),
      user: new FormControl(employeeRawValue.user),
      department: new FormControl(employeeRawValue.department),
    });
  }

  getEmployee(form: EmployeeFormGroup): IEmployee | NewEmployee {
    return form.getRawValue() as IEmployee | NewEmployee;
  }

  resetForm(form: EmployeeFormGroup, employee: EmployeeFormGroupInput): void {
    const employeeRawValue = { ...this.getFormDefaults(), ...employee };
    form.reset(
      {
        ...employeeRawValue,
        id: { value: employeeRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): EmployeeFormDefaults {
    return {
      id: null,
    };
  }
}

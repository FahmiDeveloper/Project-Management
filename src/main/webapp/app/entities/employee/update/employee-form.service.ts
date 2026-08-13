import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import dayjs from 'dayjs/esm';

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

// hireDate defaults to today when creating a new employee.
type EmployeeFormDefaults = Pick<NewEmployee, 'id'> & { hireDate: dayjs.Dayjs | null };

// hireDate is stored as native Date in the form because mat-datepicker
// (with MatNativeDateModule) cannot read/format dayjs objects. It is converted
// back to dayjs when the form value is read out via getEmployee().
type EmployeeFormGroupContent = {
  id: FormControl<IEmployee['id'] | NewEmployee['id']>;
  employeeNumber: FormControl<IEmployee['employeeNumber']>;
  firstName: FormControl<IEmployee['firstName']>;
  lastName: FormControl<IEmployee['lastName']>;
  phone: FormControl<IEmployee['phone']>;
  jobTitle: FormControl<IEmployee['jobTitle']>;
  hireDate: FormControl<Date | null>;
  user: FormControl<IEmployee['user']>;
  department: FormControl<IEmployee['department']>;
  note: FormControl<IEmployee['note']>;
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
      hireDate: new FormControl(this.toDate(employeeRawValue.hireDate), {
        validators: [Validators.required],
      }),
      user: new FormControl(employeeRawValue.user, {
        validators: [Validators.required],
      }),
      department: new FormControl(employeeRawValue.department, {
        validators: [Validators.required],
      }),
      note: new FormControl(employeeRawValue.note, {
        validators: [Validators.maxLength(1000)],
      }),
    });
  }

  getEmployee(form: EmployeeFormGroup): IEmployee | NewEmployee {
    const raw = form.getRawValue();
    return {
      ...raw,
      hireDate: this.toDayjs(raw.hireDate),
    } as IEmployee | NewEmployee;
  }

  resetForm(form: EmployeeFormGroup, employee: EmployeeFormGroupInput): void {
    const employeeRawValue = { ...this.getFormDefaults(), ...employee };
    form.reset(
      {
        ...employeeRawValue,
        hireDate: this.toDate(employeeRawValue.hireDate),
        id: { value: employeeRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): EmployeeFormDefaults {
    return {
      id: null,
      hireDate: dayjs(), // today, used only when creating a new employee
    };
  }

  // dayjs (from the API, or the today default) -> native Date (for mat-datepicker display)
  private toDate(value: dayjs.Dayjs | null | undefined): Date | null {
    if (!value) {
      return null;
    }
    const d = dayjs(value);
    return d.isValid() ? d.toDate() : null;
  }

  // native Date (from mat-datepicker) -> dayjs (for the API payload)
  private toDayjs(value: Date | null | undefined): dayjs.Dayjs | null {
    if (!value) {
      return null;
    }
    const d = dayjs(value);
    return d.isValid() ? d : null;
  }
}

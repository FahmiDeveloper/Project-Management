import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IDashboard, NewDashboard } from '../dashboard.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IDashboard for edit and NewDashboardFormGroupInput for create.
 */
type DashboardFormGroupInput = IDashboard | PartialWithRequiredKeyOf<NewDashboard>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IDashboard | NewDashboard> = Omit<T, 'createdDate' | 'updatedDate'> & {
  createdDate?: string | null;
  updatedDate?: string | null;
};

type DashboardFormRawValue = FormValueOf<IDashboard>;

type NewDashboardFormRawValue = FormValueOf<NewDashboard>;

type DashboardFormDefaults = Pick<NewDashboard, 'id' | 'isDefault' | 'createdDate' | 'updatedDate'>;

type DashboardFormGroupContent = {
  id: FormControl<DashboardFormRawValue['id'] | NewDashboard['id']>;
  name: FormControl<DashboardFormRawValue['name']>;
  description: FormControl<DashboardFormRawValue['description']>;
  layout: FormControl<DashboardFormRawValue['layout']>;
  config: FormControl<DashboardFormRawValue['config']>;
  isDefault: FormControl<DashboardFormRawValue['isDefault']>;
  createdDate: FormControl<DashboardFormRawValue['createdDate']>;
  updatedDate: FormControl<DashboardFormRawValue['updatedDate']>;
  employee: FormControl<DashboardFormRawValue['employee']>;
  project: FormControl<DashboardFormRawValue['project']>;
};

export type DashboardFormGroup = FormGroup<DashboardFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class DashboardFormService {
  createDashboardFormGroup(dashboard: DashboardFormGroupInput = { id: null }): DashboardFormGroup {
    const dashboardRawValue = this.convertDashboardToDashboardRawValue({
      ...this.getFormDefaults(),
      ...dashboard,
    });
    return new FormGroup<DashboardFormGroupContent>({
      id: new FormControl(
        { value: dashboardRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      name: new FormControl(dashboardRawValue.name, {
        validators: [Validators.required],
      }),
      description: new FormControl(dashboardRawValue.description),
      layout: new FormControl(dashboardRawValue.layout, {
        validators: [Validators.required],
      }),
      config: new FormControl(dashboardRawValue.config),
      isDefault: new FormControl(dashboardRawValue.isDefault, {
        validators: [Validators.required],
      }),
      createdDate: new FormControl(dashboardRawValue.createdDate, {
        validators: [Validators.required],
      }),
      updatedDate: new FormControl(dashboardRawValue.updatedDate),
      employee: new FormControl(dashboardRawValue.employee),
      project: new FormControl(dashboardRawValue.project),
    });
  }

  getDashboard(form: DashboardFormGroup): IDashboard | NewDashboard {
    return this.convertDashboardRawValueToDashboard(form.getRawValue() as DashboardFormRawValue | NewDashboardFormRawValue);
  }

  resetForm(form: DashboardFormGroup, dashboard: DashboardFormGroupInput): void {
    const dashboardRawValue = this.convertDashboardToDashboardRawValue({ ...this.getFormDefaults(), ...dashboard });
    form.reset(
      {
        ...dashboardRawValue,
        id: { value: dashboardRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): DashboardFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      isDefault: false,
      createdDate: currentTime,
      updatedDate: currentTime,
    };
  }

  private convertDashboardRawValueToDashboard(rawDashboard: DashboardFormRawValue | NewDashboardFormRawValue): IDashboard | NewDashboard {
    return {
      ...rawDashboard,
      createdDate: dayjs(rawDashboard.createdDate, DATE_TIME_FORMAT),
      updatedDate: dayjs(rawDashboard.updatedDate, DATE_TIME_FORMAT),
    };
  }

  private convertDashboardToDashboardRawValue(
    dashboard: IDashboard | (Partial<NewDashboard> & DashboardFormDefaults),
  ): DashboardFormRawValue | PartialWithRequiredKeyOf<NewDashboardFormRawValue> {
    return {
      ...dashboard,
      createdDate: dashboard.createdDate ? dashboard.createdDate.format(DATE_TIME_FORMAT) : undefined,
      updatedDate: dashboard.updatedDate ? dashboard.updatedDate.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}

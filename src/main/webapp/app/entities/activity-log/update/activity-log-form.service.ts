import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IActivityLog, NewActivityLog } from '../activity-log.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IActivityLog for edit and NewActivityLogFormGroupInput for create.
 */
type ActivityLogFormGroupInput = IActivityLog | PartialWithRequiredKeyOf<NewActivityLog>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IActivityLog | NewActivityLog> = Omit<T, 'createdDate'> & {
  createdDate?: string | null;
};

type ActivityLogFormRawValue = FormValueOf<IActivityLog>;

type NewActivityLogFormRawValue = FormValueOf<NewActivityLog>;

type ActivityLogFormDefaults = Pick<NewActivityLog, 'id' | 'createdDate'>;

type ActivityLogFormGroupContent = {
  id: FormControl<ActivityLogFormRawValue['id'] | NewActivityLog['id']>;
  action: FormControl<ActivityLogFormRawValue['action']>;
  entityName: FormControl<ActivityLogFormRawValue['entityName']>;
  entityId: FormControl<ActivityLogFormRawValue['entityId']>;
  description: FormControl<ActivityLogFormRawValue['description']>;
  createdDate: FormControl<ActivityLogFormRawValue['createdDate']>;
  employee: FormControl<ActivityLogFormRawValue['employee']>;
};

export type ActivityLogFormGroup = FormGroup<ActivityLogFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class ActivityLogFormService {
  createActivityLogFormGroup(activityLog: ActivityLogFormGroupInput = { id: null }): ActivityLogFormGroup {
    const activityLogRawValue = this.convertActivityLogToActivityLogRawValue({
      ...this.getFormDefaults(),
      ...activityLog,
    });
    return new FormGroup<ActivityLogFormGroupContent>({
      id: new FormControl(
        { value: activityLogRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      action: new FormControl(activityLogRawValue.action, {
        validators: [Validators.required],
      }),
      entityName: new FormControl(activityLogRawValue.entityName, {
        validators: [Validators.required],
      }),
      entityId: new FormControl(activityLogRawValue.entityId),
      description: new FormControl(activityLogRawValue.description),
      createdDate: new FormControl(activityLogRawValue.createdDate, {
        validators: [Validators.required],
      }),
      employee: new FormControl(activityLogRawValue.employee),
    });
  }

  getActivityLog(form: ActivityLogFormGroup): IActivityLog | NewActivityLog {
    return this.convertActivityLogRawValueToActivityLog(form.getRawValue() as ActivityLogFormRawValue | NewActivityLogFormRawValue);
  }

  resetForm(form: ActivityLogFormGroup, activityLog: ActivityLogFormGroupInput): void {
    const activityLogRawValue = this.convertActivityLogToActivityLogRawValue({ ...this.getFormDefaults(), ...activityLog });
    form.reset(
      {
        ...activityLogRawValue,
        id: { value: activityLogRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): ActivityLogFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      createdDate: currentTime,
    };
  }

  private convertActivityLogRawValueToActivityLog(
    rawActivityLog: ActivityLogFormRawValue | NewActivityLogFormRawValue,
  ): IActivityLog | NewActivityLog {
    return {
      ...rawActivityLog,
      createdDate: dayjs(rawActivityLog.createdDate, DATE_TIME_FORMAT),
    };
  }

  private convertActivityLogToActivityLogRawValue(
    activityLog: IActivityLog | (Partial<NewActivityLog> & ActivityLogFormDefaults),
  ): ActivityLogFormRawValue | PartialWithRequiredKeyOf<NewActivityLogFormRawValue> {
    return {
      ...activityLog,
      createdDate: activityLog.createdDate ? activityLog.createdDate.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}

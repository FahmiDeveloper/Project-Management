import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { ITimeEntry, NewTimeEntry } from '../time-entry.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts ITimeEntry for edit and NewTimeEntryFormGroupInput for create.
 */
type TimeEntryFormGroupInput = ITimeEntry | PartialWithRequiredKeyOf<NewTimeEntry>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends ITimeEntry | NewTimeEntry> = Omit<T, 'startTime' | 'endTime'> & {
  startTime?: string | null;
  endTime?: string | null;
};

type TimeEntryFormRawValue = FormValueOf<ITimeEntry>;

type NewTimeEntryFormRawValue = FormValueOf<NewTimeEntry>;

type TimeEntryFormDefaults = Pick<NewTimeEntry, 'id' | 'startTime' | 'endTime'>;

type TimeEntryFormGroupContent = {
  id: FormControl<TimeEntryFormRawValue['id'] | NewTimeEntry['id']>;
  description: FormControl<TimeEntryFormRawValue['description']>;
  startTime: FormControl<TimeEntryFormRawValue['startTime']>;
  endTime: FormControl<TimeEntryFormRawValue['endTime']>;
  hours: FormControl<TimeEntryFormRawValue['hours']>;
  entryDate: FormControl<TimeEntryFormRawValue['entryDate']>;
  task: FormControl<TimeEntryFormRawValue['task']>;
  employee: FormControl<TimeEntryFormRawValue['employee']>;
};

export type TimeEntryFormGroup = FormGroup<TimeEntryFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class TimeEntryFormService {
  createTimeEntryFormGroup(timeEntry: TimeEntryFormGroupInput = { id: null }): TimeEntryFormGroup {
    const timeEntryRawValue = this.convertTimeEntryToTimeEntryRawValue({
      ...this.getFormDefaults(),
      ...timeEntry,
    });
    return new FormGroup<TimeEntryFormGroupContent>({
      id: new FormControl(
        { value: timeEntryRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      description: new FormControl(timeEntryRawValue.description),
      startTime: new FormControl(timeEntryRawValue.startTime, {
        validators: [Validators.required],
      }),
      endTime: new FormControl(timeEntryRawValue.endTime, {
        validators: [Validators.required],
      }),
      hours: new FormControl(timeEntryRawValue.hours, {
        validators: [Validators.required],
      }),
      entryDate: new FormControl(timeEntryRawValue.entryDate, {
        validators: [Validators.required],
      }),
      task: new FormControl(timeEntryRawValue.task),
      employee: new FormControl(timeEntryRawValue.employee),
    });
  }

  getTimeEntry(form: TimeEntryFormGroup): ITimeEntry | NewTimeEntry {
    return this.convertTimeEntryRawValueToTimeEntry(form.getRawValue() as TimeEntryFormRawValue | NewTimeEntryFormRawValue);
  }

  resetForm(form: TimeEntryFormGroup, timeEntry: TimeEntryFormGroupInput): void {
    const timeEntryRawValue = this.convertTimeEntryToTimeEntryRawValue({ ...this.getFormDefaults(), ...timeEntry });
    form.reset(
      {
        ...timeEntryRawValue,
        id: { value: timeEntryRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): TimeEntryFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      startTime: currentTime,
      endTime: currentTime,
    };
  }

  private convertTimeEntryRawValueToTimeEntry(rawTimeEntry: TimeEntryFormRawValue | NewTimeEntryFormRawValue): ITimeEntry | NewTimeEntry {
    return {
      ...rawTimeEntry,
      startTime: dayjs(rawTimeEntry.startTime, DATE_TIME_FORMAT),
      endTime: dayjs(rawTimeEntry.endTime, DATE_TIME_FORMAT),
    };
  }

  private convertTimeEntryToTimeEntryRawValue(
    timeEntry: ITimeEntry | (Partial<NewTimeEntry> & TimeEntryFormDefaults),
  ): TimeEntryFormRawValue | PartialWithRequiredKeyOf<NewTimeEntryFormRawValue> {
    return {
      ...timeEntry,
      startTime: timeEntry.startTime ? timeEntry.startTime.format(DATE_TIME_FORMAT) : undefined,
      endTime: timeEntry.endTime ? timeEntry.endTime.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}

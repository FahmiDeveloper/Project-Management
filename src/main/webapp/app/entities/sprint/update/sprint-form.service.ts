import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import dayjs from 'dayjs/esm';

import { ISprint, NewSprint } from '../sprint.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts ISprint for edit and NewSprintFormGroupInput for create.
 */
type SprintFormGroupInput = ISprint | PartialWithRequiredKeyOf<NewSprint>;

// startDate defaults to today when creating a new sprint.
type SprintFormDefaults = Pick<NewSprint, 'id'> & { startDate: dayjs.Dayjs | null };

// startDate/endDate are stored as native Date in the form because mat-datepicker
// (with MatNativeDateModule) cannot read/format dayjs objects. They are converted
// back to dayjs when the form value is read out via getSprint().
type SprintFormGroupContent = {
  id: FormControl<ISprint['id'] | NewSprint['id']>;
  name: FormControl<ISprint['name']>;
  goal: FormControl<ISprint['goal']>;
  startDate: FormControl<Date | null>;
  endDate: FormControl<Date | null>;
  status: FormControl<ISprint['status']>;
  capacity: FormControl<ISprint['capacity']>;
  velocity: FormControl<ISprint['velocity']>;
  project: FormControl<ISprint['project']>;
};

export type SprintFormGroup = FormGroup<SprintFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class SprintFormService {
  createSprintFormGroup(sprint: SprintFormGroupInput = { id: null }): SprintFormGroup {
    const sprintRawValue = {
      ...this.getFormDefaults(),
      ...sprint,
    };
    return new FormGroup<SprintFormGroupContent>({
      id: new FormControl(
        { value: sprintRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      name: new FormControl(sprintRawValue.name, {
        validators: [Validators.required, Validators.minLength(2), Validators.maxLength(100)],
      }),
      goal: new FormControl(sprintRawValue.goal),
      startDate: new FormControl(this.toDate(sprintRawValue.startDate), {
        validators: [Validators.required],
      }),
      endDate: new FormControl(this.toDate(sprintRawValue.endDate), {
        validators: [Validators.required],
      }),
      status: new FormControl(sprintRawValue.status, {
        validators: [Validators.required],
      }),
      capacity: new FormControl(sprintRawValue.capacity, {
        validators: [Validators.min(1)],
      }),
      velocity: new FormControl(sprintRawValue.velocity, {
        validators: [Validators.min(0)],
      }),
      project: new FormControl(sprintRawValue.project, {
        validators: [Validators.required],
      }),
    });
  }

  getSprint(form: SprintFormGroup): ISprint | NewSprint {
    const raw = form.getRawValue();
    return {
      ...raw,
      startDate: this.toDayjs(raw.startDate),
      endDate: this.toDayjs(raw.endDate),
    } as ISprint | NewSprint;
  }

  resetForm(form: SprintFormGroup, sprint: SprintFormGroupInput): void {
    const sprintRawValue = { ...this.getFormDefaults(), ...sprint };
    form.reset(
      {
        ...sprintRawValue,
        startDate: this.toDate(sprintRawValue.startDate),
        endDate: this.toDate(sprintRawValue.endDate),
        id: { value: sprintRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): SprintFormDefaults {
    return {
      id: null,
      startDate: dayjs(), // today, used only when creating a new sprint
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

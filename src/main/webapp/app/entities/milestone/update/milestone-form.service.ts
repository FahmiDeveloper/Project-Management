import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import dayjs from 'dayjs/esm';

import { IMilestone, NewMilestone } from '../milestone.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IMilestone for edit and NewMilestoneFormGroupInput for create.
 */
type MilestoneFormGroupInput = IMilestone | PartialWithRequiredKeyOf<NewMilestone>;

// startDate defaults to today when creating a new milestone.
type MilestoneFormDefaults = Pick<NewMilestone, 'id'> & { startDate: dayjs.Dayjs | null };

// startDate/dueDate are stored as native Date in the form because mat-datepicker
// (with MatNativeDateModule) cannot read/format dayjs objects. They are converted
// back to dayjs when the form value is read out via getMilestone().
type MilestoneFormGroupContent = {
  id: FormControl<IMilestone['id'] | NewMilestone['id']>;
  title: FormControl<IMilestone['title']>;
  description: FormControl<IMilestone['description']>;
  startDate: FormControl<Date | null>;
  dueDate: FormControl<Date | null>;
  status: FormControl<IMilestone['status']>;
  project: FormControl<IMilestone['project']>;
};

export type MilestoneFormGroup = FormGroup<MilestoneFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class MilestoneFormService {
  createMilestoneFormGroup(milestone: MilestoneFormGroupInput = { id: null }): MilestoneFormGroup {
    const milestoneRawValue = {
      ...this.getFormDefaults(),
      ...milestone,
    };
    return new FormGroup<MilestoneFormGroupContent>({
      id: new FormControl(
        { value: milestoneRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      title: new FormControl(milestoneRawValue.title, {
        validators: [Validators.required, Validators.minLength(2), Validators.maxLength(150)],
      }),
      description: new FormControl(milestoneRawValue.description),
      startDate: new FormControl(this.toDate(milestoneRawValue.startDate), {
        validators: [Validators.required],
      }),
      dueDate: new FormControl(this.toDate(milestoneRawValue.dueDate), {
        validators: [Validators.required],
      }),
      status: new FormControl(milestoneRawValue.status, {
        validators: [Validators.required],
      }),
      project: new FormControl(milestoneRawValue.project, {
        validators: [Validators.required],
      }),
    });
  }

  getMilestone(form: MilestoneFormGroup): IMilestone | NewMilestone {
    const raw = form.getRawValue();
    return {
      ...raw,
      startDate: this.toDayjs(raw.startDate),
      dueDate: this.toDayjs(raw.dueDate),
    } as IMilestone | NewMilestone;
  }

  resetForm(form: MilestoneFormGroup, milestone: MilestoneFormGroupInput): void {
    const milestoneRawValue = { ...this.getFormDefaults(), ...milestone };
    form.reset(
      {
        ...milestoneRawValue,
        startDate: this.toDate(milestoneRawValue.startDate),
        dueDate: this.toDate(milestoneRawValue.dueDate),
        id: { value: milestoneRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): MilestoneFormDefaults {
    return {
      id: null,
      startDate: dayjs(), // today, used only when creating a new milestone
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

import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IChecklist, NewChecklist } from '../checklist.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IChecklist for edit and NewChecklistFormGroupInput for create.
 */
type ChecklistFormGroupInput = IChecklist | PartialWithRequiredKeyOf<NewChecklist>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IChecklist | NewChecklist> = Omit<T, 'createdDate'> & {
  createdDate?: string | null;
};

type ChecklistFormRawValue = FormValueOf<IChecklist>;

type NewChecklistFormRawValue = FormValueOf<NewChecklist>;

type ChecklistFormDefaults = Pick<NewChecklist, 'id' | 'createdDate'>;

type ChecklistFormGroupContent = {
  id: FormControl<ChecklistFormRawValue['id'] | NewChecklist['id']>;
  title: FormControl<ChecklistFormRawValue['title']>;
  createdDate: FormControl<ChecklistFormRawValue['createdDate']>;
  task: FormControl<ChecklistFormRawValue['task']>;
};

export type ChecklistFormGroup = FormGroup<ChecklistFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class ChecklistFormService {
  createChecklistFormGroup(checklist: ChecklistFormGroupInput = { id: null }): ChecklistFormGroup {
    const checklistRawValue = this.convertChecklistToChecklistRawValue({
      ...this.getFormDefaults(),
      ...checklist,
    });
    return new FormGroup<ChecklistFormGroupContent>({
      id: new FormControl(
        { value: checklistRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      title: new FormControl(checklistRawValue.title, {
        validators: [Validators.required],
      }),
      createdDate: new FormControl(checklistRawValue.createdDate, {
        validators: [Validators.required],
      }),
      task: new FormControl(checklistRawValue.task),
    });
  }

  getChecklist(form: ChecklistFormGroup): IChecklist | NewChecklist {
    return this.convertChecklistRawValueToChecklist(form.getRawValue() as ChecklistFormRawValue | NewChecklistFormRawValue);
  }

  resetForm(form: ChecklistFormGroup, checklist: ChecklistFormGroupInput): void {
    const checklistRawValue = this.convertChecklistToChecklistRawValue({ ...this.getFormDefaults(), ...checklist });
    form.reset(
      {
        ...checklistRawValue,
        id: { value: checklistRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): ChecklistFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      createdDate: currentTime,
    };
  }

  private convertChecklistRawValueToChecklist(rawChecklist: ChecklistFormRawValue | NewChecklistFormRawValue): IChecklist | NewChecklist {
    return {
      ...rawChecklist,
      createdDate: dayjs(rawChecklist.createdDate, DATE_TIME_FORMAT),
    };
  }

  private convertChecklistToChecklistRawValue(
    checklist: IChecklist | (Partial<NewChecklist> & ChecklistFormDefaults),
  ): ChecklistFormRawValue | PartialWithRequiredKeyOf<NewChecklistFormRawValue> {
    return {
      ...checklist,
      createdDate: checklist.createdDate ? checklist.createdDate.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}

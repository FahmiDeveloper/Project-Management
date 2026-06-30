import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IChecklistItem, NewChecklistItem } from '../checklist-item.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IChecklistItem for edit and NewChecklistItemFormGroupInput for create.
 */
type ChecklistItemFormGroupInput = IChecklistItem | PartialWithRequiredKeyOf<NewChecklistItem>;

type ChecklistItemFormDefaults = Pick<NewChecklistItem, 'id' | 'isDone'>;

type ChecklistItemFormGroupContent = {
  id: FormControl<IChecklistItem['id'] | NewChecklistItem['id']>;
  content: FormControl<IChecklistItem['content']>;
  isDone: FormControl<IChecklistItem['isDone']>;
  position: FormControl<IChecklistItem['position']>;
  checklist: FormControl<IChecklistItem['checklist']>;
};

export type ChecklistItemFormGroup = FormGroup<ChecklistItemFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class ChecklistItemFormService {
  createChecklistItemFormGroup(checklistItem: ChecklistItemFormGroupInput = { id: null }): ChecklistItemFormGroup {
    const checklistItemRawValue = {
      ...this.getFormDefaults(),
      ...checklistItem,
    };
    return new FormGroup<ChecklistItemFormGroupContent>({
      id: new FormControl(
        { value: checklistItemRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      content: new FormControl(checklistItemRawValue.content, {
        validators: [Validators.required],
      }),
      isDone: new FormControl(checklistItemRawValue.isDone, {
        validators: [Validators.required],
      }),
      position: new FormControl(checklistItemRawValue.position),
      checklist: new FormControl(checklistItemRawValue.checklist),
    });
  }

  getChecklistItem(form: ChecklistItemFormGroup): IChecklistItem | NewChecklistItem {
    return form.getRawValue() as IChecklistItem | NewChecklistItem;
  }

  resetForm(form: ChecklistItemFormGroup, checklistItem: ChecklistItemFormGroupInput): void {
    const checklistItemRawValue = { ...this.getFormDefaults(), ...checklistItem };
    form.reset(
      {
        ...checklistItemRawValue,
        id: { value: checklistItemRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): ChecklistItemFormDefaults {
    return {
      id: null,
      isDone: false,
    };
  }
}

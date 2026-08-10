import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import dayjs from 'dayjs/esm';

import { ITask, NewTask } from '../task.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts ITask for edit and NewTaskFormGroupInput for create.
 */
type TaskFormGroupInput = ITask | PartialWithRequiredKeyOf<NewTask>;

// startDate defaults to today when creating a new task.
type TaskFormDefaults = Pick<NewTask, 'id'> & { startDate: dayjs.Dayjs | null };

// startDate/dueDate are stored as native Date in the form because mat-datepicker
// (with MatNativeDateModule) cannot read/format dayjs objects. They are converted
// back to dayjs when the form value is read out via getTask().
type TaskFormGroupContent = {
  id: FormControl<ITask['id'] | NewTask['id']>;
  title: FormControl<ITask['title']>;
  description: FormControl<ITask['description']>;
  priority: FormControl<ITask['priority']>;
  status: FormControl<ITask['status']>;
  storyPoints: FormControl<ITask['storyPoints']>;
  estimatedHours: FormControl<ITask['estimatedHours']>;
  spentHours: FormControl<ITask['spentHours']>;
  startDate: FormControl<Date | null>;
  dueDate: FormControl<Date | null>;
  completionPercentage: FormControl<ITask['completionPercentage']>;
  sprint: FormControl<ITask['sprint']>;
  milestone: FormControl<ITask['milestone']>;
  assignedTo: FormControl<ITask['assignedTo']>;
  createdBy: FormControl<ITask['createdBy']>;
};

export type TaskFormGroup = FormGroup<TaskFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class TaskFormService {
  createTaskFormGroup(task: TaskFormGroupInput = { id: null }): TaskFormGroup {
    const taskRawValue = {
      ...this.getFormDefaults(),
      ...task,
    };
    return new FormGroup<TaskFormGroupContent>({
      id: new FormControl(
        { value: taskRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      title: new FormControl(taskRawValue.title, {
        validators: [Validators.required, Validators.minLength(2), Validators.maxLength(200)],
      }),
      description: new FormControl(taskRawValue.description),
      priority: new FormControl(taskRawValue.priority, {
        validators: [Validators.required],
      }),
      status: new FormControl(taskRawValue.status, {
        validators: [Validators.required],
      }),
      storyPoints: new FormControl(taskRawValue.storyPoints, {
        validators: [Validators.min(1), Validators.max(100)],
      }),
      estimatedHours: new FormControl(taskRawValue.estimatedHours, {
        validators: [Validators.min(0)],
      }),
      spentHours: new FormControl(taskRawValue.spentHours, {
        validators: [Validators.min(0)],
      }),
      startDate: new FormControl(this.toDate(taskRawValue.startDate), {
        validators: [Validators.required],
      }),
      dueDate: new FormControl(this.toDate(taskRawValue.dueDate), {
        validators: [Validators.required],
      }),
      completionPercentage: new FormControl(taskRawValue.completionPercentage, {
        validators: [Validators.required, Validators.min(0), Validators.max(100)],
      }),
      sprint: new FormControl(taskRawValue.sprint),
      milestone: new FormControl(taskRawValue.milestone),
      assignedTo: new FormControl(taskRawValue.assignedTo, {
        validators: [Validators.required],
      }),
      createdBy: new FormControl(taskRawValue.createdBy, {
        validators: [Validators.required],
      }),
    });
  }

  getTask(form: TaskFormGroup): ITask | NewTask {
    const raw = form.getRawValue();
    return {
      ...raw,
      startDate: this.toDayjs(raw.startDate),
      dueDate: this.toDayjs(raw.dueDate),
    } as ITask | NewTask;
  }

  resetForm(form: TaskFormGroup, task: TaskFormGroupInput): void {
    const taskRawValue = { ...this.getFormDefaults(), ...task };
    form.reset(
      {
        ...taskRawValue,
        startDate: this.toDate(taskRawValue.startDate),
        dueDate: this.toDate(taskRawValue.dueDate),
        id: { value: taskRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): TaskFormDefaults {
    return {
      id: null,
      startDate: dayjs(), // today, used only when creating a new task
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

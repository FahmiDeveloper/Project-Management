import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

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

type TaskFormDefaults = Pick<NewTask, 'id'>;

type TaskFormGroupContent = {
  id: FormControl<ITask['id'] | NewTask['id']>;
  title: FormControl<ITask['title']>;
  description: FormControl<ITask['description']>;
  priority: FormControl<ITask['priority']>;
  status: FormControl<ITask['status']>;
  storyPoints: FormControl<ITask['storyPoints']>;
  estimatedHours: FormControl<ITask['estimatedHours']>;
  spentHours: FormControl<ITask['spentHours']>;
  startDate: FormControl<ITask['startDate']>;
  dueDate: FormControl<ITask['dueDate']>;
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
      startDate: new FormControl(taskRawValue.startDate),
      dueDate: new FormControl(taskRawValue.dueDate),
      completionPercentage: new FormControl(taskRawValue.completionPercentage, {
        validators: [Validators.required, Validators.min(0), Validators.max(100)],
      }),
      sprint: new FormControl(taskRawValue.sprint),
      milestone: new FormControl(taskRawValue.milestone),
      assignedTo: new FormControl(taskRawValue.assignedTo),
      createdBy: new FormControl(taskRawValue.createdBy),
    });
  }

  getTask(form: TaskFormGroup): ITask | NewTask {
    return form.getRawValue() as ITask | NewTask;
  }

  resetForm(form: TaskFormGroup, task: TaskFormGroupInput): void {
    const taskRawValue = { ...this.getFormDefaults(), ...task };
    form.reset(
      {
        ...taskRawValue,
        id: { value: taskRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): TaskFormDefaults {
    return {
      id: null,
    };
  }
}

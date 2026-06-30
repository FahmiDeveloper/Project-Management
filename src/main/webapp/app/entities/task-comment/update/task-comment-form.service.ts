import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { ITaskComment, NewTaskComment } from '../task-comment.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts ITaskComment for edit and NewTaskCommentFormGroupInput for create.
 */
type TaskCommentFormGroupInput = ITaskComment | PartialWithRequiredKeyOf<NewTaskComment>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends ITaskComment | NewTaskComment> = Omit<T, 'createdDate'> & {
  createdDate?: string | null;
};

type TaskCommentFormRawValue = FormValueOf<ITaskComment>;

type NewTaskCommentFormRawValue = FormValueOf<NewTaskComment>;

type TaskCommentFormDefaults = Pick<NewTaskComment, 'id' | 'createdDate'>;

type TaskCommentFormGroupContent = {
  id: FormControl<TaskCommentFormRawValue['id'] | NewTaskComment['id']>;
  content: FormControl<TaskCommentFormRawValue['content']>;
  createdDate: FormControl<TaskCommentFormRawValue['createdDate']>;
  task: FormControl<TaskCommentFormRawValue['task']>;
  employee: FormControl<TaskCommentFormRawValue['employee']>;
};

export type TaskCommentFormGroup = FormGroup<TaskCommentFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class TaskCommentFormService {
  createTaskCommentFormGroup(taskComment: TaskCommentFormGroupInput = { id: null }): TaskCommentFormGroup {
    const taskCommentRawValue = this.convertTaskCommentToTaskCommentRawValue({
      ...this.getFormDefaults(),
      ...taskComment,
    });
    return new FormGroup<TaskCommentFormGroupContent>({
      id: new FormControl(
        { value: taskCommentRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      content: new FormControl(taskCommentRawValue.content, {
        validators: [Validators.required],
      }),
      createdDate: new FormControl(taskCommentRawValue.createdDate, {
        validators: [Validators.required],
      }),
      task: new FormControl(taskCommentRawValue.task),
      employee: new FormControl(taskCommentRawValue.employee),
    });
  }

  getTaskComment(form: TaskCommentFormGroup): ITaskComment | NewTaskComment {
    return this.convertTaskCommentRawValueToTaskComment(form.getRawValue() as TaskCommentFormRawValue | NewTaskCommentFormRawValue);
  }

  resetForm(form: TaskCommentFormGroup, taskComment: TaskCommentFormGroupInput): void {
    const taskCommentRawValue = this.convertTaskCommentToTaskCommentRawValue({ ...this.getFormDefaults(), ...taskComment });
    form.reset(
      {
        ...taskCommentRawValue,
        id: { value: taskCommentRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): TaskCommentFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      createdDate: currentTime,
    };
  }

  private convertTaskCommentRawValueToTaskComment(
    rawTaskComment: TaskCommentFormRawValue | NewTaskCommentFormRawValue,
  ): ITaskComment | NewTaskComment {
    return {
      ...rawTaskComment,
      createdDate: dayjs(rawTaskComment.createdDate, DATE_TIME_FORMAT),
    };
  }

  private convertTaskCommentToTaskCommentRawValue(
    taskComment: ITaskComment | (Partial<NewTaskComment> & TaskCommentFormDefaults),
  ): TaskCommentFormRawValue | PartialWithRequiredKeyOf<NewTaskCommentFormRawValue> {
    return {
      ...taskComment,
      createdDate: taskComment.createdDate ? taskComment.createdDate.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}

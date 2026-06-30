import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IAttachment, NewAttachment } from '../attachment.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IAttachment for edit and NewAttachmentFormGroupInput for create.
 */
type AttachmentFormGroupInput = IAttachment | PartialWithRequiredKeyOf<NewAttachment>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IAttachment | NewAttachment> = Omit<T, 'uploadedDate'> & {
  uploadedDate?: string | null;
};

type AttachmentFormRawValue = FormValueOf<IAttachment>;

type NewAttachmentFormRawValue = FormValueOf<NewAttachment>;

type AttachmentFormDefaults = Pick<NewAttachment, 'id' | 'uploadedDate'>;

type AttachmentFormGroupContent = {
  id: FormControl<AttachmentFormRawValue['id'] | NewAttachment['id']>;
  fileName: FormControl<AttachmentFormRawValue['fileName']>;
  fileUrl: FormControl<AttachmentFormRawValue['fileUrl']>;
  fileType: FormControl<AttachmentFormRawValue['fileType']>;
  fileSize: FormControl<AttachmentFormRawValue['fileSize']>;
  uploadedDate: FormControl<AttachmentFormRawValue['uploadedDate']>;
  task: FormControl<AttachmentFormRawValue['task']>;
  employee: FormControl<AttachmentFormRawValue['employee']>;
};

export type AttachmentFormGroup = FormGroup<AttachmentFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class AttachmentFormService {
  createAttachmentFormGroup(attachment: AttachmentFormGroupInput = { id: null }): AttachmentFormGroup {
    const attachmentRawValue = this.convertAttachmentToAttachmentRawValue({
      ...this.getFormDefaults(),
      ...attachment,
    });
    return new FormGroup<AttachmentFormGroupContent>({
      id: new FormControl(
        { value: attachmentRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      fileName: new FormControl(attachmentRawValue.fileName, {
        validators: [Validators.required],
      }),
      fileUrl: new FormControl(attachmentRawValue.fileUrl, {
        validators: [Validators.required],
      }),
      fileType: new FormControl(attachmentRawValue.fileType),
      fileSize: new FormControl(attachmentRawValue.fileSize),
      uploadedDate: new FormControl(attachmentRawValue.uploadedDate, {
        validators: [Validators.required],
      }),
      task: new FormControl(attachmentRawValue.task),
      employee: new FormControl(attachmentRawValue.employee),
    });
  }

  getAttachment(form: AttachmentFormGroup): IAttachment | NewAttachment {
    return this.convertAttachmentRawValueToAttachment(form.getRawValue() as AttachmentFormRawValue | NewAttachmentFormRawValue);
  }

  resetForm(form: AttachmentFormGroup, attachment: AttachmentFormGroupInput): void {
    const attachmentRawValue = this.convertAttachmentToAttachmentRawValue({ ...this.getFormDefaults(), ...attachment });
    form.reset(
      {
        ...attachmentRawValue,
        id: { value: attachmentRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): AttachmentFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      uploadedDate: currentTime,
    };
  }

  private convertAttachmentRawValueToAttachment(
    rawAttachment: AttachmentFormRawValue | NewAttachmentFormRawValue,
  ): IAttachment | NewAttachment {
    return {
      ...rawAttachment,
      uploadedDate: dayjs(rawAttachment.uploadedDate, DATE_TIME_FORMAT),
    };
  }

  private convertAttachmentToAttachmentRawValue(
    attachment: IAttachment | (Partial<NewAttachment> & AttachmentFormDefaults),
  ): AttachmentFormRawValue | PartialWithRequiredKeyOf<NewAttachmentFormRawValue> {
    return {
      ...attachment,
      uploadedDate: attachment.uploadedDate ? attachment.uploadedDate.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
